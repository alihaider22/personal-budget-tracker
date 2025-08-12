# Personal Budget Tracker

A modern, full-stack personal budget tracking application built with Next.js, TypeScript, Tailwind CSS, and Firebase.

## Features

- 🔐 **User Authentication** - Secure login/signup with email/password and Google OAuth
- 💰 **Transaction Management** - Add, edit, and delete income and expense transactions
- 📊 **Real-time Analytics** - Visualize your spending patterns and income trends
- 🏷️ **Category Management** - Organize transactions with customizable categories
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- ☁️ **Cloud Storage** - All data is securely stored in Firebase Firestore
- 🔄 **Real-time Sync** - Changes are instantly synchronized across devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd personal-budget-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**

   a. Go to [Firebase Console](https://console.firebase.google.com/)
   b. Create a new project
   c. Enable Authentication:
      - Go to Authentication > Sign-in method
      - Enable Email/Password
      - Enable Google (optional)
   d. Enable Firestore Database:
      - Go to Firestore Database
      - Create database in test mode
   e. Get your Firebase config:
      - Go to Project Settings > General
      - Scroll down to "Your apps" section
      - Click the web icon (</>)
      - Register your app and copy the config

4. **Configure environment variables**
   
   Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your Firebase configuration in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Firebase Security Rules

Make sure to set up proper Firestore security rules. Here's a basic example:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /transactions/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /categories/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /budgets/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── analytics/         # Analytics page
│   ├── settings/          # Settings page
│   ├── transactions/      # Transactions page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Dashboard page
├── components/            # React components
│   ├── AuthPage.tsx       # Authentication page
│   ├── LoginForm.tsx      # Login form
│   ├── Navigation.tsx     # Navigation bar
│   ├── ProtectedRoute.tsx # Route protection
│   ├── SignupForm.tsx     # Signup form
│   └── TransactionForm.tsx # Transaction form
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
├── lib/                   # Firebase configuration and services
│   ├── firebase.ts        # Firebase initialization
│   └── firebaseServices.ts # Firebase CRUD operations
├── types/                 # TypeScript type definitions
│   └── index.ts
└── utils/                 # Utility functions
    └── index.ts
```

## Features in Detail

### Authentication
- Email/password authentication
- Google OAuth integration
- Protected routes
- User session management

### Transaction Management
- Add income and expense transactions
- Categorize transactions
- Date-based filtering
- Real-time updates

### Analytics
- Monthly spending overview
- Income vs expense charts
- Category-wise breakdown
- Budget tracking

### Settings
- Category management
- Data export/import
- Account settings

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
