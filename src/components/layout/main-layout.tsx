import React from 'react';
import Sidebar from './Sidebar';
import Header from './header';

interface MainLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export default function MainLayout({ children, onLogout }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar onLogout={onLogout} />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 bg-gray-50">{children}</main>
      </div>
    </div>
  );
} 