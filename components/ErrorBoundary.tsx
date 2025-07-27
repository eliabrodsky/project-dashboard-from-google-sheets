
import React, { Component, ErrorInfo, ReactNode } from 'react';
import Logger from '../services/logger';

const logger = new Logger('ErrorBoundary');

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('React Error Boundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '2px solid #ef4444',
          borderRadius: '8px',
          backgroundColor: '#fef2f2',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h2 style={{ color: '#dc2626', marginTop: 0 }}>
            🚨 Something went wrong
          </h2>
          
          <details style={{ marginBottom: '16px' }}>
            <summary style={{ 
              cursor: 'pointer', 
              padding: '8px', 
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '4px'
            }}>
              Click to see error details
            </summary>
            
            <div style={{ 
              marginTop: '8px', 
              padding: '12px', 
              backgroundColor: '#fff', 
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'monospace'
            }}>
              <strong>Error Message:</strong>
              <pre style={{ margin: '8px 0', whiteSpace: 'pre-wrap' }}>
                {this.state.error?.message}
              </pre>
              
              <strong>Stack Trace:</strong>
              <pre style={{ 
                margin: '8px 0', 
                fontSize: '12px', 
                maxHeight: '200px', 
                overflow: 'auto',
                whiteSpace: 'pre-wrap'
              }}>
                {this.state.error?.stack}
              </pre>
              
              {this.state.errorInfo && (
                <>
                  <strong>Component Stack:</strong>
                  <pre style={{ 
                    margin: '8px 0', 
                    fontSize: '12px', 
                    maxHeight: '200px', 
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </>
              )}
            </div>
          </details>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
            
            <button
              onClick={this.handleReload}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
          </div>

          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            <strong>Troubleshooting Tips:</strong>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Check the browser console for additional error details</li>
              <li>Try refreshing the page</li>
              <li>Clear your browser cache and reload</li>
              <li>Check if you're signed in to Google properly</li>
              <li>Verify your Google Sheets permissions</li>
            </ul>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
