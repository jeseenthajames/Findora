import ClaimRequest from '../models/ClaimRequest.js';
import ItemReport from '../models/ItemReport.js';

/**
 * Submit a claim request for a found item
 */
export const createClaim = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { message } = req.body;

    const item = await ItemReport.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item report not found.'
      });
    }

    if (item.reportType !== 'found') {
      return res.status(400).json({
        success: false,
        message: 'Claims can only be submitted for found items.'
      });
    }

    if (item.status === 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'This item has already been marked as resolved and cannot be claimed.'
      });
    }

    if (String(item.reporter) === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot submit a claim for an item you reported yourself.'
      });
    }

    // Check for duplicate pending claim by this requester
    const existingPendingClaim = await ClaimRequest.findOne({
      item: itemId,
      requester: req.user._id,
      status: 'pending'
    });

    if (existingPendingClaim) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending claim submitted for this item. Please wait for the finder to review it.'
      });
    }

    const claim = await ClaimRequest.create({
      item: itemId,
      requester: req.user._id,
      message: message.trim(),
      status: 'pending'
    });

    // Update item status to claim_pending if currently open
    if (item.status === 'open') {
      item.status = 'claim_pending';
      await item.save();
    }

    const populatedClaim = await ClaimRequest.findById(claim._id)
      .populate('item')
      .populate('requester', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Claim request submitted successfully! The finder has been notified.',
      data: populatedClaim
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get outgoing claims submitted by the authenticated user
 */
export const getMyClaims = async (req, res, next) => {
  try {
    const claims = await ClaimRequest.find({ requester: req.user._id })
      .populate('item')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: claims
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get incoming claims for items reported by the authenticated user
 */
export const getIncomingClaims = async (req, res, next) => {
  try {
    // Find all items reported by this user
    const userItems = await ItemReport.find({ reporter: req.user._id }).select('_id');
    const itemIds = userItems.map((i) => i._id);

    const claims = await ClaimRequest.find({ item: { $in: itemIds } })
      .populate('item')
      .populate('requester', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: claims
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve a claim request (reporter of item or admin)
 */
export const approveClaim = async (req, res, next) => {
  try {
    const { claimId } = req.params;

    const claim = await ClaimRequest.findById(claimId).populate('item');
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim request not found.'
      });
    }

    const item = await ItemReport.findById(claim.item._id || claim.item);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'The associated item report was not found.'
      });
    }

    const isItemReporter = String(item.reporter) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isItemReporter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only the finder of this item or an administrator can review claims.'
      });
    }

    if (item.status === 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'This item is already marked as resolved.'
      });
    }

    // Approve the claim
    claim.status = 'approved';
    claim.reviewedAt = new Date();
    await claim.save();

    // Mark the item as resolved
    item.status = 'resolved';
    item.resolvedAt = new Date();
    await item.save();

    // Automatically reject any other pending claims for this item
    await ClaimRequest.updateMany(
      { item: item._id, _id: { $ne: claim._id }, status: 'pending' },
      { $set: { status: 'rejected', reviewedAt: new Date() } }
    );

    const updatedClaim = await ClaimRequest.findById(claim._id)
      .populate('item')
      .populate('requester', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Claim approved successfully! The item has been marked as resolved.',
      data: updatedClaim
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a claim request (reporter of item or admin)
 */
export const rejectClaim = async (req, res, next) => {
  try {
    const { claimId } = req.params;

    const claim = await ClaimRequest.findById(claimId).populate('item');
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim request not found.'
      });
    }

    const item = await ItemReport.findById(claim.item._id || claim.item);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'The associated item report was not found.'
      });
    }

    const isItemReporter = String(item.reporter) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isItemReporter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only the finder of this item or an administrator can review claims.'
      });
    }

    claim.status = 'rejected';
    claim.reviewedAt = new Date();
    await claim.save();

    // Check if there are other pending claims on this item
    const otherPending = await ClaimRequest.countDocuments({
      item: item._id,
      status: 'pending'
    });

    // If no other pending claims and item is still claim_pending, revert to open
    if (otherPending === 0 && item.status === 'claim_pending') {
      item.status = 'open';
      await item.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Claim request rejected.',
      data: claim
    });
  } catch (error) {
    next(error);
  }
};
