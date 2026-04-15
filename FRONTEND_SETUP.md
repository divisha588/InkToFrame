# InkToFrame Frontend Setup & Running Guide

## 🎨 Frontend Overview

A modern, responsive React-based frontend built with Material-UI that provides a seamless user experience for converting documents into AI-powered conversations.

### Tech Stack
- **React 18** - Modern UI library
- **TypeScript** - Type safety
- **Material-UI (MUI) v5** - Professional component library
- **Axios** - HTTP client for API calls
- **Responsive Design** - Mobile-first approach

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- Backend API running on `http://localhost:8000`

### Installation & Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm start
```

The application will automatically open at `http://localhost:3000`

---

## 📱 Application UI Components

### 🏠 Homepage (Landing Page)
- **Hero Section** - Eye-catching introduction with CTA buttons
  - "Upload Document" button - Quick access to upload
  - "Login / Sign Up" button - Authentication entry point
- **Features Section** - Displays 6 key features with icons
- **How It Works** - 3-step process visualization
- **Call-to-Action** - Prominent download/get started sections
- **Footer** - Company info

**Key Elements:**
- Gradient background
- Responsive grid layout
- Smooth animations
- Icon-based feature cards

### 🔐 Authentication
- **Login Tab:**
  - Email input
  - Password input
  - Login button
  - Link to registration
  - Error/success alerts

- **Sign Up Tab:**
  - Email input
  - Password input
  - Confirm password input
  - Form validation
  - Auto-login on successful registration

**Features:**
- Tab-based interface
- Real-time form validation
- Loading states
- Error handling
- Secure JWT token storage

### 📤 Document Upload
- **Drag & Drop Area**
  - Visual feedback on hover
  - Accepts PDF and TXT files
  - File size validation (50MB max)

- **File Selection**
  - Browse button for file picker
  - Selected file info display
  - Clear selection option

- **Processing UI**
  - Progress indication
  - Status messages
  - Upload/processing animation

- **Result Display** (After processing):
  - Document information card
  - Summary section
  - Detailed analysis section
  - AI-generated conversation
  - Download button

- **Info Panel**
  - Step-by-step instructions
  - Pro tips
  - Feature highlights

**Navigation:**
- Top navigation bar with logo
- "History" button - View past conversions
- User profile menu
- Logout option

### 📋 Conversion History
- **List View**
  - Card-based layout
  - Document filename display
  - Conversion status badge
  - Creation date/time
  - Click to view details

- **Empty State**
  - Helpful message when no conversions yet
  - Quick link to upload new document

- **Navigation**
  - Back to upload
  - User menu
  - Logout

### 👁️ Conversation Details
- **Header Information**
  - Document name
  - Status badge
  - Document filename
  - Generation timestamp

- **Summary Section**
  - AI-generated summary of document
  - Key information highlighting

- **Analysis Section**
  - Detailed analysis of content
  - Insights and findings

- **Conversation Section**
  - Full AI-generated dialogue
  - Scrollable message thread
  - Speaker identification
  - Styled message bubbles

- **Action Buttons**
  - Back to history
  - Upload new document
  - Download report as TXT

---

## 🎯 User Workflows

### Workflow 1: First-Time User
1. Land on homepage
2. See introduction and features
3. Click "Upload Document" or "Login / Sign Up"
4. Authenticate (create account or login)
5. Redirected to upload page
6. Upload document
7. View generated conversation
8. Can upload more or view history

### Workflow 2: Returning User
1. Direct to login if not authenticated
2. Login with credentials
3. Redirected to upload page
4. Can upload new document or view history
5. Access past conversions with full details

### Workflow 3: View Conversion History
1. Click "History" button
2. See list of all past conversions
3. Click on a conversion to view details
4. Can download report or go back to upload

---

## 🛠️ Development Commands

```bash
# Start development server
npm start

# Build for production
npm build

# Run tests
npm test

# Eject configuration (one-way operation)
npm eject
```

---

