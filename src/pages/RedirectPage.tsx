import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const RedirectPage: React.FC = () => {
  const { shortId } = useParams<{ shortId: string }>();
  const [loading, setLoading] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const handleRedirect = async () => {
      if (!shortId) {
        setError('Invalid QR code');
        setLoading(false);
        return;
      }

      try {
        // Get QR code data
        const { data: qrCode, error: qrError } = await supabase
          .from('qr_codes')
          .select('*')
          .eq('short_url', shortId)
          .eq('is_active', true)
          .single();

        if (qrError || !qrCode) {
          setError('QR code not found or inactive');
          setLoading(false);
          return;
        }

        // Log the scan
        const { error: analyticsError } = await supabase
          .from('analytics')
          .insert({
            qr_code_id: qrCode.id,
            user_agent: navigator.userAgent,
            ip_address: null, // Will be populated by server if needed
          });

        // Update scan count
        const { error: updateError } = await supabase
          .from('qr_codes')
          .update({
            scans: (qrCode.scans || 0) + 1,
            last_scanned: new Date().toISOString(),
          })
          .eq('id', qrCode.id);

        if (analyticsError) console.warn('Failed to log analytics:', analyticsError);
        if (updateError) console.warn('Failed to update scan count:', updateError);

        setRedirectUrl(qrCode.original_url);
        setLoading(false);

        // Start countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              window.location.href = qrCode.original_url;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } catch (error: any) {
        console.error('Redirect error:', error);
        setError('Failed to process redirect');
        setLoading(false);
      }
    };

    handleRedirect();
  }, [shortId]);

  const handleDirectRedirect = () => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Processing QR Code...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we redirect you
          </p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            QR Code Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <Button variant="primary" onClick={() => window.location.href = '/'}>
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <Card className="p-8 text-center max-w-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <ExternalLink className="w-8 h-8 text-green-600 dark:text-green-400" />
        </motion.div>
        
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Redirecting...
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You will be redirected in {countdown} seconds
        </p>
        
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-6 break-all">
          Destination: {redirectUrl}
        </div>
        
        <Button
          variant="primary"
          icon={ExternalLink}
          onClick={handleDirectRedirect}
          fullWidth
        >
          Go Now
        </Button>
      </Card>
    </div>
  );
};