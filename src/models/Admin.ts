import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'admin' },
  isEnvAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// No parameters, no next() call
adminSchema.pre('save', async function() {
  // Only hash if password is modified
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Add type to the parameter
adminSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Use const, not export default yet
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
export default Admin;