'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { ShoppingBagIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';

export default function ProductDetail() {
  const params = useParams();
  const { language } = useLanguage();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (params?.id) {
      fetchProduct();
    }
  }, [params?.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products?id=' + params.id);
      const data = await res.json();
      
      if (res.ok) {
        if (Array.isArray(data)) {
          setProduct(data[0] || null);
          if (data[0]) {
            fetchRelatedProducts(data[0].category);
          }
        } else {
          setProduct(data);
          if (data) {
            fetchRelatedProducts(data.category);
          }
        }
      } else {
        setError(data.error || 'Failed to load product');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (category: string) => {
    try {
      const res = await fetch('/api/products?category=' + encodeURIComponent(category));
      const data = await res.json();
      const filtered = data.filter((p: any) => p._id !== params.id).slice(0, 4);
      setRelatedProducts(filtered);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const getOptimizedImage = (url: string, width: number = 600) => {
    if (!url) return '';
    if (url.includes('cloudinary')) {
      return url.replace('/upload/', '/upload/w_' + width + ',c_fill,q_auto,f_auto/');
    }
    return url;
  };

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return '$0.00';
    return '$' + price.toFixed(2);
  };

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4 sm:mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              <div className="h-64 sm:h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-3 sm:space-y-4">
                <div className="h-8 sm:h-10 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3 mt-4"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 text-center py-12">
          <p className="khmer-text text-gray-400 text-lg mb-2">ផលិតផលមិនត្រូវបានរកឃើញទេ</p>
          <p className="english-text text-gray-400 mb-4">Product not found</p>
          <Link href="/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition bg-gray-100 px-4 py-2 rounded-lg">
            <ArrowLeftIcon className="w-4 h-4" />
            <span className={language === 'km' ? 'khmer-text' : 'english-text'}>
              {language === 'km' ? 'ត្រលប់ទៅផលិតផល' : 'Back to products'}
            </span>
          </Link>
        </div>
      </Layout>
    );
  }

  const productName = language === 'km' ? product.name : product.nameEn;
  const addToCartText = language === 'km' ? 'ដាក់ចូលថង់' : 'Add to cart';
  const quantityText = language === 'km' ? 'ចំនួន:' : 'Quantity:';
  const inStockText = language === 'km' ? 'នៅក្នុងស្តុក' : 'in stock';
  const outOfStockText = language === 'km' ? 'អស់ពីស្តុក' : 'Out of stock';
  const relatedText = language === 'km' ? 'ផលិតផលស្រដៀងគ្នា' : 'Related Products';
  const displayPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;
  const originalPrice = product.isOnSale ? product.price : null;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
        {/* Back button */}
        <div className="mb-4 sm:mb-8">
          <Link 
            href="/products" 
            className="inline-flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900 transition bg-gray-100 hover:bg-gray-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm"
          >
            <ArrowLeftIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className={language === 'km' ? 'khmer-text' : 'english-text'}>
              {language === 'km' ? 'ត្រលប់' : 'Back'}
            </span>
          </Link>
        </div>

        {/* Product Detail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-16">
          {/* Images */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-2 sm:mb-4 shadow-sm">
              {product.images && product.images.length > 0 ? (
                <img
                  src={getOptimizedImage(product.images[selectedImage], 600)}
                  alt={productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBagIcon className="w-12 h-12 sm:w-20 sm:h-20 text-gray-300" />
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-1 sm:gap-2">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={'aspect-square rounded-lg overflow-hidden border-2 transition-all ' + (selectedImage === idx ? 'border-gray-900 shadow-md' : 'border-transparent hover:border-gray-300')}
                  >
                    <img
                      src={getOptimizedImage(img, 150)}
                      alt={productName + ' ' + (idx + 1)}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-3 sm:space-y-6">
            <div>
              {/* Bigger title on mobile */}
              <h1 className={'text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-3 ' + (language === 'km' ? 'khmer-text' : 'english-text')}>
                {productName}
              </h1>
              {product.description && (
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  <span className={language === 'km' ? 'khmer-text' : 'english-text'}>
                    {product.description}
                  </span>
                </p>
              )}
            </div>
            
            <div className="border-t border-b border-gray-100 py-3 sm:py-6">
              <div className="mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900 english-text">
                  {formatPrice(displayPrice)}
                </span>
                {originalPrice && (
                  <span className="text-base sm:text-lg text-gray-400 line-through ml-2 sm:ml-3 english-text">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-2 sm:gap-4">
                <span className={(language === 'km' ? 'khmer-text' : 'english-text') + ' text-xs sm:text-sm text-gray-700'}>
                  {quantityText}
                </span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-gray-50 transition rounded-l-lg text-sm sm:text-base"
                  >
                    -
                  </button>
                  <span className="px-4 sm:px-6 py-1.5 sm:py-2 border-x border-gray-300 min-w-[45px] sm:min-w-[60px] text-center english-text text-sm sm:text-base">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-gray-50 transition rounded-r-lg text-sm sm:text-base"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button 
              onClick={handleAddToCart}
              className="w-full bg-gray-900 text-white py-3 sm:py-4 rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-2 text-base sm:text-lg font-medium"
            >
              <ShoppingBagIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className={language === 'km' ? 'khmer-text' : 'english-text'}>{addToCartText}</span>
            </button>

            {/* Stock Info */}
            {product.stock > 0 ? (
              <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 sm:gap-2">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></span>
                <span className="english-text">{product.stock}</span>{' '}
                <span className={language === 'km' ? 'khmer-text' : 'english-text'}>{inStockText}</span>
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1 sm:gap-2">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full"></span>
                <span className={language === 'km' ? 'khmer-text' : 'english-text'}>{outOfStockText}</span>
              </p>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-100">
            <h2 className={'text-lg sm:text-2xl font-light mb-4 sm:mb-6 ' + (language === 'km' ? 'khmer-text' : 'english-text')}>
              {relatedText}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}