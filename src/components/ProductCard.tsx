'use client';

import Link from 'next/link';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    nameEn: string;
    slug: string;
    price: number;
    images: string[];
    isOnSale?: boolean;
    salePrice?: number;
  };
}

const getOptimizedImage = (url: string, width: number = 300) => {
  if (!url) return '';
  if (url.includes('cloudinary')) {
    return url.replace('/upload/', '/upload/w_' + width + ',c_fill,q_auto,f_auto/');
  }
  return url;
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price);
};

export default function ProductCard({ product }: ProductCardProps) {
  const { language } = useLanguage();
  const { addToCart } = useCart();
  
  const displayPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;
  const originalPrice = product.isOnSale ? product.price : null;
  const mainImage = product.images?.[0] || '';
  const productName = language === 'km' ? product.name : product.nameEn;
  const addToCartText = language === 'km' ? 'ដាក់ចូលថង់' : 'Add to cart';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    
    // Add a little animation effect
    const button = e.currentTarget;
    button.classList.add('scale-95');
    setTimeout(() => button.classList.remove('scale-95'), 100);
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover-lift">
      <Link href={'/products/' + product.slug} className="block aspect-square bg-gray-50 overflow-hidden">
        <div className="relative w-full h-full overflow-hidden">
          {mainImage ? (
            <img 
              src={getOptimizedImage(mainImage, 400)}
              alt={productName}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <ShoppingBagIcon className="w-12 h-12 text-gray-300 animate-float" />
            </div>
          )}
        </div>

        {product.isOnSale && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse">
            {language === 'km' ? 'បញ្ចុះតម្លៃ' : 'SALE'}
          </span>
        )}
      </Link>

      <div className="p-3">
        <Link href={'/products/' + product.slug} className="block">
          <h3 className={'text-sm font-medium text-gray-900 mb-1 line-clamp-1 transition-colors group-hover:text-gray-700 ' + (language === 'km' ? 'khmer-text' : 'english-text')}>
            {productName}
          </h3>
          
          <div className="flex items-baseline gap-2 mb-3">
            <span className="english-text text-base font-semibold text-gray-900">
              {formatPrice(displayPrice)}
            </span>
            {originalPrice && (
              <span className="english-text text-xs text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </Link>

        <button 
          onClick={handleAddToCart}
          className="w-full bg-gray-900 text-white py-2.5 text-sm font-medium rounded-lg hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-95"
        >
          <ShoppingBagIcon className="w-4 h-4 transition-transform group-hover:rotate-12" />
          <span className={language === 'km' ? 'khmer-text' : 'english-text'}>{addToCartText}</span>
        </button>
      </div>
    </div>
  );
}