/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TelegramButton } from './components/TelegramButton';
import { ToastContainer } from './components/Toast';
import { HomePage } from './pages/HomePage';
import { GuildGloryPage } from './pages/GuildGloryPage';
import { DiamondTopUpPage } from './pages/DiamondTopUpPage';
import { AdminPage } from './pages/AdminPage';

const AppContent: React.FC = () => {
  const { currentPage } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header />

      <main className="flex-1">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'guild-glory' && <GuildGloryPage />}
        {currentPage === 'weekly-monthly' && <DiamondTopUpPage />}
        {currentPage === 'admin' && <AdminPage />}
      </main>

      <Footer />
      <TelegramButton />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
