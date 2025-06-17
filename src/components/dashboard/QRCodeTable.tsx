import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff,
  Copy,
  MoreVertical,
  Calendar,
  MousePointer,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { QRCodeData } from '../../types';
import { copyToClipboard } from '../../utils/qrUtils';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface QRCodeTableProps {
  qrCodes: QRCodeData[];
  onUpdate: () => void;
}

export const QRCodeTable: React.FC<QRCodeTableProps> = ({ qrCodes, onUpdate }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setLoading(id);
      const { error } = await supabase
        .from('qr_codes')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`QR code ${!currentStatus ? 'activated' : 'deactivated'}`);
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update QR code');
    } finally {
      setLoading(null);
    }
  };

  const deleteQRCode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this QR code? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(id);
      
      // Delete analytics first
      await supabase
        .from('analytics')
        .delete()
        .eq('qr_code_id', id);

      // Then delete the QR code
      const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('QR code deleted successfully');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete QR code');
    } finally {
      setLoading(null);
    }
  };

  const copyShortUrl = async (shortUrl: string) => {
    const fullUrl = `${window.location.origin}/r/${shortUrl}`;
    const success = await copyToClipboard(fullUrl);
    if (success) {
      toast.success('Short URL copied to clipboard');
    } else {
      toast.error('Failed to copy URL');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEdit = (qrCode: QRCodeData) => {
    navigate(`/dynamic?edit=${qrCode.id}`);
    setActiveDropdown(null);
  };

  if (qrCodes.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/20 dark:to-purple-900/20">
            <Eye className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            No QR codes yet
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Create your first dynamic QR code to start tracking analytics and managing your links.
          </p>
          <Button variant="primary" onClick={() => navigate('/dynamic')}>
            Create QR Code
          </Button>
        </div>
      </Card>
    );
  }

  return (
    // FIX: Removed `overflow-hidden` from this container
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
            <tr>
              <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                Name
              </th>
              <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                Short URL
              </th>
              <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                Scans
              </th>
              <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
                Created
              </th>
              <th className="px-6 py-4 text-xs font-medium tracking-wider text-right text-gray-500 uppercase dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {qrCodes.map((qrCode, index) => (
              <motion.tr
                key={qrCode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {qrCode.name}
                    </div>
                    <div className="max-w-xs text-sm text-gray-500 truncate dark:text-gray-400">
                      {qrCode.originalUrl}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <code className="px-2 py-1 font-mono text-sm rounded text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20">
                      {qrCode.shortUrl}
                    </code>
                    <button
                      onClick={() => copyShortUrl(qrCode.shortUrl!)}
                      className="text-gray-400 transition-colors hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 mr-2 bg-green-100 rounded-full dark:bg-green-900/20">
                      <MousePointer className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {qrCode.scans || 0}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleStatus(qrCode.id!, qrCode.isActive!)}
                    disabled={loading === qrCode.id}
                    className={`
                      inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all
                      ${qrCode.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    {qrCode.isActive ? (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(qrCode.createdAt!)}
                  </div>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="relative" ref={activeDropdown === qrCode.id ? dropdownRef : null}>
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === qrCode.id ? null : qrCode.id!)}
                      className="p-1 text-gray-400 transition-colors rounded-full hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {activeDropdown === qrCode.id && (
                      <div className="absolute right-0 z-10 w-48 mt-2 bg-white border border-gray-200 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-700">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              window.open(qrCode.originalUrl, '_blank');
                              setActiveDropdown(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-colors dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Visit URL
                          </button>
                          <button
                            onClick={() => handleEdit(qrCode)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-colors dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit QR Code
                          </button>
                          <button
                            onClick={() => {
                              deleteQRCode(qrCode.id!);
                              setActiveDropdown(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 transition-colors dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};