import React, { useState } from 'react';
import { Category } from '../types/budget';
import { AVAILABLE_ICONS, CategoryIcon } from './CategoryIcon';
import { X, Plus, Trash2, Check } from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSaveCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
}

const CATEGORY_COLORS = [
  '#10b981', // emerald
  '#f43f5e', // rose
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#84cc16', // lime
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategory,
  onDeleteCategory,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [color, setColor] = useState('#10b981');
  const [icon, setIcon] = useState('ShoppingBag');
  const [subCategoryInput, setSubCategoryInput] = useState('');
  const [subCategories, setSubCategories] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleAddSubCategory = () => {
    if (subCategoryInput.trim() && !subCategories.includes(subCategoryInput.trim())) {
      setSubCategories([...subCategories, subCategoryInput.trim()]);
      setSubCategoryInput('');
    }
  };

  const handleRemoveSubCategory = (sub: string) => {
    setSubCategories(subCategories.filter((s) => s !== sub));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCategory: Category = {
      id: `cat_${Date.now()}`,
      name: name.trim(),
      icon,
      color,
      type,
      subCategories,
    };

    onSaveCategory(newCategory);
    // Reset form
    setName('');
    setSubCategories([]);
    setActiveTab('list');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">Expense & Income Categories</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage custom categories, color themes & subcategories</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl mt-4">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'list'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Existing Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'create'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            + New Category
          </button>
        </div>

        {activeTab === 'list' ? (
          <div className="space-y-2.5 mt-5 max-h-[50vh] overflow-y-auto pr-1">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800/80 rounded-xl"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{cat.name}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-mono">
                        · {cat.type}
                      </span>
                    </div>
                    {cat.subCategories.length > 0 && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {cat.subCategories.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {cat.id !== 'cat_transfer' && (
                  <button
                    onClick={() => onDeleteCategory(cat.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-5">
            {/* Type */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    type === 'expense'
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                      : 'border-slate-800 text-slate-400'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    type === 'income'
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'border-slate-800 text-slate-400'
                  }`}
                >
                  Income
                </button>
              </div>
            </div>

            {/* Category Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Subscriptions or Pet Care"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-hidden"
              />
            </div>

            {/* Color Palette */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Color</label>
              <div className="flex items-center gap-2">
                {CATEGORY_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check size={14} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Icon</label>
              <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-xl">
                {AVAILABLE_ICONS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={`p-2 rounded-lg border transition-all ${
                      icon === i
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                        : 'border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CategoryIcon name={i} size={16} />
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-categories Builder */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Sub-categories (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Groceries"
                  value={subCategoryInput}
                  onChange={(e) => setSubCategoryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubCategory();
                    }
                  }}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddSubCategory}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1 font-medium"
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {subCategories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {subCategories.map((sub) => (
                    <span
                      key={sub}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] bg-slate-800 text-slate-200 border border-slate-700"
                    >
                      {sub}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubCategory(sub)}
                        className="hover:text-rose-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Back to List
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-medium bg-emerald-500 text-slate-950 rounded-lg hover:bg-emerald-400 transition-colors shadow-sm"
              >
                Create Category
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
