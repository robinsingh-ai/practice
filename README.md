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


# Waterlily Survey System

A full-featured survey creation and management system built with Next.js, Firebase, and TailwindCSS.

## System Architecture Overview

### 1. Frontend Architecture
- **Next.js App** - React-based framework for server-side rendering and client-side navigation
- **TailwindCSS** - Styling framework for responsive design
- **Client-side Authentication** - Using both Firebase Auth and NextAuth.js

### 2. Backend Architecture
- **Firebase/Firestore** - NoSQL database for storing surveys, responses, and user data
- **Next.js API Routes** - Serverless functions for API endpoints

### 3. Authentication System
- **Dual Authentication System**:
  - Firebase Authentication for direct user management
  - NextAuth.js for social login options and session management

## Data Models

### User
```typescript
interface User {
  uid: string;          // Firebase user ID
  email: string;        // User email
  displayName?: string; // Optional display name
}
```

### Survey
```typescript
interface Survey {
  id?: string;          // Generated by Firestore
  title: string;        // Survey title
  description: string;  // Survey description
  questions: Question[]; // Array of questions
  createdBy: string;    // User ID of creator
  createdAt: Timestamp; // Creation timestamp
}
```

### Question
```typescript
interface Question {
  id: string;           // Unique question ID
  type: 'text' | 'multipleChoice'; // Question type
  question: string;     // Question text
  options?: string[];   // Available for multiple choice
}
```

### Response
```typescript
interface Response {
  id?: string;          // Generated by Firestore
  surveyId: string;     // Survey this response belongs to
  answers: Answer[];    // Array of answers
  respondentEmail?: string; // Optional respondent email
  createdAt: Timestamp; // Submission timestamp
}
```

### Answer
```typescript
interface Answer {
  questionId: string;           // Question being answered
  answer: string | string[];    // Response text or selected option(s)
}
```

## Database Structure (Firestore)

```
/users
  /{userId}
    - email
    - displayName
    - ...other user data

/surveys
  /{surveyId}
    - title
    - description
    - questions: [
        {
          id
          type
          question
          options (for multiple choice)
        }
      ]
    - createdBy
    - createdAt

/responses
  /{responseId}
    - surveyId
    - answers: [
        {
          questionId
          answer
        }
      ]
    - respondentEmail
    - createdAt
```

## Key Firestore Indexes
1. `surveys`: composite index on `createdBy` (ASC) and `createdAt` (DESC)
2. `responses`: composite index on `surveyId` (ASC) and `createdAt` (DESC)

## Application Flow

### Authentication Flow
1. User signs up/in using Firebase Auth or social login
2. Authentication context is shared across the app
3. Protected routes check for auth status before rendering

### Survey Creation Flow
1. Authenticated user creates a new survey
2. Add questions (text or multiple choice)
3. Survey is saved to Firestore with user as creator

### Survey Response Flow
1. Anyone with the survey link can access it
2. Users fill out the survey (login encouraged but optional)
3. Responses saved to Firestore, with user email if logged in

### Results Viewing Flow
1. Only the survey creator can access results
2. Results display both summary data and individual responses
3. Multiple choice questions show distribution visualization

## User Interfaces

### Main Pages
1. **Dashboard** - List of user's surveys with creation/response stats
2. **Survey Creator** - Interface for creating and editing surveys
3. **Survey View** - Public interface for answering surveys
4. **Results View** - Data visualization of responses (creator only)
5. **Authentication Pages** - Login, signup, password reset

## Security Rules

### Firestore Rules
```
service cloud.firestore {
  match /databases/{database}/documents {
    // Surveys can be read by anyone, but created/edited only by authenticated users
    match /surveys/{surveyId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.createdBy;
    }
    
    // Responses can be created by anyone, but read only by the survey creator
    match /responses/{responseId} {
      allow create: if true;
      allow read: if request.auth != null && 
                   get(/databases/$(database)/documents/surveys/$(resource.data.surveyId)).data.createdBy == request.auth.uid;
    }
  }
}
```

## Future Expandability
1. **Analytics Integration** - For deeper insights into survey data
2. **Enhanced Question Types** - Rating scales, matrix questions, etc.
3. **Team Collaboration** - Allow multiple users to manage the same surveys
4. **Customizable Themes** - Branded survey experiences
5. **API Access** - For integration with other systems

## Getting Started

### Prerequisites
- Node.js 14.x or higher
- Firebase project with Firestore and Authentication enabled

### Installation
1. Clone the repository
```bash
git clone https://github.com/yourusername/waterlily-survey.git
cd waterlily-survey
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env.local` file with the following variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) to view the app

## License
MIT 







