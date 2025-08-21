import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const webhookEventSchema = new mongoose.Schema({
  // Event identifiers
  stripeEventId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  eventType: { 
    type: String, 
    required: true,
    index: true
  },
  
  // Processing status
  status: {
    type: String,
    enum: ['received', 'processing', 'completed', 'failed', 'retrying'],
    default: 'received',
    index: true
  },
  
  // Event data
  eventData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // Processing results
  processedAt: { type: Date },
  processingError: { type: String },
  processingResult: { type: mongoose.Schema.Types.Mixed },
  
  // Related records
  userId: { 
    type: mongoose.Schema.ObjectId, 
    ref: 'User',
    index: true
  },
  pageId: { 
    type: mongoose.Schema.ObjectId, 
    ref: 'CheckoutPage'
  },
  paymentId: { 
    type: mongoose.Schema.ObjectId, 
    ref: 'Payment'
  },
  
  // Request details
  requestHeaders: { type: mongoose.Schema.Types.Mixed },
  signature: { type: String },
  rawBody: { type: String },
  
  // Retry tracking
  retryCount: { type: Number, default: 0 },
  lastRetryAt: { type: Date },
  nextRetryAt: { type: Date },
  
}, {
  timestamps: true,
});

// Indexes for performance
webhookEventSchema.index({ eventType: 1, createdAt: -1 });
webhookEventSchema.index({ status: 1, createdAt: -1 });
webhookEventSchema.index({ userId: 1, createdAt: -1 });

// TTL index to automatically delete old webhook events after 90 days
webhookEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Add pagination plugin
webhookEventSchema.plugin(mongoosePaginate);

export default mongoose.model('WebhookEvent', webhookEventSchema);
