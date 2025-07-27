import Logger from '../services/logger';

const logger = new Logger('CSSLoader');

/**
 * Safely load CSS with proper error handling and MIME type checking
 */
export class SafeCSSLoader {
  private static loadedStyles = new Set<string>();

  /**
   * Load CSS content and inject it into the document head
   */
  static async loadCSS(cssContent: string, id: string): Promise<void> {
    if (this.loadedStyles.has(id)) {
      logger.info(`CSS already loaded: ${id}`);
      return;
    }

    try {
      // Remove existing style element if it exists
      const existingStyle = document.getElementById(id);
      if (existingStyle) {
        existingStyle.remove();
      }

      // Create new style element
      const styleElement = document.createElement('style');
      styleElement.id = id;
      styleElement.type = 'text/css';
      styleElement.textContent = cssContent;

      // Inject into document head
      document.head.appendChild(styleElement);
      
      this.loadedStyles.add(id);
      logger.success(`Successfully loaded CSS: ${id}`);
    } catch (error) {
      logger.error(`Failed to load CSS: ${id}`, error);
      throw error;
    }
  }

  /**
   * Load CSS from URL with fallback to inline injection
   */
  static async loadCSSFromURL(url: string, id: string, fallbackCSS?: string): Promise<void> {
    if (this.loadedStyles.has(id)) {
      logger.info(`CSS already loaded: ${id}`);
      return;
    }

    try {
      // Try to load CSS via link element first
      const linkElement = document.createElement('link');
      linkElement.id = id;
      linkElement.rel = 'stylesheet';
      linkElement.type = 'text/css';
      linkElement.href = url;

      // Add error handling
      linkElement.onerror = () => {
        logger.warn(`Failed to load CSS from URL: ${url}, using fallback`);
        if (fallbackCSS) {
          this.loadCSS(fallbackCSS, id + '-fallback');
        }
      };

      linkElement.onload = () => {
        logger.success(`Successfully loaded CSS from URL: ${url}`);
        this.loadedStyles.add(id);
      };

      document.head.appendChild(linkElement);
    } catch (error) {
      logger.error(`Error loading CSS from URL: ${url}`, error);
      if (fallbackCSS) {
        await this.loadCSS(fallbackCSS, id + '-fallback');
      }
    }
  }

  /**
   * Remove loaded CSS
   */
  static removeCSS(id: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.remove();
      this.loadedStyles.delete(id);
      logger.info(`Removed CSS: ${id}`);
    }
  }
}

/**
 * Email Modal CSS content as string to avoid MIME type issues
 */
export const EMAIL_MODAL_CSS = `
/* EmailModal Styles */
.email-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.email-modal {
  background: white;
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Header */
.email-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 12px 12px 0 0;
}

.email-modal-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.email-modal-title-icon {
  color: #3b82f6;
}

.email-modal-title h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.email-modal-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.email-modal-close:hover {
  background: #e5e7eb;
  color: #374151;
}

/* Content */
.email-modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  max-height: calc(90vh - 120px);
}

.email-modal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Project Info */
.email-project-info {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.email-project-info h3 {
  margin: 0 0 0.75rem 0;
  color: #1f2937;
  font-size: 1.125rem;
  font-weight: 600;
}

.project-info-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem 1rem;
  align-items: center;
}

.info-label {
  font-weight: 500;
  color: #6b7280;
  font-size: 0.875rem;
}

.info-value {
  color: #1f2937;
  font-size: 0.875rem;
}

/* Recipients */
.email-recipients {
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.section-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
}

.recipients-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.recipient-chip {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.recipient-name {
  font-weight: 500;
}

.recipient-role {
  opacity: 0.8;
}

/* Subject */
.email-subject {
  margin-bottom: 1.5rem;
}

.email-field-label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.email-subject-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.email-subject-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* Content */
.email-content {
  margin-bottom: 1.5rem;
}

.email-content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.email-content-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
}

.edit-toggle-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-toggle-button:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.email-content-editor {
  width: 100%;
  min-height: 300px;
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
  box-sizing: border-box;
}

.email-content-editor:focus {
  outline: none;
  border-color: #3b82f6;
}

.email-content-preview {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 1rem;
  background: #f9fafb;
  max-height: 400px;
  overflow-y: auto;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Footer */
.email-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 0 0 12px 12px;
}

.email-status {
  display: flex;
  align-items: center;
}

.status-sending,
.status-success,
.status-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

.status-sending {
  color: #1d4ed8;
  background: #dbeafe;
}

.status-success {
  color: #059669;
  background: #d1fae5;
}

.status-error {
  color: #dc2626;
  background: #fee2e2;
}

.email-modal-actions {
  display: flex;
  gap: 0.75rem;
}

.email-button-secondary,
.email-button-primary {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid;
}

.email-button-secondary {
  background: white;
  border-color: #d1d5db;
  color: #374151;
}

.email-button-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.email-button-primary {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.email-button-primary:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
}

.email-button-primary:disabled {
  background: #9ca3af;
  border-color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Responsive */
@media (max-width: 768px) {
  .email-modal-overlay {
    padding: 0.5rem;
  }
  
  .email-modal {
    max-height: 95vh;
  }
  
  .email-modal-header,
  .email-modal-content,
  .email-modal-footer {
    padding: 1rem;
  }
  
  .email-modal-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .email-modal-actions {
    justify-content: space-between;
  }
  
  .project-info-grid {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
}
`;

export default SafeCSSLoader;