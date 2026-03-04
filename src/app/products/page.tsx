'use client';

import { useState, useEffect, useRef } from 'react';
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
      const res = await fetch('/api/products');
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

  const filterProducts = () => {
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
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Scroll to products section smoothly
    document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const bannerTitle = language === 'km' ? 'សម្រស់បែបខ្មែរ' : 'Khmer Beauty';
  const bannerSubtitle = language === 'km' 
    ? 'រក្សាសម្រស់តាមបែបប្រពៃណីខ្មែរ' 
    : 'Discover traditional Khmer cosmetics';
  const searchPlaceholder = language === 'km' 
    ? 'ស្វែងរកផលិតផល...' 
    : 'Search products...';
  const noProductsText = language === 'km' ? 'រកមិនឃើញផលិតផលទេ' : 'No products found';
  const allCategoriesText = language === 'km' ? 'ទាំងអស់' : 'All';

  return (
    <Layout>
      {/* Hero Banner with Parallax Effect */}
      <div className="w-full h-64 md:h-96 bg-cover bg-center relative mb-8 overflow-hidden" 
           style={{ 
             backgroundImage: 'url(https://static.vecteezy.com/system/resources/previews/009/731/074/non_2x/cosmetics-or-skin-care-product-ads-with-bottle-banner-ad-for-beauty-products-leaf-and-sea-background-glittering-light-effect-design-vector.jpg)',
             backgroundAttachment: 'fixed'
           }}>
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center animate-fade-in">
          <div className="text-center text-white transform transition-transform duration-700 hover:scale-105">
            <h1 className="khmer-text text-3xl md:text-5xl font-light mb-2 animate-slide-up">
              {bannerTitle}
            </h1>
            <p className={(language === 'km' ? 'khmer-text' : 'english-text') + ' text-lg md:text-xl opacity-90 animate-slide-up animation-delay-200'}>
              {bannerSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar with Fade In */}
      <div className="px-4 mb-6 animate-fade-in animation-delay-400">
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className={(language === 'km' ? 'khmer-text' : 'english-text') + ' w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-300 hover:shadow-md'}
          />
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Categories with Staggered Animation */}
      {categories.length > 0 && (
        <div className="px-4 mb-8 animate-fade-in animation-delay-600">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCategory('all')}
              className={'px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-md ' + 
                (selectedCategory === 'all'
                  ? 'bg-gray-900 text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ) + ' ' + (language === 'km' ? 'khmer-text' : 'english-text')}
            >
              {allCategoriesText}
            </button>

            {categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.originalName)}
                className={'px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-md ' + 
                  (selectedCategory === category.originalName
                    ? 'bg-gray-900 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ) + ' ' + (language === 'km' ? 'khmer-text' : 'english-text')}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid with Staggered Cards */}
      <div id="products-grid" className="px-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl aspect-square animate-pulse" 
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
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            
            {/* Infinite Scroll Loader */}
            {hasMore && (
              <div ref={loaderRef} className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-xl animate-fade-in">
            <p className="khmer-text text-gray-400 text-lg mb-2">{noProductsText}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
