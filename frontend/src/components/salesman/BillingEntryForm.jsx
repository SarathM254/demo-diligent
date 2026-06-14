import React from 'react';

export default function BillingEntryForm({ 
  register, 
  mockCategories, 
  expandedCategories, 
  toggleCategory, 
  handleBlurSanitization,
  handleSubmit,
  onPreviewSubmit
}) {
  return (
    <form onSubmit={handleSubmit(onPreviewSubmit)} className="flex-1 p-4 space-y-3 overflow-y-auto">
      {mockCategories.map((category) => {
        const isOpen = !!expandedCategories[category.id];
        
        return (
          <div 
            key={category.id} 
            className="bg-white rounded-xl border border-slate-200/60 overflow-hidden shadow-xs transition-all duration-200"
          >
            {/* Category Striver-Style Toggled Title Selector Bar */}
            <button
              type="button"
              onClick={() => toggleCategory(category.id)}
              className="w-full px-4 py-3.5 flex items-center justify-between bg-white hover:bg-slate-50/50 text-left transition-colors duration-150"
            >
              <span className="text-md font-bold text-slate-800 tracking-tight">
                {category.name}
              </span>
              
              {/* Clean structural Chevron Indicator to convey toggle state layout attributes */}
              <svg 
                className={`w-4 h-4 text-slate-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {/* Collapsible Content Drawer Container */}
            {isOpen && (
              <div className="border-t border-slate-100 bg-slate-50/40 divide-y divide-slate-100">
                {category.brands.map((brand) => (
                  <div 
                    key={brand.id} 
                    className="px-4 py-3 flex items-center justify-between gap-x-4 bg-white"
                  >
                    {/* Left Column Brand Product Descriptor */}
                    <div className="space-y-0.5">
                      <span className="text-md font-medium text-slate-800 leading-snug">
                        {brand.name}
                      </span>
                    </div>

                    {/* Right Column Mathematical Quantity Action Box */}
                    <div className="flex items-center gap-x-2 shrink-0">
                      <div className="relative flex items-center max-w-25">
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          className="w-full text-right font-semibold text-slate-900 bg-slate-50/80 border border-slate-200 rounded-lg py-1.5 pr-7 pl-2.5 text-sm focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all duration-150"
                          {...register(brand.id)}
                          onBlur={(e) => handleBlurSanitization(e, brand.id)}
                        />
                        <span className="absolute right-2.5 text-[11px] font-bold text-slate-400 select-none pointer-events-none">
                          M
                        </span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Hidden button to hook form submission up to master external controller clicks safely */}
      <button id="submit-billing-form" type="submit" className="hidden" />
    </form>
  );
}