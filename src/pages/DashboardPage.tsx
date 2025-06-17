// src/pages/DashboardPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { QRCodeData, DashboardStats } from '../types';
import { QRCodeTable } from '../components/dashboard/QRCodeTable';
import { StatsCards } from '../components/dashboard/StatsCards';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import toast from 'react-hot-toast';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalQRCodes: 0,
    totalScans: 0,
    activeQRCodes: 0,
    todayScans: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Using useCallback to memoize fetchData, preventing re-creation on re-renders
  const fetchData = useCallback(async () => {
    if (!user) return;

    // Set loading state only on initial load, not on refresh
    if (!refreshing) setLoading(true);

    try {
      const { data: qrData, error: qrError } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (qrError) throw qrError;

      const formattedQRCodes: QRCodeData[] = qrData.map(qr => ({
        id: qr.id,
        name: qr.name,
        shortUrl: qr.short_url,
        originalUrl: qr.original_url,
        scans: qr.scans,
        lastScanned: qr.last_scanned,
        isActive: qr.is_active,
        createdAt: qr.created_at,
        userId: qr.user_id,
      }));

      setQrCodes(formattedQRCodes);

      const totalQRCodes = formattedQRCodes.length;
      const totalScans = formattedQRCodes.reduce((sum, qr) => sum + (qr.scans || 0), 0);
      const activeQRCodes = formattedQRCodes.filter(qr => qr.isActive).length;
      
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('analytics')
        .select('id', { count: 'exact', head: true })
        .gte('scanned_at', `${today}T00:00:00.000Z`)
        .lte('scanned_at', `${today}T23:59:59.999Z`)
        .in('qr_code_id', formattedQRCodes.map(qr => qr.id));

      setStats({
        totalQRCodes,
        totalScans,
        activeQRCodes,
        todayScans: count || 0,
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, refreshing]); // Add 'refreshing' as a dependency

  const handleRefresh = async () => {
    setRefreshing(true);
    // fetchData will be called by the useEffect below
  };

  useEffect(() => {
    if (user) {
        fetchData();
    }
  // The 'refreshing' state change will trigger this effect
  }, [user, fetchData, refreshing]);

  if (!user) {
    // This part is already responsive and works well.
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="max-w-md p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900/20">
            <div className="text-2xl">🔒</div>
          </div>
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Access Denied</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">Please sign in to access your dashboard.</p>
          <Button variant="primary" onClick={() => window.location.href = '/'}>Go to Home</Button>
        </Card>
      </div>
    );
  }

  return (
    // The main container occupies the full viewport height and uses a column-based flex layout.
    <div className="flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* 
        This is the main content wrapper. 
        - flex-1: It grows to take up all available vertical space.
        - flex-col: It arranges its children (header, stats, table) vertically.
        - min-h-0: Crucial for preventing flexbox overflow issues, allowing child elements to scroll correctly.
      */}
      <main className="flex flex-col flex-1 w-full min-h-0 px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        
        {/* Header: This section takes its natural height and does not grow. */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-start justify-between flex-shrink-0 mb-8 sm:flex-row sm:items-center"
        >
          <div>
            <h1 className="mb-1 text-3xl font-bold text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your QR codes and track their performance.
            </p>
          </div>
          <div className="flex w-full mt-4 space-x-3 sm:w-auto sm:mt-0">
            <Button variant="outline" icon={RefreshCw} onClick={handleRefresh} loading={refreshing} className="flex-1 sm:flex-none">Refresh</Button>
            <Link to="/dynamic" className="flex-1 sm:flex-none"><Button variant="primary" icon={Plus} className="w-full">New QR Code</Button></Link>
          </div>
        </motion.header>

        {/* Stats Cards: This section also takes its natural height. */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-shrink-0 mb-8"
        >
          <StatsCards stats={stats} loading={loading} />
        </motion.div>

        {/* 
          QR Codes Table Container: This is the key to the responsive layout.
          - flex-1: It grows to fill all remaining vertical space left by the header and stats.
          - flex-col: It arranges its children vertically.
          - min-h-0: Prevents this container from overflowing its parent when the content is large.
        */}
       <motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  className="flex flex-col flex-1 min-h-0"
>
  <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-sm min-h-[200px] dark:border-gray-700 dark:bg-gray-900">
    <QRCodeTable qrCodes={qrCodes} onUpdate={fetchData} loading={loading} />
  </div>
</motion.div>
      </main>
    </div>
  );
};