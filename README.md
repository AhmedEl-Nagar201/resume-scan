# Resume Scan

Resume Scan is a web application that allows users to build, analyze, and optimize their resumes using AI-powered tools. It provides features like resume creation, job description matching, skill gap detection, and tailored recommendations to help users stand out in their job applications.

## Features

- **Resume Builder**: Create and customize professional resumes with real-time analysis and automated formatting.
- **Job Matcher**: Analyze how well your resume matches job descriptions and get personalized improvement suggestions.
- **AI Optimization**: Optimize your resume with keyword enhancements, content scoring, and continuous improvements.
- **User Authentication**: Secure user authentication with email/password and Google sign-in.
- **Admin Dashboard**: Manage users and resumes with admin privileges.
- **Responsive Design**: Fully responsive design for seamless use across devices.

## Tech Stack

- **Frontend**: React, Next.js, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **UI Components**: Radix UI, Lucide Icons
- **State Management**: React Context API
- **Other Libraries**: Zod, React Hook Form, Recharts, Embla Carousel

## Installation

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Firebase project with Firestore and Authentication enabled

### Steps

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/resume-scan.git
    cd resume-scan
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables:

    Create a `.env.local` file in the root directory and add the following:

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
    NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
    OPENROUTER_API_KEY=your-openrouter-api-key
    ```

4. Start the development server:

    ```bash
    npm run dev
    ```

5. Open the application in your browser at `http://localhost:3000`.

## Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Build the application for production.
- `npm run start`: Start the production server.
- `npm run lint`: Run linting checks.

## Folder Structure

```plaintext
resume-scan/
├── app/                     # Next.js app directory
│   ├── admin/               # Admin dashboard
│   ├── forgot-password/     # Forgot password page
│   ├── job-matcher/         # Job matcher feature
│   ├── login/               # Login page
│   ├── profile/             # User profile page
│   ├── resume-builder/      # Resume builder feature
│   ├── signup/              # Signup page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── components/              # Reusable UI components
│   ├── ui/                  # UI-specific components
│   ├── navbar.tsx           # Navigation bar
│   ├── resume-form.tsx      # Resume form
│   ├── resume-preview.tsx   # Resume preview
│   └── firebase-config-checker.tsx # Firebase configuration checker
├── contexts/                # React context providers
│   └── auth-context.tsx     # Authentication context
├── lib/                     # Utility libraries
│   ├── firebase.ts          # Firebase initialization
│   └── resume-service.ts    # Resume-related services
├── public/                  # Static assets
├── .env.local.example       # Example environment variables
├── package.json             # Project dependencies and scripts
└── README.md                # Project documentation
```

## Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project.
3. Enable Firestore and Authentication in the project.
4. Add your Firebase configuration to the `.env.local` file.

## Deployment

This project is optimized for deployment on [Vercel](https://vercel.com/). Follow these steps:

1. Push your code to a GitHub repository.
2. Connect your repository to Vercel.
3. Add the environment variables in the Vercel dashboard.
4. Deploy the application.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push the branch.
4. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Firebase](https://firebase.google.com/) for backend services.
- [Radix UI](https://www.radix-ui.com/) for accessible UI components.
- [Lucide Icons](https://lucide.dev/) for beautiful icons.
- [Next.js](https://nextjs.org/) for the React framework.

## Contact

For any inquiries or support, please contact:

- **Author**: Ahmed El Nagar
- **Email**: ahmedelnagar@example.com
- **WhatsApp**: [Contact on WhatsApp](https://wa.me/201067212579)
