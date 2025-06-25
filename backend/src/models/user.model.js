// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Please provide your name'],
//     trim: true,
//   },
//   email: {
//     type: String,
//     required: [true, 'Please provide your email'],
//     unique: true,
//     lowercase: true,
//     trim: true,
//   },
//   password: {
//     type: String,
//     required: [true, 'Please provide a password'],
//     minlength: 8,
//     select: false, // Do not send password in query results
//   },
//   stripeCustomerId: {
//     type: String,
//   },
//   createdPages: [{
//     type: mongoose.Schema.ObjectId,
//     ref: 'CheckoutPage'
//   }]
// }, {
//   timestamps: true
// });

// // Hash password before saving the document
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// // Method to compare passwords
// userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
//   return await bcrypt.compare(candidatePassword, userPassword);
// };

// const User = mongoose.model('User', userSchema);

// export default User;



import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false, // Hide password in query results
  },

  // Stripe Fields
  stripeCustomerId: { type: String }, // For billing the user
  stripeAccountId: { type: String },  // For payouts (Stripe Connect)

  // SaaS Plan Details
  plan: {
    type: String,
    enum: ['free', 'builder', 'pro'],
    default: 'free',
  },
  trialExpiresAt: { type: Date },

  // Optional verification
  isVerified: { type: Boolean, default: false },

  // Relationship
  createdPages: [{
    type: mongoose.Schema.ObjectId,
    ref: 'CheckoutPage',
  }]
}, {
  timestamps: true,
});

// Combined pre-save hook for trial expiration and password hashing
userSchema.pre('save', async function (next) {
  try {
    // Set trial expiration on new user creation
    if (this.isNew && !this.trialExpiresAt) {
      const trialDays = parseInt(process.env.TRIAL_DURATION_DAYS, 10) || 7;
      this.trialExpiresAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);
    }
    
    // Hash password if modified
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
    
    next();
  } catch (error) {
    console.error('❌ User pre-save hook error:', error);
    next(error);
  }
});

// Compare passwords method
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
export default User;
