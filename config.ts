// IMPORTANT: Replace these with your actual Google Cloud credentials.
// You can get them from the Google Cloud Console: https://console.cloud.google.com/apis/credentials
// IMPORTANT: The Redirect URI must be the exact URL of your deployed application and must be added to your "Authorized redirect URIs" in the Cloud Console.

export const GOOGLE_CONFIG = {
    CLIENT_ID: '668607868334-5ksg6b49pjjtsckqdbuu20t7j70mcd86.apps.googleusercontent.com', // Replace with your Client ID
    CLIENT_SECRET: 'YOUR_GOOGLE_CLIENT_SECRET', // Replace with your Client Secret
    REDIRECT_URI: 'https://dchc-internal-project-management-dashboard-668607868334.us-west1.run.app/', // Replace with your app's deployed URL
};

// IMPORTANT: Add your Gemini API Key here.
// You can get a key from Google AI Studio: https://aistudio.google.com/app/apikey
// In a production environment, you would use a secure method to provide this key.
export const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

export const SPREADSHEET_CONFIG = {
    ID: '1cXMam-lw1W3idSH6IzdgJEraFVE8s2L8LvF10SRYR4k',
    SHEET_NAME: 'Sheet1',
    RANGE: 'A1:G100',
};

export const REFRESH_INTERVAL = 60000; // 1 minute

// Email configuration
export const EMAIL_CONFIG = {
    DEFAULT_RECIPIENTS: [
        'executives@company.com',
        'project-managers@company.com',
        'stakeholders@company.com'
    ],
    SENDER_EMAIL: 'noreply@company.com',
};

// For development, we can assume a 'development' like environment.
// In a real build process, this would be set dynamically.
const isDevelopment = true;

// Error handling configuration
export const ERROR_CONFIG = {
    ENABLE_GLOBAL_ERROR_HANDLERS: true,
    LOG_LEVEL: isDevelopment ? 'debug' : 'info',
    ENABLE_ERROR_BOUNDARY: true,
    FALLBACK_ERROR_MESSAGE: 'An unexpected error occurred. Please try refreshing the page.'
};

// Development helpers
export const DEV_CONFIG = {
    ENABLE_DEBUG_LOGGING: isDevelopment,
    MOCK_EMAIL_SENDING: isDevelopment,
    ENABLE_OBJECT_DEBUGGING: isDevelopment
};

// Auto-validate on load
if (typeof window !== 'undefined') {
    setTimeout(() => {
        const issues: string[] = [];
        if (!GOOGLE_CONFIG.CLIENT_ID || GOOGLE_CONFIG.CLIENT_ID.startsWith('YOUR_GOOGLE_CLIENT')) {
            issues.push('Google Client ID not configured in src/config.ts');
        }
        if (!GEMINI_API_KEY || GEMINI_API_KEY.startsWith('YOUR_GEMINI_API_KEY')) {
            issues.push('Gemini API Key not configured in src/config.ts (AI features will be disabled)');
        }
        
        if (issues.length > 0) {
            console.group('⚙️ Configuration Status');
            console.warn('Some configuration items need attention:');
            issues.forEach(issue => console.warn(`• ${issue}`));
            console.info('Check src/config.ts to update configuration');
            console.groupEnd();
        } else {
             console.info('✅ Configuration validated successfully');
        }
    }, 1000);
}