Why Firestore Needs Indexes
Firestore requires indexes for efficiency reasons. Here's a simple explanation:
Performance Optimization: Indexes make queries faster by pre-sorting data. Without indexes, Firestore would need to scan every document in a collection to find matches, which would be extremely slow.
Complex Queries Need Special Indexes: When you combine filtering (like where()) with sorting (like orderBy()), Firestore needs composite indexes to efficiently execute these queries.
The Error You Saw: Firestore deliberately throws an error when you try to run a query that doesn't have a supporting index. This is a design decision to ensure all queries are efficient.
In your specific case:
You're filtering responses by surveyId (to find responses for a specific survey)
AND you're sorting them by createdAt in descending order (to show newest first)
This combination requires a composite index because Firestore needs to:
Quickly find all documents matching the survey ID
Have those documents already pre-sorted by creation date
Without the index, Firestore would need to:
Scan the entire collection for matching survey IDs
Then sort all matching documents by date
For large collections, this would be extremely inefficient and slow. By requiring indexes, Firestore ensures all queries remain fast, even as your database grows.



## FAQ - Technical Decisions

### Why did you choose Next.js instead of a separate React frontend and Node.js backend?

I chose Next.js for this project because it provides an all-in-one solution that combines React for the frontend with server-side capabilities, eliminating the need for a separate backend. This approach offers several advantages:

1. **Unified codebase**: Next.js allowed me to keep all code in a single repository, simplifying development and deployment.

2. **API routes**: Next.js provides API routes feature that functions like a lightweight Node.js backend, allowing me to create API endpoints within the same framework.

3. **Server-side rendering**: For survey interfaces, having server-side rendering improves loading performance and SEO without requiring a separate rendering service.

4. **Simplified state management**: The unified model reduced complexity in managing state between frontend and backend.

This approach let me focus more on implementing the core survey functionality rather than setting up communication between separate services.

### Why did you choose Firebase/Firestore instead of a SQL database?

While the specifications suggested a SQL database, I opted for Firebase/Firestore for several reasons:

1. **Real-time capabilities**: Firestore's real-time updates are ideal for a survey application, allowing instant display of new responses.

2. **Authentication integration**: Firebase Auth provided a robust authentication system with minimal setup, which was crucial for managing survey ownership and permissions.

3. **Flexible schema**: Survey questions and responses can vary significantly in structure, making Firestore's schema-less approach well-suited for this application.

4. **Scalability**: Firestore automatically handles scaling, which is important for a survey system that might experience variable load patterns.

5. **Reduced backend complexity**: Using Firebase allowed me to implement complex features like authentication and real-time updates without writing extensive backend code.

I did implement proper data modeling with clear relationships between surveys, questions, and responses to maintain the relational aspects that would be present in a SQL database. The composite indexes I created also provide efficient querying similar to what you'd expect in a relational system.

### How did you approach authentication in your solution?

I implemented a dual authentication system:

1. **Firebase Authentication**: Provides the core user management, handling sign-up, login, and session persistence.

2. **NextAuth.js**: Adds support for social logins and manages session state across the application.

This approach gives users flexibility in how they authenticate while maintaining strong security. For survey responses, I designed the system to encourage authentication but allow anonymous submissions, storing the respondent's email when available to provide survey creators with more context about who responded.

### How did you handle data relationships without a relational database?

Even though I used a NoSQL database, I maintained clear data relationships through thoughtful modeling:

1. **References**: Each response contains a reference to its parent survey through the surveyId field.

2. **Permission control**: I implemented security rules that enforce relationships, such as only allowing survey creators to view responses for their surveys.

3. **Composite indexes**: I created specific indexes to efficiently query related data, such as finding all responses for a particular survey sorted by creation date.

4. **Data validation**: I implemented validation to ensure referential integrity, making sure responses can't be created for non-existent surveys.

This approach provides many of the benefits of a relational database while taking advantage of Firestore's flexibility and real-time capabilities.

### How did you approach the UI/UX design for creating and taking surveys?

I focused on creating an intuitive, clean UI using TailwindCSS:

1. **Survey creator**: The interface allows users to easily add, edit, and reorder different question types with immediate visual feedback.

2. **Survey response**: The public-facing survey interface is clean and responsive, working well on both mobile and desktop devices.

3. **Results visualization**: For survey creators, I implemented both summary statistics with visualizations and detailed individual response views.

4. **Responsive design**: All interfaces adapt to different screen sizes, ensuring a good user experience across devices.

The TailwindCSS framework allowed me to create a consistent, modern design system without writing custom CSS, speeding up development while maintaining a professional appearance.

## Future Expandability
1. **Analytics Integration** - For deeper insights into survey data
2. **Enhanced Question Types** - Rating scales, matrix questions, etc.
3. **Team Collaboration** - Allow multiple users to manage the same surveys
4. **Customizable Themes** - Branded survey experiences
5. **API Access** - For integration with other systems