"use client";

import React, { useState } from "react";
import { MenuItem, Category, DietaryType } from "@/types";
import { X, Sparkles, Check, Image as ImageIcon } from "lucide-react";

interface EditItemModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onSave: (updatedItem: MenuItem) => void;
}

const CATEGORIES: Category[] = [
  "Burgers",
  "Parathas",
  "Chinese",
  "Fried Rice",
  "Pasta",
  "Maggi",
  "Fries",
  "Bowls",
];

export function EditItemModal({ item, onClose, onSave }: EditItemModalProps) {
  if (!item) return null;

  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState<Category>(item.category);
  const [price, setPrice] = useState(item.price);
  const [description, setDescription] = useState(item.description);
  const [dietary, setDietary] = useState<DietaryType>(item.dietary);
  const [tag, setTag] = useState(item.tag || "");
  const [preparationTime, setPreparationTime] = useState(item.preparationTime || "20 mins");
  const [image, setImage] = useState(item.image);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...item,
      name: name.trim(),
      category,
      price: Number(price),
      description: description.trim(),
      dietary,
      tag: tag.trim() || undefined,
      preparationTime: preparationTime.trim() || undefined,
      image: image.trim(),
    });
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto overscroll-contain animate-in fade-in"
    >
      <div className="relative w-full max-w-xl bg-[#FAF8F5] rounded-3xl border border-[#E7E0D8] shadow-2xl p-6 sm:p-8 my-8 overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E7E0D8] pb-4 mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C] bg-[#FED7AA]/50 px-2.5 py-0.5 rounded-full">
              Menu Configuration
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#1C1917] mt-1">
              Edit Dish Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#E7E0D8] bg-[#F5EFEB] flex items-center justify-center text-[#78716C] hover:text-[#1C1917]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Dish Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E0D8] bg-white text-xs text-[#1C1917] focus:border-[#C2410C] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E0D8] bg-white text-xs text-[#1C1917] focus:border-[#C2410C] focus:outline-hidden"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Price in INR (₹) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E0D8] bg-white text-xs font-semibold text-[#1C1917] focus:border-[#C2410C] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Dietary Indicator *
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDietary("veg")}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    dietary === "veg"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800 ring-1 ring-emerald-400"
                      : "bg-white border-[#E7E0D8] text-[#78716C]"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>Vegetarian</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDietary("non-veg")}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    dietary === "non-veg"
                      ? "bg-rose-50 border-rose-300 text-rose-800 ring-1 ring-rose-400"
                      : "bg-white border-[#E7E0D8] text-[#78716C]"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  <span>Non-Veg</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Tag / Badge
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g. Chef's Signature, Bestseller"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E0D8] bg-white text-xs text-[#1C1917] focus:border-[#C2410C] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Prep Time
              </label>
              <input
                type="text"
                value={preparationTime}
                onChange={(e) => setPreparationTime(e.target.value)}
                placeholder="e.g. 18 mins"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E7E0D8] bg-white text-xs text-[#1C1917] focus:border-[#C2410C] focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#E7E0D8] bg-white text-xs text-[#1C1917] focus:border-[#C2410C] focus:outline-hidden"
                />
                <img
                  src={image}
                  alt="preview"
                  className="w-10 h-10 rounded-xl object-cover border border-[#E7E0D8] shrink-0"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Culinary Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#E7E0D8] bg-white text-xs text-[#1C1917] focus:border-[#C2410C] focus:outline-hidden resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E7E0D8]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#E7E0D8] bg-white text-xs font-semibold text-[#78716C] hover:text-[#1C1917]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
