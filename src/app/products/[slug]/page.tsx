'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { ShoppingBagIcon, ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';

export default function ProductBySlug() {
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
    if (params?.slug && params.slug !== 'undefined') {
      fetchProductBySlug();
    }
  }, [params?.slug]);

  const fetchProductBySlug = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products?slug=' + params.slug);
      const data = await res.json();
      
      if (res.ok && data) {
        setProduct(data);
        if (data.category) {
          fetchRelatedProducts(data.category);
        }
      } else {
        setError('Product not found');
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
      const filtered = data.filter((p: any) => p.slug !== params.slug).slice(0, 4);
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

  const nextImage = () => {
    if (product?.images?.length > 0) {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images?.length > 0) {
      setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3 mt-6"></div>
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
        <div className="max-w-6xl mx-auto px-4 text-center py-16">
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
  const relatedText = language === 'km' ? 'ផលិតផលស្រដៀងគ្នា' : 'Related Products';
  const displayPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;
  const originalPrice = product.isOnSale ? product.price : null;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back button */}
        <div className="mb-6 md:mb-8">
          <Link 
            href="/products" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className={language === 'km' ? 'khmer-text' : 'english-text'}>
              {language === 'km' ? 'ត្រលប់' : 'Back'}
            </span>
          </Link>
        </div>

        {/* Product Detail - Mobile Optimized Spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {/* Images with Navigation Arrows - Always visible */}
          <div className="relative">
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm relative">
              {product.images && product.images.length > 0 ? (
                <img
                  src={getOptimizedImage(product.images[selectedImage], 600)}
                  alt={productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBagIcon className="w-20 h-20 text-gray-300" />
                </div>
              )}

              {/* Navigation Arrows - Always visible */}
              {product.images && product.images.length > 1 && (
                <>
                  {/* Left Arrow */}
                  <button
                    onClick={prevImage}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-800 hover:bg-white transition"
                    aria-label="Previous image"
                  >
                    <ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                  
                  {/* Right Arrow */}
                  <button
                    onClick={nextImage}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-800 hover:bg-white transition"
                    aria-label="Next image"
                  >
                    <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6" />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                    {selectedImage + 1} / {product.images.length}
                  </div>
                </>
              )}
            </div>
            
            {/* Thumbnail Navigation */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-1 md:gap-2 mt-2 md:mt-4">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx 
                        ? 'border-gray-900 shadow-md' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={getOptimizedImage(img, 150)}
                      alt={`${productName} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info - Reduced spacing on mobile */}
          <div className="space-y-3 md:space-y-6">
            <div>
              <h1 className={'text-2xl md:text-3xl lg:text-4xl font-bold ' + (language === 'km' ? 'khmer-text' : 'english-text')}>
                {productName}
              </h1>
              {product.description && (
                <p className="text-gray-600 leading-relaxed mt-1 md:mt-3">
                  <span className={language === 'km' ? 'khmer-text' : 'english-text'}>
                    {product.description}
                  </span>
                </p>
              )}
            </div>
            
            {/* Price Section */}
            <div className="py-2 md:py-4">
              <div className="mb-2 md:mb-4">
                <span className="text-2xl md:text-3xl font-bold text-gray-900 english-text">
                  {formatPrice(displayPrice)}
                </span>
                {originalPrice && (
                  <span className="text-base md:text-lg text-gray-400 line-through ml-2 md:ml-3 english-text">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>

              {/* Quantity Selector - Compact on mobile */}
              <div className="flex items-center gap-2 md:gap-4">
                <span className={(language === 'km' ? 'khmer-text' : 'english-text') + ' text-sm md:text-base text-gray-700'}>
                  {quantityText}
                </span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 md:px-4 py-1.5 md:py-2 hover:bg-gray-50 transition rounded-l-lg text-base md:text-lg"
                  >
                    -
                  </button>
                  <span className="px-4 md:px-6 py-1.5 md:py-2 border-x border-gray-300 min-w-[45px] md:min-w-[60px] text-center english-text text-base md:text-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 md:px-4 py-1.5 md:py-2 hover:bg-gray-50 transition rounded-r-lg text-base md:text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button 
              onClick={handleAddToCart}
              className="w-full bg-gray-900 text-white py-3 md:py-4 rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-2 text-base md:text-lg font-medium"
            >
              <ShoppingBagIcon className="w-4 h-4 md:w-5 md:h-5" />
              <span className={language === 'km' ? 'khmer-text' : 'english-text'}>{addToCartText}</span>
            </button>
          </div>
        </div>

        {/* Related Products Section - Closer on mobile */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 md:mt-16 pt-6 md:pt-10 border-t-2 border-gray-200">
            <div className="mb-4 md:mb-8 text-center">
              <h2 className={'text-xl md:text-2xl lg:text-3xl font-light mb-1 md:mb-2 ' + (language === 'km' ? 'khmer-text' : 'english-text')}>
                {relatedText}
              </h2>
              <div className="w-16 md:w-24 h-0.5 md:h-1 bg-gray-300 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
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