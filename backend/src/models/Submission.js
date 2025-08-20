import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    pageId: {
        type: mongoose.Schema.ObjectId,
        ref: 'CheckoutPage',
        required: true,
        index: true,
    },
    formData: {
        type: Map,
        of: mongoose.Schema.Types.Mixed, // supports all data types
        required: true,
    },
    // Payment linking
    paymentId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Payment',
        required: false,
        index: true,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'none'],
        default: 'none',
        index: true,
    },
    // Customer information
    customerEmail: { type: String },
    customerName: { type: String },
    
    // IP and tracking for analytics
    ipAddress: { type: String },
    userAgent: { type: String },
}, {
    timestamps: true,
});

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
