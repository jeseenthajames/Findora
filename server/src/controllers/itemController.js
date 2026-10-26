import ItemReport from '../models/ItemReport.js';
import ClaimRequest from '../models/ClaimRequest.js';

/**
 * Get all item reports with search, filtering, and pagination
 */
export const getItems = async (req, res, next) => {
  try {
    const {
      search,
      reportType,
      category,
      location,
      status,
      sortBy = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // Filter by reportType (lost / found)
    if (reportType && ['lost', 'found'].includes(reportType.toLowerCase())) {
      query.reportType = reportType.toLowerCase();
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by location
    if (location && location.trim()) {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Search by title or description
    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sortOption = { createdAt: -1 }; // newest first default
    if (sortBy === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sortBy === 'date') {
      sortOption = { eventDate: -1 };
    }

    const [items, total] = await Promise.all([
      ItemReport.find(query)
        .populate('reporter', 'name email role')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ItemReport.countDocuments(query)
    ]);

    // Format reporter to safeguard private details for public view
    const sanitizedItems = items.map((item) => {
      const isOwner = req.user && String(req.user._id) === String(item.reporter?._id);
      const isAdmin = req.user && req.user.role === 'admin';
      return {
        ...item,
        reporter: {
          _id: item.reporter?._id,
          name: item.reporter?.name || 'Campus Member',
          // Only reveal email to the reporter themselves or an admin
          email: isOwner || isAdmin ? item.reporter?.email : undefined
        }
      };
    });

    return res.status(200).json({
      success: true,
      data: sanitizedItems,
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
 * Get single item by ID
 */
export const getItemById = async (req, res, next) => {
  try {
    const item = await ItemReport.findById(req.params.id)
      .populate('reporter', 'name email role')
      .lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item report not found.'
      });
    }

    const isOwner = req.user && String(req.user._id) === String(item.reporter?._id);
    const isAdmin = req.user && req.user.role === 'admin';

    const sanitizedItem = {
      ...item,
      reporter: {
        _id: item.reporter?._id,
        name: item.reporter?.name || 'Campus Member',
        email: isOwner || isAdmin ? item.reporter?.email : undefined
      }
    };

    return res.status(200).json({
      success: true,
      data: sanitizedItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new lost or found report
 */
export const createItem = async (req, res, next) => {
  try {
    const { title, category, description, reportType, location, eventDate, imageUrl } = req.body;

    const newItem = await ItemReport.create({
      title: title.trim(),
      category,
      description: description.trim(),
      reportType,
      location: location.trim(),
      eventDate: new Date(eventDate),
      imageUrl: (imageUrl || '').trim(),
      status: 'open',
      reporter: req.user._id
    });

    const populatedItem = await ItemReport.findById(newItem._id)
      .populate('reporter', 'name email role')
      .lean();

    return res.status(201).json({
      success: true,
      message: `${reportType === 'lost' ? 'Lost' : 'Found'} item reported successfully.`,
      data: populatedItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing report (owner or admin only)
 */
export const updateItem = async (req, res, next) => {
  try {
    const item = await ItemReport.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item report not found.'
      });
    }

    // Permission check
    const isOwner = String(item.reporter) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to edit this report.'
      });
    }

    const { title, category, description, location, eventDate, imageUrl } = req.body;

    if (title) item.title = title.trim();
    if (category) item.category = category;
    if (description) item.description = description.trim();
    if (location) item.location = location.trim();
    if (eventDate) item.eventDate = new Date(eventDate);
    if (imageUrl !== undefined) item.imageUrl = imageUrl.trim();

    await item.save();

    const updated = await ItemReport.findById(item._id)
      .populate('reporter', 'name email role')
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Item report updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resolve an item report (owner or admin only)
 */
export const resolveItem = async (req, res, next) => {
  try {
    const item = await ItemReport.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item report not found.'
      });
    }

    const isOwner = String(item.reporter) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to resolve this report.'
      });
    }

    item.status = 'resolved';
    item.resolvedAt = new Date();
    await item.save();

    return res.status(200).json({
      success: true,
      message: 'Item report marked as resolved.',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an item report (owner or admin only)
 */
export const deleteItem = async (req, res, next) => {
  try {
    const item = await ItemReport.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item report not found.'
      });
    }

    const isOwner = String(item.reporter) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to delete this report.'
      });
    }

    await ItemReport.findByIdAndDelete(req.params.id);
    // Cleanup any claims associated with this item
    await ClaimRequest.deleteMany({ item: req.params.id });

    return res.status(200).json({
      success: true,
      message: 'Item report deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get items reported by currently authenticated user
 */
export const getMyItems = async (req, res, next) => {
  try {
    const items = await ItemReport.find({ reporter: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get real system statistics for homepage and dashboards
 */
export const getStats = async (req, res, next) => {
  try {
    const [
      totalReports,
      openReports,
      resolvedReports,
      lostCount,
      foundCount,
      pendingClaimsCount
    ] = await Promise.all([
      ItemReport.countDocuments(),
      ItemReport.countDocuments({ status: { $in: ['open', 'claim_pending'] } }),
      ItemReport.countDocuments({ status: 'resolved' }),
      ItemReport.countDocuments({ reportType: 'lost' }),
      ItemReport.countDocuments({ reportType: 'found' }),
      ClaimRequest.countDocuments({ status: 'pending' })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalReports,
        openReports,
        resolvedReports,
        lostCount,
        foundCount,
        pendingClaimsCount
      }
    });
  } catch (error) {
    next(error);
  }
};
