import React, { useState, useEffect } from 'react';
import { Link, Save, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { generateShortId, formatUrl, validateUrl } from '../../utils/qrUtils';
import { useAuth } from '../../hooks/useAuth';
import { QRCodeStyle, QRCodeData, QRType } from '../../types'; // Make sure QRType is imported
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { QRCodeGenerator } from '../qr/QRCodeGenerator';
import { QRTypeSelector } from '../qr/QRTypeSelector'; // Import the type selector
import { QRContentForm } from '../qr/QRContentForm';   // Import the content form

interface DynamicQRFormProps {
  onSuccess?: () => void;
  onAuthRequired?: () => void;
  editId?: string | null;
}

export const DynamicQRForm: React.FC<DynamicQRFormProps> = ({ 
  onSuccess, 
  onAuthRequired,
  editId 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- State Management for All QR Types ---
  const [name, setName] = useState('');
  const [qrType, setQrType] = useState<QRType>('url');
  const [destinationContent, setDestinationContent] = useState(''); // This holds the final content (URL, mailto:, etc.)
  const [contentFormData, setContentFormData] = useState<Record<string, string>>({}); // For complex forms like vCard

  // --- Other existing state ---
  const [generatedUrl, setGeneratedUrl] = useState(''); // This holds the short URL for the QR image
  const [qrStyle, setQrStyle] = useState<QRCodeStyle>({ size: 256, backgroundColor: '#ffffff', foregroundColor: '#000000', errorCorrectionLevel: 'M', includeMargin: true, logoUrl: undefined });
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingQR, setEditingQR] = useState<QRCodeData | null>(null);

  const resetForm = () => {
    setName('');
    setQrType('url');
    setDestinationContent('');
    setContentFormData({});
    setGeneratedUrl('');
    setIsPreview(false);
    setErrors({});
    setEditingQR(null);
  };
  
  useEffect(() => {
    if (editId && user) {
      setIsPreview(false);
      loadQRCodeForEdit(editId);
    } else {
      resetForm();
    }
  }, [editId, user]);

  const loadQRCodeForEdit = async (id: string) => {
    try {
      setLoadingEdit(true);
      const { data, error } = await supabase.from('qr_codes').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) {
        setEditingQR(data);
        setName(data.name || '');
        setQrType(data.type || 'url');
        setDestinationContent(data.original_url || '');
        setGeneratedUrl(`${window.location.origin}/r/${data.short_url}`);
      }
    } catch (error: any) {
      toast.error('Failed to load QR code for editing.');
      navigate('/dashboard');
    } finally {
      setLoadingEdit(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!destinationContent.trim()) {
      newErrors.content = 'Content is required';
    } else if (qrType === 'url' && !validateUrl(formatUrl(destinationContent))) {
      newErrors.content = 'Please enter a valid URL';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generatePreview = () => {
    if (!user) {
      onAuthRequired?.();
      return;
    }
    if (!validateForm()) return;
    if (!editId && !generatedUrl) {
      const shortId = generateShortId();
      setGeneratedUrl(`${window.location.origin}/r/${shortId}`);
    }
    setIsPreview(true);
  };

  const saveDynamicQR = async () => {
    if (!user || !generatedUrl) return;
    setLoading(true);
    try {
      const qrData = {
        name: name.trim(),
        original_url: destinationContent,
        type: qrType,
      };

      if (editId && editingQR) {
        const { error } = await supabase.from('qr_codes').update(qrData).eq('id', editId);
        if (error) throw error;
        toast.success('QR code updated successfully!');
      } else {
        const shortId = generatedUrl.split('/').pop();
        const { error } = await supabase.from('qr_codes').insert({
          ...qrData,
          user_id: user.id,
          short_url: shortId!,
          scans: 0,
          is_active: true,
        });
        if (error) throw error;
        toast.success('Dynamic QR code created successfully!');
      }
      
      if (editId) {
        navigate('/dashboard');
      } else {
        resetForm();
        onSuccess?.();
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to ${editId ? 'update' : 'create'} dynamic QR code`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingEdit) { return <Card className="p-8 text-center">Loading...</Card>; }
  if (!user) { return <Card className="p-8 text-center">Sign in required.</Card>; }

  return (
    <div className="space-y-6">
      {!isPreview ? (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{editId ? 'Edit Dynamic QR Code' : 'Create Dynamic QR Code'}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{editId ? 'Update your QR code information.' : 'Choose a type and enter the content.'}</p>
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400"><Eye className="w-4 h-4 mr-1" />Setup</div>
            </div>

            <Input
              label="QR Code Name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              placeholder="e.g., My Business Card"
              required
            />
            
            <QRTypeSelector 
              selectedType={qrType} 
              onTypeChange={(type) => {
                setQrType(type);
                setDestinationContent('');
                setContentFormData({});
              }} 
            />
            
            <QRContentForm
              type={qrType}
              content={destinationContent}
              onContentChange={setDestinationContent}
              formData={contentFormData}
              onFormDataChange={setContentFormData}
            />
            {errors.content && <p className="mt-2 text-sm text-red-600">{errors.content}</p>}

            <div className="flex items-center justify-between pt-4">
              <div>{editId && <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>}</div>
              <div className="flex space-x-3">
                {!editId && <Button variant="outline" onClick={resetForm} disabled={!name && !destinationContent}>Reset</Button>}
                <Button variant="primary" icon={Eye} onClick={generatePreview}>{editId ? 'Preview Changes' : 'Preview & Customize'}</Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">QR Code Preview & Customization</h3>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" icon={EyeOff} onClick={() => setIsPreview(false)}>Edit Details</Button>
                <Button variant="primary" icon={Save} onClick={saveDynamicQR} loading={loading}>{editId ? 'Save Changes' : 'Save QR Code'}</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
              <div className="space-y-4">
                <div><label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Name</label><p className="text-gray-900 dark:text-gray-100">{name}</p></div>
                <div><label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">QR Code Link (This is what the QR image contains)</label><p className="font-mono text-sm break-all text-primary-600 dark:text-primary-400">{generatedUrl}</p></div>
                <div><label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Destination Content (Where users are redirected)</label><p className="text-sm text-gray-900 break-all dark:text-gray-100">{destinationContent}</p></div>
                {editId && editingQR && (<div><label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Total Scans</label><p className="font-semibold text-gray-900 dark:text-gray-100">{editingQR.scans || 0}</p></div>)}
              </div>
            </div>
          </Card>
          
          <QRCodeGenerator initialValue={generatedUrl} onGenerate={(data) => setQrStyle(data.style)} showTypeSelector={false} />
        </div>
      )}
    </div>
  );
};