import React, { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from "react-router-dom";

// Eager load critical components
import Renderpage from "../render/Renderpage.jsx";
import Protected from "../private/Protected.jsx";
import ErrorBoundary from "../components/ErrorBoundary.jsx";

// Lazy load pages
const Login = lazy(() => 
  import("../pages/Login/Login.jsx")
);

const ResetPassword = lazy(() => 
  import("../pages/reset_password/ResetPassword.jsx")
);

const CommonDashboar = lazy(() => 
  import("../pages/Dashboard/Common/CommonDashboar.jsx")
);

const Candidate_Dashboard = lazy(() =>
  import("../pages/Dashboard/Candidate_Dashboard/Candidate_Dashboard.jsx")
);

const Student_processing_data_report = lazy(() =>
  import("../pages/Dashboard/StudentReport/Student_processing_data_report.jsx")
);

const District_Common_Dashboard = lazy(() => 
  import("../pages/Dashboard/Common/District_Common_Dashboard.jsx")
);

const DataBackup = lazy(() => 
  import("../pages/Databackup/DataBackup.jsx")
);

const AdminWindowsql = lazy(() => 
  import("../pages/adminwindow/AdminWindowsql.jsx")
);

const ExaminerResetPassword = lazy(() => 
  import("../pages/examiner/resetPassword.jsx")
);

const District_Dashboard = lazy(() => 
  import("../pages/Dashboard/District_Dashboard/District_Dashboard.jsx")
);

const State_Common_Dashboard = lazy(() => 
  import("../pages/Dashboard/Common/State_common_Dashboard.jsx")
);

const State_Dashboard = lazy(() => 
  import("../pages/Dashboard/State_Dashboard/State_Dashboard.jsx")
);

const Zone_common_Dashboard = lazy(() => 
  import("../pages/Dashboard/Common/Zone_common_Dashboard.jsx")
);

const ExaminerLoginStatus = lazy(() => 
  import("../pages/ExaminerLoginStatus/ExaminerLoginStatus.jsx")
);

const UserTemporaryPassword = lazy(() => 
  import("../pages/examiner/userTemporaryPassword.jsx")
);

const Navbaradd = lazy(() => 
  import("../pages/UserRoll/Navbaradd.jsx")
);

const Rollmaster = lazy(() => 
  import("../pages/UserRoll/Rollmaster.jsx")
);

const RollexaminerUpdate = lazy(() => 
  import("../pages/UserRoll/RollexaminerUpdate.jsx")
);

const Userrolemaster = lazy(() => 
  import("../pages/UserRoleMaster/Userrolemaster.jsx")
);

// Role-specific common dashboards
const HeadMaster_Common_Dashboard = lazy(() => 
  import("../pages/Dashboard/Common/HeadMaster_Common_Dashboard.jsx")
);

const DistrictOfficials_Common_Dashboard = lazy(() => 
  import("../pages/Dashboard/Common/DistrictOfficials_Common_Dashboard.jsx")
);

const StateCoordinator_Common_Dashboard = lazy(() => 
  import("../pages/Dashboard/Common/StateCoordinator_Common_Dashboard.jsx")
);

const StateAssistant_Common_Dashboard = lazy(() => 
  import("../pages/Dashboard/Common/StateAssistant_Common_Dashboard.jsx")
);

const UserPassword = lazy(() => 
  import("../pages/examiner/userPassword.jsx")
);

const Vacancy_master_Dashboard = lazy(() => 
  import("../pages/Dashboard/Master_Dashboard/Vacancy_master_Dashboard.jsx")
);

const Master_Data_Dashboard = lazy(() => 
  import("../pages/Dashboard/Master_Dashboard/Master_Data_Dashboard.jsx")
);

const Student_master_Dashboard = lazy(() => 
  import("../pages/masterData/MasterData.jsx")
);
  
const PagenotFound = lazy(() => 
  import("../pages/Dashboard/Pagenotfound/PagenotFound.jsx")
);
const Master_Data_District = lazy(() => 
  import("../pages/Dashboard/Master_Dashboard/Master_Data_District.jsx")
);

// Loading fallback component
const LoadingFallback = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "200px",
      fontSize: "14px",
      color: "#666",
    }}
  >
    <div>Loading...</div>
  </div>
);

