import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  type: { type: String, enum: ['text', 'email', 'number', 'textarea', 'checkbox'], default: 'text' },
  required: { type: Boolean, default: false }
}, { _id: false });

const orderBumpSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    recurring: { type: Boolean, default: false }
}, { _id: false });

const checkoutPageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true, index: true },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  title: { type: String, required: [true, 'A page must have a title'], trim: true },
  productName: { type: String, required: [true, 'A page must have a product name'], trim: true },
  description: { type: String, trim: true },
  price: { type: Number, required: [true, 'A product must have a price'], min: 0 },
  currency: { type: String, required: [true, 'A currency is required'], default: 'usd', lowercase: true },
  fields: [fieldSchema],
  successRedirectUrl: { type: String, trim: true },
  cancelRedirectUrl: { type: String, trim: true },
  layoutStyle: { type: String, enum: ['standard', 'modern', 'minimalist'], default: 'standard' },
  orderBumps: [orderBumpSchema],
}, { timestamps: true });

// Add indexes for performance
checkoutPageSchema.index({ userId: 1 });
checkoutPageSchema.index({ slug: 1 }, { unique: true });

const CheckoutPage = mongoose.model('CheckoutPage', checkoutPageSchema);
export default CheckoutPage;