## 🎭 Component Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── LandingPage.tsx          # Homepage with features
│   │   ├── Login.tsx                # Authentication (login/signup)
│   │   ├── DocumentUpload.tsx       # Upload & conversion display
│   │   ├── ConversationList.tsx     # History/list view
│   │   └── ConversationView.tsx     # Detailed conversation view
│   ├── App.tsx                      # Main app container & routing
│   ├── index.tsx                    # React entry point
│   ├── index.css                    # Global styles
│   └── ...
├── package.json
├── tsconfig.json
└── ...
```

---

## 🎨 Theme & Styling

### Color Palette
- **Primary:** Indigo (#6366f1)
- **Secondary:** Pink (#ec4899)
- **Background:** Light slate (#f8fafc)
- **Text:** Dark slate (#1e293b)
- **Success:** Green
- **Error:** Red
- **Warning:** Orange
- **Info:** Blue

### Typography
- **Headings:** Inter / Roboto, bold
- **Body:** Inter / Roboto, regular
- **Code:** Source Code Pro

### Components Customization
- Rounded borders (12px default)
- Smooth transitions (0.3s)
- Material-UI button shadows
- Custom card styling with borders
- Hover effects on interactive elements

---

## 🔐 Security Features

- **JWT Authentication**
  - Token stored in localStorage
  - Sent with every API request
  - Auto-logout on token expiration

- **Form Validation**
  - Email format validation
  - Password strength checking
  - File type/size validation

- **API Communication**
  - HTTPS ready (configure for production)
  - CORS configured
  - Error handling for all requests

---

## 📊 API Integration

### Base URL
```
http://localhost:8000
```

### Key Endpoints Used

**Authentication:**
- `POST /auth/register` - Create new account
- `POST /login` - User login

**Documents:**
- `POST /upload-document` - Upload file
- `POST /convert-document` - Convert to conversation
- `GET /conversations` - Get user's conversations
- `GET /conversation/{id}` - Get specific conversation

**Headers:**
```javascript
{
  'Authorization': 'Bearer {token}',
  'Content-Type': 'multipart/form-data' // for file uploads
}
```

---

## 🐛 Troubleshooting

### Common Issues

1. **"Cannot connect to backend"**
   - Ensure backend is running on port 8000
   - Check CORS configuration
   - Verify API URL in code

2. **"Authentication failed"**
   - Clear localStorage (browser DevTools)
   - Try registering new account
   - Check backend auth configuration

3. **"File upload fails"**
   - Check file size (50MB max)
   - Verify file format (PDF or TXT only)
   - Check backend file upload configuration

4. **"Conversation not displaying"**
   - Check browser console for errors
   - Verify backend generated valid response
   - Try re-uploading document

---

## 📦 Production Build

1. **Build optimized bundle:**
```bash
npm run build
```

2. **Output location:** `build/` folder

3. **Deploy to hosting:**
   - Configure API URL for production
   - Update environment variables
   - Deploy static files to web server

### Environment Variables (Create `.env` file)
```
REACT_APP_API_URL=https://api.yourserver.com
REACT_APP_ENV=production
```

---

## 🚀 Performance Optimization

- Code splitting with React lazy loading
- Memoization for expensive components
- Image optimization
- CSS-in-JS for optimized styles
- Development server with hot reload

---

## 📱 Responsive Breakpoints

- **Mobile:** < 600px
- **Tablet:** 600px - 960px
- **Desktop:** 960px - 1280px
- **Large Desktop:** > 1280px

All components use Material-UI's responsive grid system for proper layout adaptation.

---

## ✅ Testing Checklist

Before production deployment:

- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices (iOS, Android)
- [ ] Verify authentication flow (login, signup, logout)
- [ ] Test file upload with various formats
- [ ] Verify conversation display and formatting
- [ ] Test history view with multiple conversions
- [ ] Check error handling and user feedback
- [ ] Verify download functionality
- [ ] Test responsive design on all breakpoints
- [ ] Check API error responses

---

## 📚 Additional Resources

- [Material-UI Documentation](https://mui.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Axios Documentation](https://axios-http.com/)

---

## 🤝 Support

For issues or questions, please refer to the main README.md or contact the development team.
