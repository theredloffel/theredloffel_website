"use client";

import React, { useState } from "react";
import { useKitchen } from "@/context/KitchenContext";
import { MenuItem, Category } from "@/types";
import { EditItemModal } from "./EditItemModal";
import {
  Search,
  Check,
  Edit2,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Filter,
} from "lucide-react";

export function MenuManager() {
  const {
    menuItems,
    toggleAvailability,
    updateItemPrice,
    updateItemDetails,
  } = useKitchen();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== "All" && item.category !== selectedCategory) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStartPriceEdit = (item: MenuItem) => {
    setEditingPriceId(item.id);
    setTempPrice(item.price);
  };

  const handleSavePrice = (itemId: string) => {
    if (tempPrice > 0) {
      updateItemPrice(itemId, tempPrice);
    }
    setEditingPriceId(null);
  };

  return (
    <div className="space-y-6">
      {/* Search and Category Filters */}
      <div className="bg-white p-5 rounded-3xl border border-[#E7E0D8] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search dish title, description, or ingredients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E7E0D8] bg-[#FAF8F5] text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-hidden focus:border-[#C2410C]"
          />
          <Search className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-3" />
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {["All", "Burgers", "Parathas", "Chinese", "Fried Rice", "Pasta", "Maggi", "Fries", "Bowls"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-[#1C1917] text-white"
                  : "bg-[#F5EFEB] text-[#78716C] hover:text-[#1C1917]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Table / List View */}
      <div className="bg-white rounded-3xl border border-[#E7E0D8] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E7E0D8] bg-[#F5EFEB]/60 text-[#78716C] uppercase font-bold text-[10px] tracking-wider">
                <th className="py-4 px-6">Dish Details</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Dietary</th>
                <th className="py-4 px-6">Price (₹ INR)</th>
                <th className="py-4 px-6">Stock Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EFEB]">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                  {/* Dish Title & Image */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#E7E0D8] shrink-0"
                      />
                      <div className="min-w-0 max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-[#1C1917] text-sm truncate">
                            {item.name}
                          </span>
                          {item.tag && (
                            <span className="px-2 py-0.5 rounded-full bg-[#FED7AA]/60 text-[#9A3412] text-[9px] font-bold uppercase shrink-0">
                              {item.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-[#78716C] text-[11px] truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-6 font-medium text-[#1C1917]">
                    <span className="px-2.5 py-1 rounded-full bg-[#F5EFEB] border border-[#E7E0D8] text-[11px]">
                      {item.category}
                    </span>
                  </td>

                  {/* Dietary */}
                  <td className="py-4 px-6">
                    {item.dietary === "veg" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        Veg
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                        Non-Veg
                      </span>
                    )}
                  </td>

                  {/* Quick Price Edit Field */}
                  <td className="py-4 px-6">
                    {editingPriceId === item.id ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#78716C]">₹</span>
                        <input
                          type="number"
                          value={tempPrice}
                          onChange={(e) => setTempPrice(Number(e.target.value))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSavePrice(item.id);
                            if (e.key === "Escape") setEditingPriceId(null);
                          }}
                          className="w-20 px-2 py-1 rounded-lg border border-[#C2410C] bg-white font-bold text-xs focus:outline-hidden"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSavePrice(item.id)}
                          className="p-1 rounded-lg bg-[#C2410C] text-white hover:bg-[#9A3412]"
                          title="Save price"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleStartPriceEdit(item)}
                        className="group inline-flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-orange-50 border border-transparent hover:border-orange-200 transition-colors"
                        title="Click to quickly edit price"
                      >
                        <span className="font-serif text-sm font-bold text-[#1C1917]">
                          ₹{item.price}
                        </span>
                        <Edit2 className="w-3 h-3 text-[#A8A29E] group-hover:text-[#C2410C]" />
                      </div>
                    )}
                  </td>

                  {/* Inline Stock Toggle */}
                  <td className="py-4 px-6">
                    <button
                      onClick={() => toggleAvailability(item.id)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-xs border transition-all ${
                        item.isAvailable
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                          : "bg-red-50 text-red-800 border-red-200 hover:bg-red-100"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.isAvailable ? "bg-emerald-600" : "bg-red-600"
                        }`}
                      />
                      <span>{item.isAvailable ? "In Stock" : "Out of Stock"}</span>
                    </button>
                  </td>

                  {/* Edit Details Action */}
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="px-3 py-1.5 rounded-xl border border-[#E7E0D8] bg-[#FAF8F5] text-[#1C1917] hover:border-[#C2410C] hover:text-[#C2410C] font-semibold text-xs transition-colors"
                    >
                      Edit Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Details Modal */}
      <EditItemModal
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={updateItemDetails}
      />
    </div>
  );
}
