# QR Code Generator Web App

A modern, feature-rich QR code generator with support for both static and dynamic QR codes, built with React, TypeScript, and Supabase.

## Features

### 🎯 Core Features
- **Static QR Codes**: Generate QR codes instantly without login
- **Dynamic QR Codes**: Create editable and trackable QR codes (requires login)
- **Custom Short URLs**: Get branded short URLs like `yourdomain.com/r/abc123`
- **Real-time Analytics**: Track scans, locations, and user behavior
- **User Management**: Email-based authentication with Supabase

### 🎨 Customization
- **Logo Upload**: Add custom logos to your QR codes
- **Color Customization**: Choose foreground and background colors
- **Size Control**: Adjustable QR code sizes
- **Error Correction**: Multiple error correction levels
- **Download Options**: Export as PNG or SVG

### 📊 Analytics & Management
- **Scan Tracking**: Real-time scan counting and analytics
- **Dashboard**: Comprehensive management interface
- **Edit & Delete**: Full CRUD operations for dynamic QR codes
- **Active/Inactive Toggle**: Enable or disable QR codes instantly

### 🌟 Design & UX
- **Modern UI**: Clean, purple-themed design with Tailwind CSS
- **Dark/Light Mode**: Toggle between themes
- **Responsive**: Works perfectly on all devices
- **Accessible**: WCAG compliant with proper contrast ratios
- **Smooth Animations**: Framer Motion powered interactions

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom purple theme
- **Authentication & Database**: Supabase
- **QR Generation**: react-qr-code
- **Routing**: React Router
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast
- **File Upload**: React Dropzone

## Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd qr-code-generator
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy `.env.example` to `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Schema

Run the migration file in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the query

This will create:
- `qr_codes` table for storing dynamic QR code data
- `analytics` table for tracking scans
- Row Level Security (RLS) policies
- Necessary indexes and triggers

### 4. Authentication Setup

In your Supabase dashboard:
1. Go to Authentication > Settings
2. **Disable** "Enable email confirmations" (unless you want email verification)
3. Set up your site URL in "Site URL" field
4. Configure any additional auth providers if needed

### 5. Start Development

```bash
npm run dev
```

Visit `http://localhost:5173` to see your app!

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components (Header, etc.)
│   ├── qr/              # QR code related components
│   ├── auth/            # Authentication components
│   └── dashboard/       # Dashboard components
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
└── lib/                 # External library configurations
```

## Key Components

### Static QR Generator
- Instant QR code generation
- Full customization options
- Download as PNG/SVG
- No authentication required

### Dynamic QR System
- User authentication required
- Editable destination URLs
- Analytics tracking
- Custom short URLs
- Management dashboard

### Analytics Dashboard
- Real-time statistics
- Scan history
- User behavior insights
- Performance metrics

## Deployment

### Recommended Platforms
- **Vercel** (recommended for React apps)
- **Netlify**
- **Railway**
- **Render**

### Build for Production
```bash
npm run build
```

### Environment Variables
Make sure to set your environment variables in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Configuration

### Custom Domain for Short URLs
To use your own domain for short URLs (e.g., `yourdomain.com/r/abc123`):

1. Deploy your app to your custom domain
2. The redirect functionality is built into the `/r/:shortId` route
3. QR codes will automatically use your domain for short URLs

### Styling Customization
The app uses a custom purple theme. To customize:

1. Edit `tailwind.config.js` to change the color palette
2. Update CSS custom properties in `src/index.css`
3. Modify component styles as needed

## API Routes

### Dynamic QR Redirects
- `GET /r/:shortId` - Redirects to original URL and tracks analytics

## Security Features

- **Row Level Security**: Users can only access their own data
- **Authentication**: Secure email/password authentication
- **Input Validation**: Comprehensive form validation
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Built-in React protections

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

---

Built with ❤️ using React, TypeScript, and Supabase