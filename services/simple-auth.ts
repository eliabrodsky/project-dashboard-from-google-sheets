import { google, Auth } from 'googleapis';
import { GOOGLE_CONFIG } from '../config';
import Logger from './logger';

const logger = new Logger('AuthService');

class SimpleAuthService {
  public oauth2Client: Auth.OAuth2Client;
  public isAuthenticated: boolean;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      GOOGLE_CONFIG.CLIENT_ID,
      GOOGLE_CONFIG.CLIENT_SECRET,
      GOOGLE_CONFIG.REDIRECT_URI
    );
    this.isAuthenticated = false;
    logger.info('AuthService initialized.');
  }
  
  getAuthUrl(): string {
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/gmail.send'
      ],
      prompt: 'consent'
    });
    logger.info('Generated authentication URL.');
    return url;
  }
  
  async authenticate(code: string): Promise<Auth.Credentials> {
    logger.info('Attempting to exchange authorization code for tokens.');
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      this.isAuthenticated = true;
      
      localStorage.setItem('project_tokens', JSON.stringify(tokens));
      logger.success('Successfully authenticated and stored tokens.', { expiry: new Date(tokens.expiry_date || 0).toLocaleString() });
      return tokens;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error_description || error.message || 'An unknown error occurred during authentication.';
      logger.error('Authentication failed during token exchange', error.response?.data || error);
      throw new Error(`Authentication failed: ${errorMessage}`);
    }
  }
  
  loadStoredTokens(): boolean {
    logger.info('Checking for stored tokens in localStorage.');
    try {
      const stored = localStorage.getItem('project_tokens');
      if (stored) {
        const tokens = JSON.parse(stored);
        if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
            logger.warn('Stored tokens are expired.');
            this.signOut();
            return false;
        }
        this.oauth2Client.setCredentials(tokens);
        this.isAuthenticated = true;
        logger.success('Successfully loaded and validated stored tokens.');
        return true;
      }
      logger.info('No stored tokens found.');
    } catch (error) {
      logger.error('Failed to load or parse stored tokens', error);
    }
    return false;
  }
  
  getClient(): Auth.OAuth2Client {
    if (!this.isAuthenticated) {
      logger.error('Attempted to get client, but user is not authenticated.', {});
      throw new Error('Not authenticated');
    }
    return this.oauth2Client;
  }
  
  signOut(): void {
    logger.info('Signing out user and clearing tokens.');
    this.isAuthenticated = false;
    this.oauth2Client.setCredentials({});
    localStorage.removeItem('project_tokens');
  }
}

const authService = new SimpleAuthService();
export default authService;