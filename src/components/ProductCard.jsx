import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistance } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { FiTrash2, FiEdit2 } from 'react-icons/fi';
import { useProductStore } from '../store/productStore';

export default function ProductCard({ product, onEdit }) {
  const { t, i18n } = useTranslation();
  const deleteProduct = useProductStore((state) => state.deleteProduct);
  const getDaysUntilExpiry = useProductStore((state) => state.getDaysUntilExpiry);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const daysLeft = getDaysUntilExpiry(product.expirationDate);
  const locale = i18n.language === 'ar' ? ar : enUS;
  const isExpired = daysLeft < 0;
  const expiringToday = daysLeft === 0;
  const expiringTomorrow = daysLeft === 1;

  const getStatusColor = () => {
    if (isExpired) return 'bg-red-100 text-red-800';
    if (expiringToday) return 'bg-orange-100 text-orange-800';
    if (expiringTomorrow) return 'bg-yellow-100 text-yellow-800';
    if (daysLeft <= 7) return 'bg-amber-100 text-amber-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = () => {
    if (isExpired) return t('expired');
    if (expiringToday) return t('expiringToday');
    if (expiringTomorrow) return t('expiringTomorrow');
    return t('expiringIn', { days: daysLeft });
  };

  const handleDelete = () => {
    deleteProduct(product.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span>📦</span>
          </div>
        )}
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor()}`}>
          {getStatusText()}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Product Name and Code */}
        <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          {t('productCode')}: <span className="font-mono">{product.code}</span>
        </p>

        {/* Category and Quantity */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
          <div>
            <span className="text-gray-600">{t('category')}:</span>
            <p className="font-medium text-gray-800">{t(`categories.${product.category}`)}</p>
          </div>
          <div>
            <span className="text-gray-600">{t('quantity')}:</span>
            <p className="font-medium text-gray-800">{product.quantity}</p>
          </div>
        </div>

        {/* Location */}
        <p className="text-sm text-gray-600 mb-3">
          {t('location')}: <span className="font-medium">{product.location}</span>
        </p>

        {/* Expiration Date */}
        <div className="bg-gray-50 p-2 rounded mb-3">
          <p className="text-xs text-gray-600">{t('expirationDate')}</p>
          <p className="text-sm font-semibold text-gray-800">
            {new Date(product.expirationDate).toLocaleDateString(
              i18n.language === 'ar' ? 'ar-SA' : 'en-US'
            )}
          </p>
        </div>

        {/* Days Remaining Display */}
        <div className={`p-2 rounded-lg mb-3 text-center ${
          isExpired 
            ? 'bg-red-50 text-red-700' 
            : expiringToday 
            ? 'bg-orange-50 text-orange-700'
            : 'bg-blue-50 text-blue-700'
        }`}>
          <p className="text-lg font-bold">
            {Math.abs(daysLeft)} {daysLeft === 1 ? t('daysRemaining') : ''}
          </p>
          {!isExpired && daysLeft !== 1 && (
            <p className="text-xs">{t('daysRemaining')}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition text-sm"
          >
            <FiEdit2 size={16} />
            {t('edit')}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition text-sm"
          >
            <FiTrash2 size={16} />
            {t('delete')}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <p className="text-gray-800 mb-4">
              {t('delete')} "{product.name}"?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
