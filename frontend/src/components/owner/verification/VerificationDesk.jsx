import React, { useState, useEffect } from 'react';
import AuditBillView from './AuditBillView';
import OwnerBillEdit from './OwnerBillEdit';
import { getPendingBillsForAdmin, updateBillStatusByOwner } from '../../../api/billApi';
import { getPendingPaymentsForAdmin, verifyPaymentByOwner } from '../../../api/paymentApi';

export default function VerificationDesk({ onBack }) {
  const [activeTab, setActiveTab] = useState('bills');
  const [openAccordionId, setOpenAccordionId] = useState(null);
  
  // Navigation trigger for the edit view overlay state
  const [editingBillInstance, setEditingBillInstance] = useState(null);

  // --- PENDING CORE LEDGER ARRAY STATES ---
  const [pendingBills, setPendingBills] = useState([]);
  const [pendingCash, setPendingCash] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPendingData = async () => {
    setLoading(true);
    try {
      const [billsData, cashData] = await Promise.all([
        getPendingBillsForAdmin(),
        getPendingPaymentsForAdmin()
      ]);
      setPendingBills(billsData.filter(b => b.status === 'submitted')); // Only show submitted (not delivered)
      setPendingCash(cashData);
    } catch (error) {
      console.error("Failed to load pending verifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingData();
  }, []);

  const handleApproveFinalDelivery = async (billId, items) => {
    try {
      await updateBillStatusByOwner(billId, { status: 'delivered', items });
      setPendingBills(prev => prev.filter(b => b._id !== billId));
      setOpenAccordionId(null);
    } catch (error) {
      console.error("Failed to approve bill:", error);
      alert("Failed to approve bill.");
    }
  };

  const handleVerifyCash = async (paymentId) => {
    try {
      await verifyPaymentByOwner(paymentId);
      setPendingCash(prev => prev.filter(p => p._id !== paymentId));
    } catch (error) {
      console.error("Failed to verify payment:", error);
      alert("Failed to verify payment.");
    }
  };

  /*
    CRITICAL MANAGEMENT OVERRIDE SUBSCRIPTION SAVER:
    Catches the newly modified item quantities back from OwnerBillEdit, 
    re-evaluates the ledger calculations, and updates the view row state.
  */
  const handleSaveOverriddenQuantities = (billId, updatedItemsList) => {
    setPendingBills(prevBills => 
      prevBills.map(bill => 
        bill._id === billId ? { ...bill, items: updatedItemsList } : bill
      )
    );
    setEditingBillInstance(null); // Close the override editor pane
    console.log(`[State Update] Managed override applied successfully to bill item collection: ${billId}`);
  };

  // Render the full overlay view if the owner is actively editing an entry path
  if (editingBillInstance) {
    return (
      <OwnerBillEdit 
        bill={editingBillInstance}
        onSaveOverride={handleSaveOverriddenQuantities}
        onCancel={() => setEditingBillInstance(null)}
      />
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col justify-start max-w-md mx-auto border-x border-slate-200/80 shadow-sm pb-8">
      
      {/* STATIC TOP HEADER LAYER */}
      <div className="sticky top-0 bg-white border-b border-slate-200/80 px-4 py-3.5 flex items-center gap-x-4 z-10">
        <button type="button" onClick={onBack} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Verification Desk</h2>
          <p className="text-[11px] text-slate-400">Final management sign-off for ledger reconciliation</p>
        </div>
      </div>

      {/* TWIN-TAB SEGMENT CONTROL LAYER */}
      <div className="p-4 bg-white border-b border-slate-100">
        <div className="bg-slate-100 p-1 rounded-xl flex items-center justify-between w-full border border-slate-200/20">
          <button
            type="button" onClick={() => setActiveTab('bills')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-tight transition-all flex items-center justify-center gap-x-2 ${
              activeTab === 'bills' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            <span>Verify Load Bills</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-black bg-indigo-50 text-indigo-600">{pendingBills.length}</span>
          </button>

          <button
            type="button" onClick={() => setActiveTab('cash')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-tight transition-all flex items-center justify-center gap-x-2 ${
              activeTab === 'cash' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            <span>Verify Hand Cash</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-black bg-indigo-50 text-indigo-600">{pendingCash.length}</span>
          </button>
        </div>
      </div>

      {/* FEED LIST PIPELINE CONTENT HOUSING CONTAINER */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        
        {/* TAB WORKFLOW SECTION: LOADING BILL MANAGEMENT DRAWER */}
        {activeTab === 'bills' && (
          <>
            {pendingBills.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-4">
                <p className="text-sm font-bold text-slate-700">All Bills Audited</p>
              </div>
            ) : (
              pendingBills.map(bill => {
                const isOpen = openAccordionId === bill._id;

                return (
                  <div key={bill._id} className={`bg-white rounded-xl overflow-hidden border transition-all duration-200 shadow-2xs ${isOpen ? 'border-slate-300' : 'border-slate-200/70'}`}>
                    
                    {/* ACCORDION SUMMARY TOGGLE COMPONENT CONTAINER */}
                    <button
                      type="button"
                      onClick={() => setOpenAccordionId(isOpen ? null : bill._id)}
                      className="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-slate-50/40 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <span className="text-sm font-bold text-slate-800 tracking-tight">{bill.salesmanName}</span>
                        <p className="text-xs text-slate-400">{bill.items.length} Product lines cataloged</p>
                      </div>

                      {/* Right End Aligned High Contrast Currency Weight Tracker */}
                      <div className="flex items-center gap-x-2.5 shrink-0">
                        <span className="text-sm font-black text-slate-900 tracking-tight">
                          ₹{Math.ceil(bill.totalAmount || 0).toLocaleString('en-IN')}
                        </span>
                        <svg className={`w-3.5 h-3.5 text-slate-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                    </button>

                    {/* COLLAPSIBLE CHALLAN ROUTINE PANEL DRAWER */}
                    {isOpen && (
                      <AuditBillView 
                        items={bill.items}
                        onModifyClick={() => setEditingBillInstance(bill)}
                        onApproveClick={() => handleApproveFinalDelivery(bill._id, bill.items)}
                      />
                    )}

                  </div>
                );
              })
            )}
          </>
        )}

        {/* TAB WORKFLOW SECTION: PRE-EXISTING CASH RECONCILIATION */}
        {activeTab === 'cash' && (
          pendingCash.map(cash => (
            <div key={cash._id} className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-3xs space-y-3">
              <div className="flex justify-between items-start border-b border-slate-50 pb-2.5">
                <h4 className="text-sm font-bold text-slate-800 tracking-tight">{cash.salesmanName}</h4>
                <span className="text-base font-black text-slate-900 tracking-tight">₹{cash.totalPayment.toLocaleString('en-IN')}</span>
              </div>
              <div className="grid grid-cols-2 text-xs gap-y-1.5 text-slate-500">
                <span>Physical Cash:</span><span className="font-bold text-slate-800 text-right">₹{cash.totalHandCash.toLocaleString('en-IN')}</span>
                <span>Digital PhonePe:</span><span className="font-bold text-slate-800 text-right">₹{cash.phonePeAmount.toLocaleString('en-IN')}</span>
              </div>
              <button type="button" onClick={() => handleVerifyCash(cash._id)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-lg mt-2 shadow-3xs">Verify & Clear</button>
            </div>
          ))
        )}

      </div>
    </div>
  );
}