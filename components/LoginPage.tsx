
import React, { useEffect, useRef } from 'react';
import { GanttChartSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GOOGLE_CONFIG } from '../config';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const googleButtonDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.google || !googleButtonDiv.current) {
      return;
    }

    const handleCredentialResponse = (response: any) => {
      login(response.credential);
    };

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CONFIG.CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        googleButtonDiv.current,
        { theme: 'outline', size: 'large', text: 'signin_with', shape: 'rectangular' }
      );
      
    } catch (error) {
      console.error("Google Identity Services initialization failed:", error);
    }

  }, [login]);


  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-light-accent">
      <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-xl shadow-md">
        <div className="flex flex-col items-center text-center">
            <GanttChartSquare size={48} className="text-brand-primary" />
            <h1 className="mt-4 text-3xl font-bold text-brand-dark">Project Pulse</h1>
            <p className="mt-2 text-gray-600">
                Sign in to access your project management dashboard.
            </p>
        </div>
        <div className="flex justify-center" ref={googleButtonDiv}>
          {/* Google Sign-In button will be rendered here */}
        </div>
        {GOOGLE_CONFIG.CLIENT_ID.startsWith('YOUR_GOOGLE_CLIENT_ID') && (
            <div className="text-center text-xs text-red-500 p-2 bg-red-50 rounded-md border border-red-200">
                <p className="font-bold">Developer Note:</p>
                <p>Please replace the placeholder Google Client ID in <code>src/config.ts</code> to enable login.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
