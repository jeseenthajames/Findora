import mongoose from 'mongoose';

export const CLAIM_STATUSES = ['pending', 'approved', 'rejected'];

const claimRequestSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ItemReport',
      required: [true, 'Claimed item reference is required']
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Claim requester is required']
    },
    message: {
      type: String,
      required: [true, 'Please provide proof or details of ownership'],
      trim: true,
      minlength: [10, 'Claim explanation must be at least 10 characters'],
      maxlength: [600, 'Claim explanation cannot exceed 600 characters']
    },
    status: {
      type: String,
      enum: {
        values: CLAIM_STATUSES,
        message: '{VALUE} is not a valid claim status'
      },
      default: 'pending'
    },
    reviewedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes
claimRequestSchema.index({ item: 1, requester: 1 });
claimRequestSchema.index({ requester: 1, createdAt: -1 });
claimRequestSchema.index({ item: 1, status: 1 });

const ClaimRequest = mongoose.model('ClaimRequest', claimRequestSchema);
export default ClaimRequest;
