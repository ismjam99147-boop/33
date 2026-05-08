import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useProductStore } from '../store/productStore';
import { FiDownload, FiPrinter } from 'react-icons/fi';

export default function ReportsPage() {
  const { t } = useTranslation();
  const products = useProductStore((state) => state.products);
  const getDaysUntilExpiry = useProductStore((state) => state.getDaysUntilExpiry);
  const getProductsByCategory = useProductStore((state) => state.getProductsByCategory);

  // Calculate statistics
  const expiredProducts = products.filter((p) => getDaysUntilExpiry(p.expirationDate) < 0);
  const expiringProducts = products.filter((p) => {
    const days = getDaysUntilExpiry(p.expirationDate);
    return days >= 0 && days <= 7;
  });

  // Data by category
  const categories = ['food', 'beverages', 'medicine', 'cosmetics', 'dairy', 'preserved', 'other'];
  const categoryData = categories.map((cat) => ({
    name: t(`categories.${cat}`),
    total: getProductsByCategory(cat).length,
    expired: getProductsByCategory(cat).filter(
      (p) => getDaysUntilExpiry(p.expirationDate) < 0
    ).length,
  }));

  // Data by date
  const dateData = {};
  expiredProducts.forEach((p) => {
    const date = new Date(p.expirationDate).toLocaleDateString();
    dateData[date] = (dateData[date] || 0) + 1;
  });

  const dateChartData = Object.entries(dateData)
    .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
    .slice(0, 10)
    .map(([date, count]) => ({
      date,
      count,
    }));

  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#f97316'];

  const downloadPDF = async () => {
    const element = document.getElementById('report-content');
    const canvas = await html2canvas(element);
    const pdf = new jsPDF();
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    pdf.save('expired-products-report.pdf');
  };

  const handlePrint = () => {
    const printContent = document.getElementById('report-content');
    const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=600');
    windowPrint.document.write(printContent.innerHTML);
    windowPrint.document.close();
    windowPrint.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('expiredProductsReport')}</h1>
          <p className="text-blue-100">
            {t('totalProducts')}: {products.length} | {t('expiredProducts')}: {expiredProducts.length}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            <FiDownload size={20} />
            {t('downloadPDF')}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
          >
            <FiPrinter size={20} />
            {t('print')}
          </button>
        </div>

        {/* Report Content */}
        <div id="report-content" className="space-y-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{products.length}</div>
              <p className="text-gray-600 mt-2">{t('totalProducts')}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-red-600">{expiredProducts.length}</div>
              <p className="text-gray-600 mt-2">{t('expiredProducts')}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600">{expiringProducts.length}</div>
              <p className="text-gray-600 mt-2">{t('expiringProducts')}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6">
            {/* Category Bar Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t('byCategory')}</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#3b82f6" name={t('totalProducts')} />
                  <Bar dataKey="expired" fill="#ef4444" name={t('expiredProducts')} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Pie Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t('statistics')}</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Date Line Chart */}
          {dateChartData.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t('byDate')}</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dateChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ef4444" name={t('expiredProducts')} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Detailed Table */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('expiredProducts')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left">{t('productName')}</th>
                    <th className="px-4 py-2 text-left">{t('category')}</th>
                    <th className="px-4 py-2 text-left">{t('expirationDate')}</th>
                    <th className="px-4 py-2 text-left">{t('quantity')}</th>
                  </tr>
                </thead>
                <tbody>
                  {expiredProducts.map((product, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{product.name}</td>
                      <td className="px-4 py-2">{t(`categories.${product.category}`)}</td>
                      <td className="px-4 py-2 text-red-600 font-semibold">
                        {new Date(product.expirationDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">{product.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
