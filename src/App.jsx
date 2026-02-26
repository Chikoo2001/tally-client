import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CompanyProvider } from './context/CompanyContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Gateway from './pages/Gateway'
import CompanySetup from './pages/company/CompanySetup'
import CompanySelect from './pages/company/CompanySelect'
import LedgerGroups from './pages/masters/LedgerGroups'
import Ledgers from './pages/masters/Ledgers'
import LedgerForm from './pages/masters/LedgerForm'
import StockGroups from './pages/masters/StockGroups'
import StockUnits from './pages/masters/StockUnits'
import StockItems from './pages/masters/StockItems'
import StockItemForm from './pages/masters/StockItemForm'
import VoucherEntry from './pages/vouchers/VoucherEntry'
import TrialBalance from './pages/reports/TrialBalance'
import BalanceSheet from './pages/reports/BalanceSheet'
import ProfitLoss from './pages/reports/ProfitLoss'
import DayBook from './pages/reports/DayBook'
import CashBook from './pages/reports/CashBook'
import BankBook from './pages/reports/BankBook'
import LedgerReport from './pages/reports/LedgerReport'
import GSTR1 from './pages/gst/GSTR1'
import GSTR3B from './pages/gst/GSTR3B'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1A2744', color: '#E2E8F0', border: '1px solid #243358', fontFamily: 'Consolas, monospace', fontSize: 13 },
            }}
          />
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Gateway />} />
              <Route path="company/setup" element={<CompanySetup />} />
              <Route path="company/select" element={<CompanySelect />} />
              <Route path="masters/ledger-groups" element={<LedgerGroups />} />
              <Route path="masters/ledgers" element={<Ledgers />} />
              <Route path="masters/ledgers/new" element={<LedgerForm />} />
              <Route path="masters/ledgers/:id" element={<LedgerForm />} />
              <Route path="masters/stock/groups" element={<StockGroups />} />
              <Route path="masters/stock/units" element={<StockUnits />} />
              <Route path="masters/stock/items" element={<StockItems />} />
              <Route path="masters/stock/items/new" element={<StockItemForm />} />
              <Route path="masters/stock/items/:id" element={<StockItemForm />} />
              <Route path="vouchers/:type" element={<VoucherEntry />} />
              <Route path="reports/trial-balance" element={<TrialBalance />} />
              <Route path="reports/balance-sheet" element={<BalanceSheet />} />
              <Route path="reports/profit-loss" element={<ProfitLoss />} />
              <Route path="reports/day-book" element={<DayBook />} />
              <Route path="reports/cash-book" element={<CashBook />} />
              <Route path="reports/bank-book" element={<BankBook />} />
              <Route path="reports/ledger" element={<LedgerReport />} />
              <Route path="gst/gstr1" element={<GSTR1 />} />
              <Route path="gst/gstr3b" element={<GSTR3B />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CompanyProvider>
    </AuthProvider>
  )
}
