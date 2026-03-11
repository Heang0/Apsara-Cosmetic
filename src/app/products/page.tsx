'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useLanguage } from '@/context/LanguageContext';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Product {
  _id: string;
  name: string;
  nameEn: string;
  slug: string;
  price: number;
  images: string[];
  isOnSale?: boolean;
  salePrice?: number;
  category: string;
  categoryEn: string;
}

interface Category {
  id: string;
  name: string;
  originalName: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleProducts, setVisibleProducts] = useState<number>(8);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    updateCategories();
    filterProducts();
  }, [language, products]);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleProducts((prev) => Math.min(prev + 4, filteredProducts.length));
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, filteredProducts.length]);

  // Update hasMore when filtered products change
  useEffect(() => {
    setVisibleProducts(8);
    setHasMore(filteredProducts.length > 8);
  }, [filteredProducts]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products', {
        next: { revalidate: 60 } // ISR: Revalidate every 60 seconds
      });
      const rawData = await res.json();
      const data: Product[] = Array.isArray(rawData) ? rawData : [];

      if (!res.ok) {
        const errorMessage = (rawData && typeof rawData === 'object' && 'error' in rawData)
          ? String((rawData as { error?: unknown }).error)
          : 'Failed to fetch products';
        throw new Error(errorMessage);
      }

      if (!Array.isArray(rawData)) {
        console.error('Products API returned non-array response:', rawData);
      }

      setProducts(data);
      setFilteredProducts(data);

      const uniqueCategoryNames = [...new Set(data.map((product) => product.category))];
      const uniqueCats: Category[] = uniqueCategoryNames.map((catName) => {
        const product = data.find((item) => item.category === catName);
        return {
          id: catName,
          name: language === 'km' ? catName : (product?.categoryEn || catName),
          originalName: catName
        };
      });

      setCategories(uniqueCats);
    } catch (error) {
      console.error('Error:', error);
      setProducts([]);
      setFilteredProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const updateCategories = () => {
    const uniqueCategoryNames = [...new Set(products.map(p => p.category))];
    
    const uniqueCats: Category[] = uniqueCategoryNames.map((catName) => {
      const product = products.find(p => p.category === catName);
      return {
        id: catName,
        name: language === 'km' ? catName : (product?.categoryEn || catName),
        originalName: catName
      };
    });
    
    setCategories(uniqueCats);
  };

  const filterProducts = useCallback(() => {
    let filtered = [...products];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => {
        const name = language === 'km' ? p.name.toLowerCase() : p.nameEn.toLowerCase();
        return name.includes(query);
      });
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery, language]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const searchPlaceholder = language === 'km' 
    ? 'ស្វែងរកផលិតផល...' 
    : 'Search products...';
  const noProductsText = language === 'km' ? 'រកមិនឃើញផលិតផលទេ' : 'No products found';
  const allCategoriesText = language === 'km' ? 'ទាំងអស់' : 'All';

  return (
    <Layout>
      {/* Hero Banner - Clean Modern Design */}
      <div className="relative w-full h-[150px] sm:h-[300px] lg:h-[500px] mb-12 overflow-hidden">
        <img
          src="/images/banners/bannner.jpg"
          alt="Beauty banner"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-8 relative z-10">
        {/* Search Bar */}
        <div className="animate-fade-in mb-6 sm:mb-8">
          <div className="relative max-w-2xl mx-auto px-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className={(language === 'km' ? 'khmer-text' : 'english-text') + ' w-full px-4 py-3 sm:px-5 sm:py-4 pl-12 sm:pl-14 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all duration-300 hover:shadow-lg'}
            />
            <MagnifyingGlassIcon className="absolute left-4 sm:left-5 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="animate-fade-in animation-delay-200 mb-6 sm:mb-8">
            <div className="relative">
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 min-w-max justify-start pr-12">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={'px-6 py-2.5 rounded-full text-sm font-medium flex-shrink-0 transition-all duration-300 ' +
                      (selectedCategory === 'all'
                        ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      ) + ' ' + (language === 'km' ? 'khmer-text' : 'english-text')}
                  >
                    {allCategoriesText}
                  </button>

                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.originalName)}
                      className={'px-6 py-2.5 rounded-full text-sm font-medium flex-shrink-0 transition-all duration-300 ' +
                        (selectedCategory === category.originalName
                          ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                        ) + ' ' + (language === 'km' ? 'khmer-text' : 'english-text')}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clean Arrow Indicator */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div id="products-grid">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl aspect-square animate-pulse"
                     style={{ animationDelay: `${i * 100}ms` }}></div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.slice(0, visibleProducts).map((product, index) => (
                  <div
                    key={product._id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Infinite Scroll Loader */}
              {hasMore && (
                <div ref={loaderRef} className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl">
              <p className="khmer-text text-gray-400 text-lg">{noProductsText}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
