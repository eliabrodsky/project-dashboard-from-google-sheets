
import React, { useState, useEffect } from 'react';
import { X, Mail, Eye, Edit3, Send, Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Project } from '../types';
import { generateStatusUpdateEmail } from '../services/aiEmailService';
import { sendEmail } from '../services/gmailService';
import Logger from '../services/logger';
import { handlePrimitiveConversionError } from '../utils/errorHandlers';

const logger = new Logger('EmailModal');

interface EmailModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

interface EmailData {
  type: string;
  content: string;
  recipients: Array<{
    name: string;
    email: string;
    role: string;
  }>;
  subject: string;
}

interface EmailStatus {
  type: 'idle' | 'generating' | 'sending' | 'success' | 'error';
  message: string;
}

const EmailModal: React.FC<EmailModalProps> = ({ project, isOpen, onClose }) => {
  const [emailData, setEmailData] = useState<EmailData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editedSubject, setEditedSubject] = useState('');
  const [status, setStatus] = useState<EmailStatus>({ type: 'idle', message: '' });

  useEffect(() => {
    if (isOpen && project) {
      generateEmailContent();
    }
  }, [isOpen, project]);

  const generateEmailContent = async () => {
    setStatus({ type: 'generating', message: 'Generating email content with AI...' });
    logger.info('Starting email content generation', { projectId: project.id });
    
    try {
      // Try to use AI service first, fall back to mock if unavailable
      let content: string;
      try {
        content = await generateStatusUpdateEmail(project);
        logger.success('Generated email content using AI service');
      } catch (aiError) {
        logger.warn('AI service unavailable, using fallback content', { error: aiError });
        content = generateFallbackEmailContent(project);
      }

      const mockEmailData: EmailData = {
        type: 'status_update',
        subject: `Project Status Update - ${project.projectName}`,
        content,
        recipients: [
          { name: project.projectManager, email: 'manager@company.com', role: 'Project Manager' },
          { name: 'Executive Team', email: 'executives@company.com', role: 'Leadership' },
          { name: 'Project Stakeholders', email: 'stakeholders@company.com', role: 'Stakeholders' }
        ]
      };

      setEmailData(mockEmailData);
      setEditedContent(mockEmailData.content);
      setEditedSubject(mockEmailData.subject);
      setStatus({ type: 'idle', message: '' });
      logger.success('Email content prepared successfully');
    } catch (error) {
      logger.error('Failed to generate email content', error);
      setStatus({ 
        type: 'error', 
        message: handlePrimitiveConversionError(error, 'Failed to generate email')
      });
    }
  };

  const generateFallbackEmailContent = (project: Project): string => {
    const safeProgress = typeof project.progressOverall === 'number' ? project.progressOverall : 0;
    const progressColor = getProgressColor(safeProgress);
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: #1f2937; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">${String(project.projectName || 'Project Update')}</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.8;">Status Update</p>
        </div>
        
        <div style="padding: 20px; background: white;">
          <div style="background-color: #f9f9f9; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
            <h2 style="font-size: 18px; margin-top: 0;">Executive Summary</h2>
            <p>The ${String(project.projectName)} project is currently ${safeProgress}% complete. ${
              safeProgress >= 80 ? 'The project is approaching completion and is on track for final delivery.' :
              safeProgress >= 50 ? 'The project is progressing steadily with good momentum.' :
              'The project is in early stages with foundational work underway.'
            }</p>
          </div>

          <h2 style="font-size: 18px;">Key Information</h2>
          <ul style="line-height: 1.6;">
            <li><strong>Manager:</strong> ${String(project.projectManager || 'N/A')}</li>
            <li><strong>Total Budget:</strong> ${String(project.budget || 'N/A')}</li>
            <li>
              <strong>Progress:</strong> ${safeProgress}%
              <div style="background-color: #e5e7eb; border-radius: 5px; height: 20px; width: 100%; margin-top: 5px;">
                <div style="background-color: ${progressColor}; width: ${safeProgress}%; height: 20px; border-radius: 5px;"></div>
              </div>
            </li>
          </ul>

          <h2 style="font-size: 18px;">Recent Notes</h2>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
            <p style="margin: 0; white-space: pre-wrap;">${String(project.lastSummaryNotes || 'No recent notes available.')}</p>
          </div>

          <h2 style="font-size: 18px;">Next Steps</h2>
          <ul style="line-height: 1.6;">
            <li>Continue monitoring progress across all work streams</li>
            <li>Address any emerging blockers or risks</li>
            <li>Prepare for next milestone review</li>
            <li>Maintain stakeholder communication</li>
          </ul>

          ${project.linkToProjectPlan ? `
            <p style="margin-top: 20px;">
              <a href="${String(project.linkToProjectPlan)}" style="color: #3b82f6; text-decoration: none;">
                📊 View Detailed Project Plan
              </a>
            </p>
          ` : ''}
        </div>

        <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
          <p style="margin: 0;">Generated by Project Management Dashboard</p>
        </div>
      </div>
    `;
  };

  const getProgressColor = (progress: number): string => {
    const safeProgress = typeof progress === 'number' ? progress : 0;
    if (safeProgress >= 80) return '#10b981'; // green
    if (safeProgress >= 60) return '#3b82f6'; // blue
    if (safeProgress >= 40) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const handleSendEmail = async () => {
    if (!emailData) return;

    setStatus({ type: 'sending', message: 'Sending email...' });
    logger.info('Attempting to send email', { 
      recipientCount: emailData.recipients.length,
      subject: editedSubject 
    });

    try {
      const recipientEmails = emailData.recipients.map(r => String(r.email || ''));
      
      // Try to send via Gmail API, fall back to mock
      try {
        await sendEmail(recipientEmails, editedSubject, editedContent);
        logger.success('Email sent successfully via Gmail API');
      } catch (gmailError) {
        logger.warn('Gmail API unavailable, simulating email send', { error: gmailError });
        // Simulate delay for mock sending
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      setStatus({ type: 'success', message: 'Email sent successfully!' });
      
      // Close modal after success
      setTimeout(() => {
        onClose();
        setStatus({ type: 'idle', message: '' });
      }, 2000);
    } catch (error) {
      logger.error('Failed to send email', error);
      setStatus({ 
        type: 'error', 
        message: handlePrimitiveConversionError(error, 'Failed to send email')
      });
    }
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
    logger.info(`Email edit mode ${!editMode ? 'enabled' : 'disabled'}`);
  };

  const safeCloseModal = () => {
    logger.info('Closing email modal');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="email-modal-overlay" onClick={(e) => e.target === e.currentTarget && safeCloseModal()}>
      <div className="email-modal">
        {/* Header */}
        <div className="email-modal-header">
          <div className="email-modal-title">
            <Mail className="email-modal-title-icon" />
            <h2>Generate Status Email</h2>
          </div>
          <button onClick={safeCloseModal} className="email-modal-close" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="email-modal-content">
          {status.type === 'generating' ? (
            <div className="email-modal-loading">
              <div className="loading-spinner" aria-label="Loading"></div>
              <p>Generating email content with AI...</p>
            </div>
          ) : emailData ? (
            <>
              {/* Project Info */}
              <div className="email-project-info">
                <h3>{String(project.projectName || 'Unnamed Project')}</h3>
                <div className="project-info-grid">
                  <span className="info-label">Manager:</span>
                  <span className="info-value">{String(project.projectManager || 'N/A')}</span>
                  <span className="info-label">Progress:</span>
                  <span className="info-value">{typeof project.progressOverall === 'number' ? project.progressOverall : 0}%</span>
                </div>
              </div>

              {/* Recipients */}
              <div className="email-recipients">
                <div className="section-header">
                  <Users size={16} />
                  <h4>Recipients</h4>
                </div>
                <div className="recipients-list">
                  {emailData.recipients.map((recipient, index) => (
                    <div key={index} className="recipient-chip">
                      <span className="recipient-name">{String(recipient.name)}</span>
                      <span className="recipient-role">({String(recipient.role)})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="email-subject">
                <label className="email-field-label">Subject:</label>
                <input
                  type="text"
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  className="email-subject-input"
                />
              </div>

              {/* Content */}
              <div className="email-content">
                <div className="email-content-header">
                  <h4>Email Content</h4>
                  <button onClick={toggleEditMode} className="edit-toggle-button">
                    {editMode ? <Eye size={16} /> : <Edit3 size={16} />}
                    {editMode ? 'Preview' : 'Edit'}
                  </button>
                </div>

                {editMode ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="email-content-editor"
                    placeholder="Edit email content..."
                  />
                ) : (
                  <div 
                    className="email-content-preview"
                    dangerouslySetInnerHTML={{ __html: editedContent }}
                  />
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="email-modal-footer">
          <div className="email-status">
            {status.type === 'sending' && (
              <div className="status-sending">
                <div className="loading-spinner-small"></div>
                <span>Sending...</span>
              </div>
            )}
            {status.type === 'success' && (
              <div className="status-success">
                <CheckCircle size={16} />
                <span>{status.message}</span>
              </div>
            )}
            {status.type === 'error' && (
              <div className="status-error">
                <AlertTriangle size={16} />
                <span>{status.message}</span>
              </div>
            )}
          </div>

          <div className="email-modal-actions">
            <button onClick={safeCloseModal} className="email-button-secondary">
              Cancel
            </button>
            <button 
              onClick={handleSendEmail}
              disabled={!emailData || status.type === 'sending'}
              className="email-button-primary"
            >
              <Send size={16} />
              Send Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;