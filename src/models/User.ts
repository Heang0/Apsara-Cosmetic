import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, sparse: true },
  phone: { type: String },
  password: { type: String },
  telegramId: { type: String, unique: true, sparse: true },
  telegramUsername: String,
  telegramChatId: String,
  photoURL: String,
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
  addresses: [{
    name: String,
    phone: String,
    street: String,
    city: String,
    province: String,
    isDefault: { type: Boolean, default: false }
  }],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
});

// Hash password before saving if it exists
userSchema.pre('save', async function() {
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);