import ItemReport from '../models/ItemReport.js';
import { calculateItemMatch } from '../utils/matchAlgorithm.js';

/**
 * Find potential matches for an item report
 * GET /api/items/:id/matches
 */
export const getPotentialMatches = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sourceItem = await ItemReport.findById(id).lean();
    if (!sourceItem) {
      return res.status(404).json({
        success: false,
        message: 'Item report not found.'
      });
    }

    // Determine opposite report type
    const candidateReportType = sourceItem.reportType === 'lost' ? 'found' : 'lost';

    // Query candidate items that are open or claim_pending (exclude resolved and self)
    const candidates = await ItemReport.find({
      _id: { $ne: sourceItem._id },
      reportType: candidateReportType,
      status: { $in: ['open', 'claim_pending'] }
    })
      .populate('reporter', 'name')
      .lean();

    // Score candidates using our rule-based matching algorithm
    const matches = candidates
      .map((candidate) => {
        const matchResult = calculateItemMatch(sourceItem, candidate);
        return {
          item: {
            ...candidate,
            reporter: {
              _id: candidate.reporter?._id,
              name: candidate.reporter?.name || 'Campus Member'
            }
          },
          score: matchResult.score,
          matchStrength: matchResult.matchStrength,
          reasons: matchResult.reasons
        };
      })
      .filter((m) => m.score >= 20) // Filter out items with very low similarity
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Return top 10 best matches

    return res.status(200).json({
      success: true,
      sourceItem: {
        _id: sourceItem._id,
        title: sourceItem.title,
        category: sourceItem.category,
        reportType: sourceItem.reportType,
        location: sourceItem.location,
        eventDate: sourceItem.eventDate
      },
      data: matches
    });
  } catch (error) {
    next(error);
  }
};
