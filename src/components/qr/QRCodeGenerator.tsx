import React, { useState } from 'react';

import QRCode from 'react-qr-code';
import { Download, Upload, Palette, Settings, Copy, Check } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { QRCodeStyle } from '../../types';
import { downloadQRCode, copyToClipboard } from '../../utils/qrUtils';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { QRTypeSelector } from './QRTypeSelector';
import { QRContentForm } from './QRContentForm';

interface QRCodeGeneratorProps {
  initialValue?: string;
  onGenerate?: (data: { content: string; style: QRCodeStyle }) => void;
  showTypeSelector?: boolean;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  initialValue = '',
  onGenerate,
  showTypeSelector = true,
}) => {
  const [selectedType, setSelectedType] = useState<'url' | 'text' | 'email' | 'phone' | 'wifi' | 'vcard'>('url');
  const [content, setContent] = useState(initialValue);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [style, setStyle] = useState<QRCodeStyle>({
    size: 256,
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
    errorCorrectionLevel: 'M',
    includeMargin: true,
    logoUrl: undefined,
  });
  const [copied, setCopied] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setStyle(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleDownload = async (format: 'png' | 'svg') => {
    if (!content) {
      toast.error('Please enter content to generate QR code');
      return;
    }
    
    try {
      await downloadQRCode('qr-code-display', `qr-code-${Date.now()}`, format);
      toast.success(`QR code downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to download QR code');
    }
  };

  const handleCopy = async () => {
    if (!content) return;
    
    const success = await copyToClipboard(content);
    if (success) {
      setCopied(true);
      toast.success('Content copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy content');
    }
  };

  const removeLogo = () => {
    setStyle(prev => ({ ...prev, logoUrl: undefined }));
  };

  React.useEffect(() => {
    if (onGenerate && content) {
      onGenerate({ content, style });
    }
  }, [content, style, onGenerate]);

  return (
    <div className="space-y-6">
      {/* Type Selector */}
      {showTypeSelector && (
        <Card className="p-6">
          <QRTypeSelector
            selectedType={selectedType}
            onTypeChange={setSelectedType}
          />
        </Card>
      )}

      {/* Content Input */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                QR Code Content
              </h3>
              {!showTypeSelector && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Enter the content for your QR code
                </p>
              )}
            </div>
            {content && (
              <Button
                variant="ghost"
                size="sm"
                icon={copied ? Check : Copy}
                onClick={handleCopy}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            )}
          </div>
          
          {showTypeSelector ? (
            <QRContentForm
              type={selectedType}
              content={content}
              onContentChange={setContent}
              formData={formData}
              onFormDataChange={setFormData}
            />
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter URL, text, or any content for your QR code..."
              className="w-full h-32 px-3 py-2 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg resize-none dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            />
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* QR Code Display */}
        <Card className="p-6">
          <div className="space-y-4 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              QR Code Preview
            </h3>
            
            <div className="flex justify-center">
              <div
                id="qr-code-display"
                className="inline-block p-4 bg-white rounded-lg shadow-sm"
                style={{ backgroundColor: style.backgroundColor }}
              >
                {content ? (
                  <div className="relative">
                    <QRCode
                      value={content}
                      size={style.size}
                      bgColor={style.backgroundColor}
                      fgColor={style.foregroundColor}
                      level={style.errorCorrectionLevel}
                    />
                    {style.logoUrl && (
                      <div
                        className="absolute p-1 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full top-1/2 left-1/2"
                        style={{ width: style.size * 0.2, height: style.size * 0.2 }}
                      >
                        <img
                          src={style.logoUrl}
                          alt="Logo"
                          className="object-contain w-full h-full rounded-full"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center text-gray-400 border-2 border-gray-300 border-dashed rounded-lg"
                    style={{ width: style.size, height: style.size }}
                  >
                    <div className="text-center">
                      <Settings className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Enter content to generate QR code</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {content && (
              <div className="flex justify-center space-x-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={Download}
                  onClick={() => handleDownload('png')}
                >
                  PNG
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Download}
                  onClick={() => handleDownload('svg')}
                >
                  SVG
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Customization Panel */}
        <Card className="p-6">
          <div className="space-y-6">
            <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
              <Palette className="w-5 h-5 mr-2" />
              Customization
            </h3>

            {/* Size */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Size: {style.size}px
              </label>
              <input
                type="range"
                min="128"
                max="512"
                step="16"
                value={style.size}
                onChange={(e) => setStyle(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Foreground Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={style.foregroundColor}
                    onChange={(e) => setStyle(prev => ({ ...prev, foregroundColor: e.target.value }))}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={style.foregroundColor}
                    onChange={(e) => setStyle(prev => ({ ...prev, foregroundColor: e.target.value }))}
                    className="flex-1 text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Background Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={style.backgroundColor}
                    onChange={(e) => setStyle(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={style.backgroundColor}
                    onChange={(e) => setStyle(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="flex-1 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Error Correction Level */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Error Correction Level
              </label>
              <select
                value={style.errorCorrectionLevel}
                onChange={(e) => setStyle(prev => ({ ...prev, errorCorrectionLevel: e.target.value as 'L' | 'M' | 'Q' | 'H' }))}
                className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>

            {/* Include Margin */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeMargin"
                checked={style.includeMargin}
                onChange={(e) => setStyle(prev => ({ ...prev, includeMargin: e.target.checked }))}
                className="w-4 h-4 border-gray-300 rounded text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="includeMargin" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Include margin
              </label>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Logo (Optional)
              </label>
              {style.logoUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="flex items-center space-x-2">
                      <img src={style.logoUrl} alt="Logo" className="object-contain w-8 h-8 rounded" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Logo uploaded</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeLogo}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700'}
                  `}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isDragActive
                      ? 'Drop the image here...'
                      : 'Drag & drop an image, or click to select'}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};