// Wrapper for lazy routes
const LazyRoute = (props) => {
  const Component = props.component;
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  );
};

//import ValuationMove from "../pages/Dashboard/ValuationMove/ValuationMove.jsx";
//import for all the files in routing

//router export
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Renderpage />}>
      <Route index element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LazyRoute component={Login} />} />
      <Route element={<Protected />}>
        {/* <Route path="/temporary-password" element={<LazyRoute component={TemporaryPassword} />} /> */}
        <Route
          path="/reset-password"
          element={<LazyRoute component={ResetPassword} />}
        />
        <Route
          path="/common/dashboard"
          element={<LazyRoute component={CommonDashboar} />}
        />
        <Route
          path="/candidate/dashboard"
          element={<LazyRoute component={Candidate_Dashboard} />}
        />
        <Route
          path="/district/common/dashboard"
          element={<LazyRoute component={District_Common_Dashboard} />}
        />
        <Route
          path="/admin/admin-window"
          element={<LazyRoute component={AdminWindowsql} />}
        />

        <Route
          path="/district/dashboard"
          element={<LazyRoute component={District_Dashboard} />}
        />
        <Route
          path="/state/common/dashboard"
          element={<LazyRoute component={State_Common_Dashboard} />}
        />
        <Route
          path="/zone/common/dashboard"
          element={<LazyRoute component={Zone_common_Dashboard} />}
        />
        <Route
          path="/state/dashboard"
          element={<LazyRoute component={State_Dashboard} />}
        />
        <Route
          path="/admin/navbaradd"
          element={<LazyRoute component={Navbaradd} />}
        />
        <Route
          path="/admin/data-backup"
          element={<LazyRoute component={DataBackup} />}
        />

        <Route
          path="/admin/rollmaster"
          element={<LazyRoute component={Rollmaster} />}
        />
        <Route
          path="/admin/examinerrollupdate"
          element={<LazyRoute component={RollexaminerUpdate} />}
        />
        <Route
          path="/admin/userMaster"
          element={<LazyRoute component={Userrolemaster} />}
        />
        {/* Role-specific common dashboards */}
        <Route
          path="/headmaster/common/dashboard"
          element={<LazyRoute component={HeadMaster_Common_Dashboard} />}
        />
        <Route
          path="/district-officials/common/dashboard"
          element={
            <LazyRoute component={DistrictOfficials_Common_Dashboard} />
          }
        />
        <Route
          path="/state-coordinator/common/dashboard"
          element={
            <LazyRoute component={StateCoordinator_Common_Dashboard} />
          }
        />
        <Route
          path="/state-assistant/common/dashboard"
          element={
            <LazyRoute component={StateAssistant_Common_Dashboard} />
          }
        />
        <Route
          path="/examiner/resetpassword"
          element={<LazyRoute component={ExaminerResetPassword} />}
        />
        <Route
          path="/examiner/userpassword"
          element={<LazyRoute component={UserPassword} />}
        />
        <Route
          path="/examiner/temporary-password"
          element={<LazyRoute component={UserTemporaryPassword} />}
        />
        <Route
          path="/examiner/examinerstatus"
          element={<LazyRoute component={ExaminerLoginStatus} />}
        />
        <Route
          path="/master_data/Vacancy_master"
          element={<LazyRoute component={Vacancy_master_Dashboard} />}
        />
        <Route
          path="/master_data/master_dashboard"
          element={<LazyRoute component={Master_Data_Dashboard} />}
        />
        <Route
          path="/master_data/district_data"
          element={<LazyRoute component={Master_Data_District} />}
        />

        <Route
          path="/student_processing_report"
          element={<LazyRoute component={Student_processing_data_report} />}
        />

        {/* <Route
          path="/master_data/Student_master"
          element={<LazyRoute component={Student_master_Dashboard} />}
        /> */}
        
      </Route>
      {/* Catch-all 404 */}
      <Route path="*" element={<LazyRoute component={PagenotFound} />} />
    </Route>,
  ),
);

//app router export
const AppRouter = () => {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
};

export default AppRouter;


