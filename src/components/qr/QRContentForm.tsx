import React from 'react';
import { Globe, Mail, Phone, Wifi, User, FileText } from 'lucide-react';
import { Input } from '../ui/Input';

interface QRContentFormProps {
  type: 'url' | 'text' | 'email' | 'phone' | 'wifi' | 'vcard';
  content: string;
  onContentChange: (content: string) => void;
  formData?: Record<string, string>;
  onFormDataChange?: (data: Record<string, string>) => void;
}

export const QRContentForm: React.FC<QRContentFormProps> = ({
  type,
  content,
  onContentChange,
  formData = {},
  onFormDataChange,
}) => {
  const handleFormChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    onFormDataChange?.(newData);
    
    // Generate content based on type
    let generatedContent = '';
    switch (type) {
      case 'email':
        generatedContent = `mailto:${newData.email || ''}${newData.subject ? `?subject=${encodeURIComponent(newData.subject)}` : ''}${newData.body ? `${newData.subject ? '&' : '?'}body=${encodeURIComponent(newData.body)}` : ''}`;
        break;
      case 'phone':
        generatedContent = `tel:${newData.phone || ''}`;
        break;
      case 'wifi':
        generatedContent = `WIFI:T:${newData.security || 'WPA'};S:${newData.ssid || ''};P:${newData.password || ''};H:${newData.hidden === 'true' ? 'true' : 'false'};;`;
        break;
      case 'vcard':
        generatedContent = `BEGIN:VCARD
VERSION:3.0
FN:${newData.name || ''}
ORG:${newData.organization || ''}
TEL:${newData.phone || ''}
EMAIL:${newData.email || ''}
URL:${newData.website || ''}
END:VCARD`;
        break;
      default:
        generatedContent = content;
    }
    
    if (generatedContent !== content) {
      onContentChange(generatedContent);
    }
  };

  const renderForm = () => {
    switch (type) {
      case 'url':
        return (
          <Input
            label="Website URL"
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="https://example.com"
            icon={Globe}
          />
        );
      
      case 'text':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Text Content
            </label>
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Enter any text content..."
              className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        );
      
      case 'email':
        return (
          <div className="space-y-4">
            <Input
              label="Email Address"
              value={formData.email || ''}
              onChange={(e) => handleFormChange('email', e.target.value)}
              placeholder="contact@example.com"
              icon={Mail}
              type="email"
            />
            <Input
              label="Subject (Optional)"
              value={formData.subject || ''}
              onChange={(e) => handleFormChange('subject', e.target.value)}
              placeholder="Email subject"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={formData.body || ''}
                onChange={(e) => handleFormChange('body', e.target.value)}
                placeholder="Email message..."
                className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
        );
      
      case 'phone':
        return (
          <Input
            label="Phone Number"
            value={formData.phone || ''}
            onChange={(e) => handleFormChange('phone', e.target.value)}
            placeholder="+1234567890"
            icon={Phone}
            type="tel"
          />
        );
      
      case 'wifi':
        return (
          <div className="space-y-4">
            <Input
              label="Network Name (SSID)"
              value={formData.ssid || ''}
              onChange={(e) => handleFormChange('ssid', e.target.value)}
              placeholder="My WiFi Network"
              icon={Wifi}
            />
            <Input
              label="Password"
              value={formData.password || ''}
              onChange={(e) => handleFormChange('password', e.target.value)}
              placeholder="WiFi password"
              type="password"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Security Type
              </label>
              <select
                value={formData.security || 'WPA'}
                onChange={(e) => handleFormChange('security', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hidden"
                checked={formData.hidden === 'true'}
                onChange={(e) => handleFormChange('hidden', e.target.checked ? 'true' : 'false')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="hidden" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Hidden Network
              </label>
            </div>
          </div>
        );
      
      case 'vcard':
        return (
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={formData.name || ''}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="John Doe"
              icon={User}
            />
            <Input
              label="Organization"
              value={formData.organization || ''}
              onChange={(e) => handleFormChange('organization', e.target.value)}
              placeholder="Company Name"
            />
            <Input
              label="Phone"
              value={formData.phone || ''}
              onChange={(e) => handleFormChange('phone', e.target.value)}
              placeholder="+1234567890"
              icon={Phone}
              type="tel"
            />
            <Input
              label="Email"
              value={formData.email || ''}
              onChange={(e) => handleFormChange('email', e.target.value)}
              placeholder="contact@example.com"
              icon={Mail}
              type="email"
            />
            <Input
              label="Website"
              value={formData.website || ''}
              onChange={(e) => handleFormChange('website', e.target.value)}
              placeholder="https://example.com"
              icon={Globe}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Enter Content
      </h3>
      {renderForm()}
    </div>
  );
};