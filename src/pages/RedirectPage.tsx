import React, { useEffect, useState, useRef } from 'react'; // Import useRef
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, AlertCircle, FileText, Clipboard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { copyToClipboard } from '../utils/qrUtils';
import toast from 'react-hot-toast';
import { QRCodeData } from '../types';

type PageStatus = 'loading' | 'error' | 'redirecting' | 'displaying';

export const RedirectPage: React.FC = () => {
  const { shortId } = useParams<{ shortId: string }>();
  const [status, setStatus] = useState<PageStatus>('loading');
  const [qrCode, setQrCode] = useState<QRCodeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);

  // This "lock" makes the scan logging immune to React's Strict Mode double-invocation.
  const hasLoggedScan = useRef(false);

  useEffect(() => {
    if (!shortId) return;

    const handleScan = async () => {
      // If we have already logged the scan for this page visit, do nothing.
      if (hasLoggedScan.current) {
        return;
      }
      // Set lock immediately, before await
      hasLoggedScan.current = true;

      try {
        const { data, error: qrError } = await supabase
          .from('qr_codes')
          .select('*')
          .eq('short_url', shortId)
          .eq('is_active', true)
          .single();

        if (qrError || !data) {
          setError('QR code not found or it has been deactivated.');
          setStatus('error');
          return;
        }

        // Set the lock to TRUE immediately. This is the most important part.
        // It prevents this entire block from running more than once.
        hasLoggedScan.current = true;
        setQrCode(data);

        // --- THE FIX ---
        // I have removed the duplicate calls. This block now contains only one
        // call to increment the scan count and one call to log analytics.
        
        // 1. Increment the scan count (ONLY ONCE).
        supabase.rpc('increment_scan_count', { qr_id: data.id }).then(({ error: rpcError }) => {
            if (rpcError) console.error("Failed to increment scan count:", rpcError);
        });
        
        // 2. Log the detailed analytics (ONLY ONCE).
        supabase.from('analytics').insert({ qr_code_id: data.id, user_agent: navigator.userAgent }).then();

        // --- The redirect logic ---
        if (data.type === 'url') {
          setStatus('redirecting');
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                const destination = data.original_url!.startsWith('http') 
                  ? data.original_url!
                  : `https://${data.original_url!}`;
                window.location.href = destination;
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          return () => clearInterval(timer);
        } else {
          setStatus('displaying');
        }
      } catch (err: any) {
        console.error('Redirect error:', err);
        setError('An unexpected error occurred.');
        setStatus('error');
      }
    };

    handleScan();
  }, [shortId]);
  
  const handleCopyToClipboard = () => {
    if (qrCode?.original_url) {
      copyToClipboard(qrCode.original_url);
      toast.success("Content copied to clipboard!");
    }
  };

  // --- NO CHANGES TO THE JSX ---

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md p-8 text-center"><div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-primary-600 border-t-transparent animate-spin" /><h2 className="text-xl font-semibold">Processing QR Code...</h2><p className="text-gray-500">Please wait.</p></Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md p-8 text-center"><div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900/20"><AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" /></div><h2 className="text-xl font-semibold">QR Code Error</h2><p className="mb-6 text-gray-500">{error}</p></Card>
      </div>
    );
  }

  if (status === 'redirecting' && qrCode) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md p-8 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full dark:bg-green-900/20"><ExternalLink className="w-8 h-8 text-green-600 dark:text-green-400" /></motion.div>
          <h2 className="text-xl font-semibold">Redirecting...</h2>
          <p className="mb-4 text-gray-500">Redirecting in {countdown} seconds.</p>
          <div className="mb-6 text-sm text-gray-400 break-all">Destination: {qrCode.original_url}</div>
          <a href={qrCode.original_url!.startsWith('http') ? qrCode.original_url! : `https://${qrCode.original_url!}`} className="inline-flex items-center justify-center w-full h-10 px-4 py-2 text-sm font-medium text-white transition-all duration-200 rounded-lg bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"><ExternalLink className='w-4 h-4 mr-2'/>Go Now</a>
        </Card>
      </div>
    );
  }

  if (status === 'displaying' && qrCode) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md p-8">
           <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full dark:bg-blue-900/20"><FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" /></motion.div>
           <h2 className="mb-2 text-xl font-semibold text-center">QR Code Content</h2>
           <pre className="w-full p-4 mb-6 font-mono text-sm text-gray-800 break-words whitespace-pre-wrap bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">{qrCode.original_url}</pre>
           <div className="flex flex-col gap-3 sm:flex-row"><Button variant="primary" icon={Clipboard} onClick={handleCopyToClipboard} fullWidth>Copy Content</Button><Link to="/"><Button variant="outline" fullWidth>Go to Home</Button></Link></div>
        </Card>
      </div>
    );
  }

  return null;
};