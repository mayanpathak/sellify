import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // Core identifiers
  userId: { 
    type: mongoose.Schema.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  pageId: { 
    type: mongoose.Schema.ObjectId, 
    ref: 'CheckoutPage', 
    required: true,
    index: true
  },
  submissionId: { 
    type: mongoose.Schema.ObjectId, 
    ref: 'Submission',
    required: false // Will be linked after submission creation
  },

  // Stripe identifiers
  stripeSessionId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  stripePaymentIntentId: { type: String },
  stripeAccountId: { type: String, required: true },

  // Payment details
  amount: { type: Number, required: true }, // Amount in cents
  currency: { type: String, required: true, default: 'usd' },
  applicationFeeAmount: { type: Number }, // Platform fee in cents
  
  // Payment status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  
  // Customer information
  customerEmail: { type: String },
  customerName: { type: String },
  
  // Metadata and tracking
  metadata: {
    type: Map,
    of: String,
    default: {}
  },
  
  // Timestamps for tracking
  paymentCompletedAt: { type: Date },
  stripeCreatedAt: { type: Date },
  
  // Error tracking
  lastError: {
    type: String,
    select: false // Don't include in normal queries
  },
  
  // Webhook processing
  webhookProcessed: { type: Boolean, default: false },
  webhookProcessedAt: { type: Date }
}, {
  timestamps: true,
});

// Indexes for performance
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ pageId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ stripeSessionId: 1 }, { unique: true });

// Instance methods
paymentSchema.methods.markAsCompleted = function(paymentIntent) {
  this.status = 'completed';
  this.paymentCompletedAt = new Date();
  this.stripePaymentIntentId = paymentIntent.id;
  this.webhookProcessed = true;
  this.webhookProcessedAt = new Date();
  
  // Extract customer info if available
  if (paymentIntent.receipt_email) {
    this.customerEmail = paymentIntent.receipt_email;
  }
  
  return this.save();
};

paymentSchema.methods.markAsFailed = function(error) {
  this.status = 'failed';
  this.lastError = error;
  this.webhookProcessed = true;
  this.webhookProcessedAt = new Date();
  
  return this.save();
};

// Static methods for analytics
paymentSchema.statics.getUserPaymentStats = function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
};

paymentSchema.statics.getPagePaymentStats = function(pageId) {
  return this.aggregate([
    { $match: { pageId: new mongoose.Types.ObjectId(pageId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
};

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
