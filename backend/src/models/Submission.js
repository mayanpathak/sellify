import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    pageId: {
        type: mongoose.Schema.ObjectId,
        ref: 'CheckoutPage',
        required: true,
        index: true
    },
    formData: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        required: true
    },
}, {
    timestamps: true
});

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
