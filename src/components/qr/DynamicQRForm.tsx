import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { generateShortId, formatUrl, validateUrl } from '../../utils/qrUtils';
import { useAuth } from '../../hooks/useAuth';
import { QRCodeStyle, QRCodeData, QRType } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { QRCodeGenerator } from './QRCodeGenerator';
import { QRTypeSelector } from './QRTypeSelector';
import { QRContentForm } from './QRContentForm';

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

  const getInitialStyle = (): QRCodeStyle => ({
    size: 256,
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
    errorCorrectionLevel: 'M',
    includeMargin: true,
    logoUrl: undefined,
  });

  const [name, setName] = useState('');
  const [qrType, setQrType] = useState<QRType>('url');
  const [contentValue, setContentValue] = useState('');
  const [contentFormData, setContentFormData] = useState<Record<string, string>>({});
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [qrStyle, setQrStyle] = useState<QRCodeStyle>(getInitialStyle());
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingQR, setEditingQR] = useState<QRCodeData | null>(null);

  const resetForm = () => {
    setName('');
    setQrType('url');
    setContentValue('');
    setContentFormData({});
    setGeneratedUrl('');
    setIsPreview(false);
    setErrors({});
    setEditingQR(null);
    setQrStyle(getInitialStyle());
  };
  
  useEffect(() => {
    if (editId && user) {
      setIsPreview(false);
      loadQRCodeForEdit(editId, user.id);
    } else {
      resetForm();
    }
  }, [editId, user]);

  const loadQRCodeForEdit = async (id: string, userId: string) => {
    try {
      setLoadingEdit(true);
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*') 
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setEditingQR(data);
        setName(data.name || '');
        // THIS IS NOW CORRECT: It will load the type from the database.
        setQrType(data.type || 'url');
        setContentValue(data.original_url || '');
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
    if (!contentValue.trim()) {
        newErrors.content = 'Content is required';
    } else if (qrType === 'url' && !validateUrl(formatUrl(contentValue))) {
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
      if (editId && editingQR) {
        // THIS IS NOW CORRECT: It saves the `type` along with other fields.
        const { error } = await supabase
          .from('qr_codes')
          .update({
            name: name.trim(),
            original_url: contentValue,
            type: qrType,
          })
          .eq('id', editId);
        if (error) throw error;
        toast.success('QR code updated successfully!');
      } else {
        const shortId = generatedUrl.split('/').pop();
        // THIS IS NOW CORRECT: It includes `type` when creating a new record.
        const { error } = await supabase.from('qr_codes').insert({
          user_id: user.id,
          name: name.trim(),
          short_url: shortId!,
          original_url: contentValue,
          type: qrType,
          // `scans` and `is_active` have database defaults, but setting them here is fine too.
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

  if (loadingEdit) { return <p>Loading editor...</p>; }
  if (!user) { return <p>Please log in to create a dynamic QR code.</p>; }

  return (
    <div className="space-y-6">
      {!isPreview ? (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{editId ? 'Edit Dynamic QR Code' : 'Create Dynamic QR Code'}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{editId ? 'Update your QR code information' : 'Enter the details for your new QR code'}</p>
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400"><Eye className="w-4 h-4 mr-1" />Setup</div>
            </div>

            <Input label="QR Code Name" name="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} placeholder="e.g., My Business Card QR" required />
            <QRTypeSelector selectedType={qrType} onTypeChange={setQrType} />
            <QRContentForm type={qrType} content={contentValue} onContentChange={setContentValue} formData={contentFormData} onFormDataChange={setContentFormData} />
            {errors.content && <p className="text-sm text-red-600">{errors.content}</p>}

            <div className="flex items-center justify-between pt-4">
              <div>{editId && <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>}</div>
              <div className="flex space-x-3">
                {!editId && <Button variant="outline" onClick={resetForm} disabled={!name && !contentValue}>Reset</Button>}
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
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Customize your QR code appearance and save when ready</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" icon={EyeOff} onClick={() => setIsPreview(false)}>Edit Details</Button>
                <Button variant="primary" icon={Save} onClick={saveDynamicQR} loading={loading}>{editId ? 'Save Changes' : 'Save QR Code'}</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
              <div className="space-y-4">
                <div><label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Name</label><p className="text-gray-900 dark:text-gray-100">{name}</p></div>
                <div><label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Short URL (This is what the QR code contains)</label><p className="font-mono text-sm break-all text-primary-600 dark:text-primary-400">{generatedUrl}</p></div>
                <div><label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Destination Content</label><p className="text-sm text-gray-900 break-all dark:text-gray-100">{contentValue}</p></div>
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