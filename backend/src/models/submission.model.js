// import mongoose from 'mongoose';

// const submissionSchema = new mongoose.Schema({
//     pageId: {
//         type: mongoose.Schema.ObjectId,
//         ref: 'CheckoutPage',
//         required: true,
//     },
//     submittedData: {
//         type: Map,
//         of: String,
//         required: true
//     },
// }, {
//     timestamps: true
// });

// submissionSchema.index({ pageId: 1 });

// const Submission = mongoose.model('Submission', submissionSchema);

// export default Submission;
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
}, {
    timestamps: true,
});

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
