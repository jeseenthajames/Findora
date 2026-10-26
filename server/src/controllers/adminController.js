import ItemReport from '../models/ItemReport.js';
import ClaimRequest from '../models/ClaimRequest.js';
import User from '../models/User.js';

/**
 * Admin Overview & Statistics
 * GET /api/admin/overview
 */
export const getAdminOverview = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalReports,
      openReports,
      pendingClaims,
      resolvedReports,
      categoryCounts,
      recentReports
    ] = await Promise.all([
      User.countDocuments(),
      ItemReport.countDocuments(),
      ItemReport.countDocuments({ status: 'open' }),
      ClaimRequest.countDocuments({ status: 'pending' }),
      ItemReport.countDocuments({ status: 'resolved' }),
      ItemReport.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      ItemReport.find()
        .populate('reporter', 'name email')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean()
    ]);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalReports,
          openReports,
          pendingClaims,
          resolvedReports
        },
        categoryCounts,
        recentReports
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all reports for admin moderation
 * GET /api/admin/reports
 */
export const getAllReportsAdmin = async (req, res, next) => {
  try {
    const { status, reportType, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'All') query.status = status;
    if (reportType && reportType !== 'All') query.reportType = reportType;
    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [reports, total] = await Promise.all([
      ItemReport.find(query)
        .populate('reporter', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ItemReport.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin change item report status
 * PATCH /api/admin/reports/:id/status
 */
export const updateReportStatusAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'claim_pending', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status provided.'
      });
    }

    const item = await ItemReport.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item report not found.'
      });
    }

    item.status = status;
    if (status === 'resolved') {
      item.resolvedAt = new Date();
    } else {
      item.resolvedAt = null;
    }

    await item.save();

    return res.status(200).json({
      success: true,
      message: `Item report status updated to ${status}.`,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin delete item report
 * DELETE /api/admin/reports/:id
 */
export const deleteReportAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await ItemReport.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item report not found.'
      });
    }

    // Clean up claims
    await ClaimRequest.deleteMany({ item: id });

    return res.status(200).json({
      success: true,
      message: 'Item report and associated claim requests removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin get all claims
 * GET /api/admin/claims
 */
export const getAllClaimsAdmin = async (req, res, next) => {
  try {
    const claims = await ClaimRequest.find()
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
