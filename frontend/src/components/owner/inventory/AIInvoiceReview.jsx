import React from 'react';

export default function AIInvoiceReview({ extractedData, onAccept, onModify, onCancel }) {
  // Extracting active items only
  const activeItems = extractedData.filter(item => item.quantity > 0);

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col justify-between max-w-md mx-auto border-x border-slate-200/80 shadow-sm relative">
      <div className="sticky top-0 bg-white border-b border-slate-200/80 px-4 py-4 z-10 flex items-center justify-between shadow-2xs">
        <div>
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">AI Analysis Complete</span>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Review Invoice Data</h2>
        </div>
        <button 
          type="button" 
          onClick={onCancel}
          className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm font-mono text-sm text-slate-800">
          <div className="text-center font-bold pb-4 border-b-2 border-dashed border-slate-300 mb-4">
            EXTRACTED MANIFEST
          </div>
          
          <div className="flex justify-between font-bold border-b border-slate-200 pb-2 mb-2 text-xs">
            <span>BRAND NAME</span>
            <span>QTY (M)</span>
          </div>

          {activeItems.map((item, index) => (
            <React.Fragment key={item.brandId}>
              <div className="flex justify-between items-start py-1.5">
                <span className="pr-4 leading-tight">{item.brandName}</span>
                <span className="font-bold text-right shrink-0">{item.quantity}</span>
              </div>
              
              {/* Inject dashed horizontal separator every 6 items for readability */}
              {(index + 1) % 6 === 0 && index !== activeItems.length - 1 && (
                <div className="my-2 border-b border-dashed border-slate-300"></div>
              )}
            </React.Fragment>
          ))}

          {activeItems.length === 0 && (
            <div className="text-center py-4 text-slate-500 italic">No valid items found.</div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-slate-200/80 p-4 shadow-sm z-10">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onModify}
            className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl text-sm tracking-wide transition-colors flex items-center justify-center shadow-xs"
          >
            Modify
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-sm tracking-wide transition-colors flex items-center justify-center shadow-xs"
            disabled={activeItems.length === 0}
          >
            Accept & Add to Stock
          </button>
        </div>
      </div>
    </div>
  );
}
