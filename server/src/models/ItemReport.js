import mongoose from 'mongoose';

export const ITEM_CATEGORIES = [
  'ID Cards & Documents',
  'Electronics',
  'Keys',
  'Bags & Wallets',
  'Books & Stationery',
  'Clothing & Accessories',
  'Bottles & Containers',
  'Other'
];

export const REPORT_TYPES = ['lost', 'found'];
export const ITEM_STATUSES = ['open', 'claim_pending', 'resolved'];

const itemReportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Item title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ITEM_CATEGORIES,
        message: '{VALUE} is not a valid category'
      }
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    reportType: {
      type: String,
      required: [true, 'Report type is required'],
      enum: {
        values: REPORT_TYPES,
        message: '{VALUE} is not a valid report type'
      }
    },
    location: {
      type: String,
      required: [true, 'Campus location is required'],
      trim: true,
      maxlength: [120, 'Location cannot exceed 120 characters']
    },
    eventDate: {
      type: Date,
      required: [true, 'Date lost or found is required']
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ITEM_STATUSES,
        message: '{VALUE} is not a valid status'
      },
      default: 'open'
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter is required']
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes for high performance searching, filtering, and sorting
itemReportSchema.index({ title: 'text', description: 'text', location: 'text' });
itemReportSchema.index({ reportType: 1, status: 1, category: 1, createdAt: -1 });
itemReportSchema.index({ reporter: 1, createdAt: -1 });

const ItemReport = mongoose.model('ItemReport', itemReportSchema);
export default ItemReport;
