import { BrowserRouter, Routes, Route} from 'react-router-dom'
import './utils/axiosInterceptor'; // Import axios interceptor for JWT token refresh

import MainLogin from './mainadminpage/components/MainLogin'
import MainRegister from './mainadminpage/components/MainRegister'
import MainForgot from './mainadminpage/components/MainForgot'

import MainDashboard from './mainadminpage/MainDashboard'
import MainDocuments from './mainadminpage/MainDocuments'
import MainDocCategory from './mainadminpage/MainDocCategory'
import MainDocForms from './mainadminpage/MainDocForms'
import MainRequests from './mainadminpage/MainRequests'
import MainRequestsHistory from './mainadminpage/MainRequestsHistory'
import MainPayments from './mainadminpage/MainPayments'
import MainPaymentsHistory from './mainadminpage/MainPaymentsHistory'
import MainTransactions from './mainadminpage/MainTransactions'
import MainAssign from './mainadminpage/MainAssign'
import MainAdmins from './mainadminpage/MainAdmins'
import MainUsers from './mainadminpage/MainUsers'
import MainLogAudits from './mainadminpage/MainLogAudits'
import MainSettings from './mainadminpage/MainSettings'

import ProcessorLogin from './processorpage/components/ProcessorLogin'
import ProcessorForgot from './processorpage/components/ProcessorForgot'

import ProcessorDashboard from './processorpage/ProcessorDashboard'
import ProcessorDocuments from './processorpage/ProcessorDocuments'
import ProcessorRequests from './processorpage/ProcessorRequests'
import ProcessorPayments from './processorpage/ProcessorPayments'
import ProcessorTransactions from './processorpage/ProcessorTransactions'
import ProcessorSettings from './processorpage/ProcessorSettings'

import UserRegister from './userpages/components/UserRegister'
import UserLogin from './userpages/components/UserLogin'
import UserForgot from './userpages/components/UserForgot'

import UserDashboard from './userpages/UserDashboard'
import UserChecklist from './userpages/UserChecklist'
import UserRenewal from './userpages/UserRenewal'
import UserTransaction from './userpages/UserTransaction'
import UserPayments from './userpages/UserPayments'
import UserForms from './userpages/UserForms'
import UserDownloadables from './userpages/UserDownloadables'
import UserSettings from './userpages/UserSettings'

// --------------------------------------------------------


import Home from './pages/Home'
import Requirements from './pages/Requirements'
import Tracking from './pages/Tracking'
import ContactUs from './pages/ContactUs'
import About from './pages/About'
import VerifyEmail from './pages/VerifyEmail'
import ResetPassword from './pages/ResetPassword'



function App() {

  return (
    <BrowserRouter>
      <Routes>

        <Route path='/oabps/main/login' element={<MainLogin/>}></Route>
        <Route path='/oabps/main/register' element={<MainRegister/>}></Route>
        <Route path='/oabps/main/forgot' element={<MainForgot/>}></Route>

        <Route path='/oabps/main/dashboard' element={<MainDashboard/>}></Route>
        <Route path='/oabps/main/documents' element={<MainDocuments/>}></Route>
        <Route path='/oabps/main/documentcategory' element={<MainDocCategory/>}></Route>
        <Route path='/oabps/main/documentforms' element={<MainDocForms/>}></Route>
        <Route path='/oabps/main/requests' element={<MainRequests/>}></Route>
        <Route path='/oabps/main/requestshistory' element={<MainRequestsHistory/>}></Route>
        <Route path='/oabps/main/payments' element={<MainPayments/>}></Route>
        <Route path='/oabps/main/paymentshistory' element={<MainPaymentsHistory/>}></Route>
        <Route path='/oabps/main/transactions' element={<MainTransactions/>}></Route>
        <Route path='/oabps/main/assign' element={<MainAssign/>}></Route>
        <Route path='/oabps/main/admins' element={<MainAdmins/>}></Route>
        <Route path='/oabps/main/users' element={<MainUsers/>}></Route>
        <Route path='/oabps/main/logaudits' element={<MainLogAudits/>}></Route>
        <Route path='/oabps/main/settings' element={<MainSettings/>}></Route>

        <Route path='/oabps/processor/login' element={<ProcessorLogin/>}></Route>
        <Route path='/oabps/processor/forgot' element={<ProcessorForgot/>}></Route>

        <Route path='/oabps/processor/dashboard' element={<ProcessorDashboard/>}></Route>
        <Route path='/oabps/processor/documents' element={<ProcessorDocuments/>}></Route>
        <Route path='/oabps/processor/requests' element={<ProcessorRequests/>}></Route>
        <Route path='/oabps/processor/payments' element={<ProcessorPayments/>}></Route>
        <Route path='/oabps/processor/transactions' element={<ProcessorTransactions/>}></Route>
        <Route path='/oabps/processor/settings' element={<ProcessorSettings/>}></Route>

        <Route path='/oabps/user/register' element={<UserRegister/>}></Route>
        <Route path='/oabps/user/login' element={<UserLogin/>}></Route>
        <Route path='/oabps/user/forgot' element={<UserForgot/>}></Route>

        <Route path='/oabps/user/dashboard' element={<UserDashboard/>}></Route>
        <Route path='/oabps/user/checklist' element={<UserChecklist/>}></Route>
        <Route path='/oabps/user/renewal' element={<UserRenewal/>}></Route>
        <Route path='/oabps/user/transaction' element={<UserTransaction/>}></Route>
        <Route path='/oabps/user/payments' element={<UserPayments/>}></Route>
        <Route path='/oabps/user/forms' element={<UserForms/>}></Route>
        <Route path='/oabps/user/downloadables' element={<UserDownloadables/>}></Route>
        <Route path='/oabps/user/settings' element={<UserSettings/>}></Route>

        {/* ----------------------------------------------------------- */}

        {/* Email Verification and Password Reset */}
        <Route path='/verify-email' element={<VerifyEmail/>}></Route>
        <Route path='/reset-password' element={<ResetPassword/>}></Route>

        <Route path='/' element={<Home/>}></Route>
        <Route path='/home' element={<Home/>}></Route>
        <Route path='/requirements' element={<Requirements/>}></Route>
        <Route path='/tracking' element={<Tracking/>}></Route>
        <Route path='/contactus' element={<ContactUs/>}></Route>
        <Route path='/about' element={<About/>}></Route>

        {/* Catch-all route for 404 - redirect to home */}
        <Route path='*' element={<Home/>}></Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;