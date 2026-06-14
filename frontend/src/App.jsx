import React, { useState } from 'react';
import './App.css';

// Owner Components
import OwnerDashboard from './components/owner/dashboard/OwnerDashboard';
import VerificationDesk from './components/owner/verification/VerificationDesk';
import LedgerControlPortal from './components/owner/ledger/LedgerControlPortal';
import StaffManagementPortal from './components/owner/staff/StaffManagementPortal';
import InventoryControlPortal from './components/owner/inventory/InventoryControlPortal';
import BrandManagerPortal from './components/owner/brand/BrandManagerPortal';

// Operator Components
import OperatorDashboard from './components/operator/OperatorDashboard';
import OperatorSelectionList from './components/operator/OperatorSelectionList';

// Salesman Components
import CashPaymentSettlement from './components/salesman/CashPaymentSettlement';
import SalesmanProfileCard from './components/salesman/SalesmanProfileCard';
import SalesmanStatementHistory from './components/salesman/SalesmanStatementHistory';
import SalesmanBillingScreen from './components/salesman/SalesmanBillingScreen';
import SalesmanSelectionList from './components/salesman/SalesmanSelectionList';
import SalesmanPriceList from './components/salesman/SalesmanPriceList';

export default function App() {
  const [role, setRole] = useState('none'); // 'none', 'owner', 'operator', 'salesman'
  
  // operator state
  const [activeOperator, setActiveOperator] = useState(null);

  // salesman state
  const [salesmanView, setSalesmanView] = useState('home');
  const [activeSalesman, setActiveSalesman] = useState(null);

  // owner state
  const [ownerView, setOwnerView] = useState('home');

  const handleLogout = () => {
    setRole('none');
    setSalesmanView('home');
    setActiveSalesman(null);
    setActiveOperator(null);
    setOwnerView('home');
  };

  const initRoleSelection = (targetRole) => {
    setRole(targetRole);
  };

  if (role === 'none') {
    return (
      <div className="w-full max-w-md mx-auto p-4 min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full flex flex-col gap-6 text-center">
          <h1 className="text-3xl font-extrabold text-blue-600 mb-2">Manikyapriya Agencies</h1>
          <p className="text-gray-500 mb-6">Select your portal to continue</p>
          
          <button 
            onClick={() => initRoleSelection('owner')}
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
          >
            Enter Owner Portal
          </button>
          
          <button 
             onClick={() => initRoleSelection('operator')}
            className="w-full py-4 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
          >
            Enter Operator Portal
          </button>
          
          <button 
            onClick={() => initRoleSelection('salesman')}
            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
          >
            Enter Salesman Portal
          </button>
        </div>
      </div>
    );
  }

  // Common Header for authenticated state
  const Header = () => (
    <header className="flex items-center justify-between bg-white shadow-md rounded-xl p-4 mb-4">
      <div>
        <h2 className="text-lg font-bold text-gray-800 capitalize">{role} Portal</h2>
        <p className="text-xs text-gray-500 font-medium">Manikyapriya Agencies</p>
      </div>
      <button 
        onClick={handleLogout}
        className="text-sm font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors shadow-sm"
      >
        Switch Role / Logout
      </button>
    </header>
  );

  return (
    <div className="w-full max-w-md mx-auto p-4 min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      
      {role === 'salesman' ? (
        <main className="flex-1 w-full pb-4 flex flex-col gap-4">
          {salesmanView === 'home' && !activeSalesman && (
            <SalesmanSelectionList 
              onSelectSalesman={(s) => setActiveSalesman(s)} 
            />
          )}
          {salesmanView === 'home' && activeSalesman && (
            <>
              <SalesmanProfileCard 
                salesman={activeSalesman}
                onNavigateToBilling={() => setSalesmanView('billing')} 
                onNavigateToCash={() => setSalesmanView('cash')} 
                onNavigateToPrices={() => setSalesmanView('prices')}
                onBackToList={() => setActiveSalesman(null)}
              />
              <SalesmanStatementHistory salesmanId={activeSalesman._id} />
            </>
          )}
          {salesmanView === 'billing' && (
            <SalesmanBillingScreen salesman={activeSalesman} onBack={() => setSalesmanView('home')} />
          )}
          {salesmanView === 'cash' && (
            <CashPaymentSettlement salesman={activeSalesman} onBack={() => setSalesmanView('home')} />
          )}
          {salesmanView === 'prices' && (
            <SalesmanPriceList onBack={() => setSalesmanView('home')} />
          )}
        </main>
      ) : role === 'owner' ? (
        <main className="flex-1 w-full pb-4">
          {ownerView === 'home' && (
            <OwnerDashboard onNavigate={setOwnerView} />
          )}
          {ownerView === 'verify' && (
            <VerificationDesk onBack={() => setOwnerView('home')} />
          )}
          {ownerView === 'ledger' && (
            <LedgerControlPortal onBack={() => setOwnerView('home')} />
          )}
          {ownerView === 'staff' && (
            <StaffManagementPortal onBack={() => setOwnerView('home')} />
          )}
          {ownerView === 'inventory' && (
            <InventoryControlPortal onBack={() => setOwnerView('home')} />
          )}
          {ownerView === 'brands' && (
            <BrandManagerPortal onBack={() => setOwnerView('home')} />
          )}
          {ownerView === 'billing_ops' && (
            <OperatorDashboard onBackToList={() => setOwnerView('home')} />
          )}
        </main>
      ) : role === 'operator' ? (
        <main className="flex-1 w-full pb-4">
          {!activeOperator ? (
            <OperatorSelectionList onSelectOperator={(op) => setActiveOperator(op)} />
          ) : (
            <OperatorDashboard onBackToList={() => setActiveOperator(null)} />
          )}
        </main>
      ) : null}
    </div>
  );
}