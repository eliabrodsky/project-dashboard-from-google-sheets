import { google } from 'googleapis';
import authService from './simple-auth';
import logger from './logger';

const CONTEXT = 'GmailService';

async function getGmailClient() {
    if (!authService.isAuthenticated) {
        logger.error('Attempted to get Gmail client, but user is not authenticated.', {}, CONTEXT);
        throw new Error('User is not authenticated. Cannot send email.');
    }
    const client = authService.getClient();
    return google.gmail({ version: 'v1', auth: client });
}

function createEmailMessage(to: string[], subject: string, htmlContent: string): string {
    const messageParts = [
      'MIME-Version: 1.0',
      `To: ${to.join(', ')}`,
      'Content-Type: text/html; charset=utf-8',
      `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      '',
      htmlContent,
    ];
    const message = messageParts.join('\n');
    
    const utf8SafeMessage = unescape(encodeURIComponent(message));
    const base64Encoded = btoa(utf8SafeMessage);
    return base64Encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sendEmail(to: string[], subject: string, htmlContent: string): Promise<void> {
    logger.info('Preparing to send email via Gmail API.', { to, subjectLength: subject.length }, CONTEXT);
    try {
        const gmail = await getGmailClient();
        logger.info('Gmail client obtained.', undefined, CONTEXT);
        const rawMessage = createEmailMessage(to, subject, htmlContent);
        logger.info('Encoded email message for API.', undefined, CONTEXT);

        await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: rawMessage,
            },
        });
        logger.success('Successfully sent email via Gmail API.', undefined, CONTEXT);
    } catch (error: any) {
        const errorMessage = error.response?.data?.error?.message || error.message || 'An unknown error occurred while sending the email.';
        logger.error('Failed to send email via Gmail API', error, CONTEXT);
        throw new Error(`Gmail API Error: ${errorMessage}`);
    }
}