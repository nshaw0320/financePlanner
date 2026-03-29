import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { DashboardPage } from '../pages/DashboardPage';
import { FamilyPage } from '../pages/FamilyPage';
import { IncomePage } from '../pages/IncomePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'family',    element: <FamilyPage /> },
      { path: 'income',    element: <IncomePage /> },
    ],
  },
  {
    path: '*',
    element: (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <p className="text-6xl font-bold text-gray-200">404</p>
        <p className="text-gray-500 mt-2">Page not found</p>
        <a href="/" className="mt-4 text-blue-600 hover:underline text-sm">Back to Dashboard</a>
      </div>
    ),
  },
]);
