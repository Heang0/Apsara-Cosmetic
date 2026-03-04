import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameEn: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  categoryEn: { type: String, required: true },
  images: [{ type: String, required: true }],
  stock: { type: Number, default: 0 },
  isOnSale: { type: Boolean, default: false },
  salePrice: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

productSchema.pre('save', function() {
  if (!this.slug && this.nameEn) {
    this.slug = this.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);