# Waterlily Survey

A full-stack survey application built with Next.js, TypeScript, TailwindCSS, and Firebase.

## Features

- 🔐 User authentication with Firebase Auth
- 📝 Create custom surveys with multiple question types
- 🔗 Share surveys with unique links
- 📊 View and analyze survey responses
- 📱 Responsive design for all devices

## Technology Stack

- **Frontend:** Next.js 14, React, TypeScript, TailwindCSS
- **Backend:** Next.js API Routes
- **Database:** Firebase Firestore
- **Authentication:** Firebase Authentication
- **Form Handling:** React Hook Form

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/waterlily-survey.git
   cd waterlily-survey
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file based on `.env.local.example`:
   ```
   cp .env.local.example .env.local
   ```

4. Create a Firebase project and add a web app:
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Add a web app to your project
   - Enable Authentication (Email/Password and Google provider)
   - Enable Firestore database

5. Add your Firebase configuration to `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

6. Run the development server:
   ```
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
waterlily-survey/
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js app router
│   │   ├── api/         # API routes
│   │   ├── auth/        # Authentication pages
│   │   ├── create/      # Survey creation
│   │   ├── dashboard/   # User dashboard
│   │   ├── surveys/     # Survey viewing and results
│   ├── components/      # React components
│   ├── contexts/        # Context providers
│   ├── lib/             # Utility functions
├── .env.local.example   # Example environment variables
├── next.config.ts       # Next.js configuration
├── package.json         # Project dependencies
├── tsconfig.json        # TypeScript configuration
```

## Usage

### Creating a Survey

1. Sign in to your account
2. Navigate to the "Create Survey" page
3. Add a title and description for your survey
4. Add questions (text or multiple choice)
5. Click "Create Survey" to save

### Sharing a Survey

1. From your dashboard, find the survey you want to share
2. Click the "Share" button
3. Copy the unique link and share it with respondents

### Viewing Results

1. From your dashboard, find the survey you want to view results for
2. Click "View Results"
3. Toggle between summary view and individual responses

## Deployment

This application can be easily deployed to Vercel:

1. Push your code to a GitHub repository
2. Import the repository in Vercel
3. Add the required environment variables
4. Deploy!

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
- [React Hook Form](https://react-hook-form.com/)
