'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBagIcon, XMarkIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export default function FloatingCart() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (items.length > 0) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
      setIsOpen(false);
    }
  }, [items]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const cartText = language === 'km' ? 'កន្ត្រកទំនិញ' : 'Cart';
  const viewCartText = language === 'km' ? 'មើលកន្ត្រក' : 'View Cart';
  const checkoutText = language === 'km' ? 'ទូទាត់' : 'Checkout';
  const emptyCartText = language === 'km' ? 'កន្ត្រកទទេ' : 'Cart is empty';
  const totalText = language === 'km' ? 'សរុប' : 'Total';

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100]"> {/* Increased z-index */}
      {/* Cart Bar */}
      <div 
        className="bg-gray-900 text-white shadow-lg cursor-pointer transition-all duration-300 relative z-[101]" /* Added relative and higher z-index */
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <ShoppingBagIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="khmer-text text-xs sm:text-sm">{cartText}</span>
              <span className="bg-white text-gray-900 px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold english-text">
                {totalItems}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="english-text text-sm sm:text-base font-medium">
                {formatPrice(totalPrice)}
              </span>
              <button 
                className="text-white opacity-80 hover:opacity-100 text-xs sm:text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(!isOpen);
                }}
              >
                {isOpen ? '▼' : '▲'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Cart */}
      {isOpen && (
        <div className="bg-white border-t border-gray-200 shadow-xl max-h-[80vh] overflow-auto relative z-[102]"> {/* Higher z-index */}
          <div className="container mx-auto px-2 sm:px-4 py-4">
            {items.length === 0 ? (
              <p className="text-center text-gray-500 py-4 text-sm">
                <span className={language === 'km' ? 'khmer-text' : 'english-text'}>{emptyCartText}</span>
              </p>
            ) : (
              <>
                <div className="space-y-2 sm:space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item._id} className="flex items-center gap-2 sm:gap-3 bg-gray-50 p-2 sm:p-3 rounded-lg">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={language === 'km' ? item.name : item.nameEn}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBagIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={'text-xs sm:text-sm font-medium text-gray-900 truncate ' + (language === 'km' ? 'khmer-text' : 'english-text')}>
                          {language === 'km' ? item.name : item.nameEn}
                        </p>
                        <p className="english-text text-xs text-gray-500">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(item._id, item.quantity - 1);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <MinusIcon className="w-3 h-3" />
                        </button>
                        <span className="w-5 sm:w-6 text-center text-xs sm:text-sm english-text">{item.quantity}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(item._id, item.quantity + 1);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <PlusIcon className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2">
                        <p className="english-text text-xs sm:text-sm font-medium min-w-[50px] sm:min-w-[60px] text-right">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(item._id);
                          }}
                          className="text-gray-400 hover:text-red-600 transition p-1"
                        >
                          <XMarkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer with buttons - Fixed clickability */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      <span className={language === 'km' ? 'khmer-text' : 'english-text'}>{totalText}:</span>{' '}
                      <span className="english-text font-bold text-gray-900">{formatPrice(totalPrice)}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Link
                      href="/cart"
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition text-center cursor-pointer z-[103]" /* Added cursor-pointer and higher z-index */
                      onClick={() => setIsOpen(false)}
                    >
                      <span className={language === 'km' ? 'khmer-text' : 'english-text'}>{viewCartText}</span>
                    </Link>
                    <button 
                      type="button"
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition cursor-pointer z-[103]" /* Added cursor-pointer and higher z-index */
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                        router.push('/checkout');
                      }}
                    >
                      <span className={language === 'km' ? 'khmer-text' : 'english-text'}>{checkoutText}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
