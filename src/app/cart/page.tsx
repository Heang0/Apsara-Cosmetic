'use client';

import Layout from '@/components/Layout';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { TrashIcon, MinusIcon, PlusIcon, ArrowLeftIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

export default function CartPage() {
  const { language } = useLanguage();
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const cartTitle = language === 'km' ? 'កន្ត្រកទំនិញ' : 'Shopping Cart';
  const emptyCartText = language === 'km' ? 'កន្ត្រកទំនិញរបស់អ្នកទទេ' : 'Your cart is empty';
  const continueShoppingText = language === 'km' ? 'បន្តទិញទំនិញ' : 'Continue shopping';
  const eachText = language === 'km' ? 'ក្នុងមួយដុំ' : 'each';
  const totalText = language === 'km' ? 'សរុប' : 'Total';
  const clearCartText = language === 'km' ? 'ទទេរកន្ត្រក' : 'Clear Cart';
  const checkoutText = language === 'km' ? 'បន្តការបង់ប្រាក់' : 'Checkout';
  const removeText = language === 'km' ? 'លុប' : 'Remove';

  if (items.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
          <h1 className="khmer-text text-2xl sm:text-3xl font-light text-gray-900 mb-2">{cartTitle}</h1>
          <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-12 text-center">
            <ShoppingBagIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="khmer-text text-gray-400 text-lg mb-4">{emptyCartText}</p>
            <Link 
              href="/products" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span className={language === 'km' ? 'khmer-text' : 'english-text'}>
                {continueShoppingText}
              </span>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <Link 
            href="/products" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className={language === 'km' ? 'khmer-text' : 'english-text'}>
              {continueShoppingText}
            </span>
          </Link>
          <button
            onClick={clearCart}
            className="text-sm text-gray-500 hover:text-red-600 transition"
          >
            <span className={language === 'km' ? 'khmer-text' : 'english-text'}>
              {clearCartText}
            </span>
          </button>
        </div>

        <h1 className="khmer-text text-2xl sm:text-3xl font-light text-gray-900 mb-6">{cartTitle}</h1>

        {/* Cart Items */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {items.map((item) => (
            <div key={item._id} className="p-4 border-b last:border-b-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Product Image and Name */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={language === 'km' ? item.name : item.nameEn}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBagIcon className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={'text-sm font-medium text-gray-900 mb-1 line-clamp-2 ' + (language === 'km' ? 'khmer-text' : 'english-text')}>
                      {language === 'km' ? item.name : item.nameEn}
                    </h3>
                    <p className="english-text text-xs text-gray-500">
                      <span className="english-text">{formatPrice(item.price)}</span>{' '}
                      <span className={language === 'km' ? 'khmer-text' : 'english-text'}>{eachText}</span>
                    </p>
                  </div>
                </div>

                {/* Quantity and Price */}
                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                  <div className="flex items-center gap-1 border border-gray-200 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="p-2 hover:bg-gray-50 rounded-l-lg transition"
                    >
                      <MinusIcon className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm english-text">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="p-2 hover:bg-gray-50 rounded-r-lg transition"
                    >
                      <PlusIcon className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="english-text text-sm font-medium min-w-[70px] text-right">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-gray-400 hover:text-red-600 transition p-1"
                      title={removeText}
                    >
                      <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Cart Footer */}
          <div className="p-4 sm:p-6 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <span className="khmer-text font-medium text-lg">{totalText}</span>
              <span className="english-text text-2xl font-bold text-gray-900">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Link
                href="/products"
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-center"
              >
                <span className={language === 'km' ? 'khmer-text' : 'english-text'}>
                  {continueShoppingText}
                </span>
              </Link>
              <Link
                href="/checkout"
                className="w-full sm:w-auto px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-center"
              >
                <span className={language === 'km' ? 'khmer-text' : 'english-text'}>
                  {checkoutText}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}