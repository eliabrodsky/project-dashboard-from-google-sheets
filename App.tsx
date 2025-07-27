import React, { useState, useEffect } from 'react';
import authService from './services/simple-auth';
import projectService from './services/project-service';
import type { Project, ProjectSummary } from './types';
import { LogOut, Mail } from 'lucide-react';
import EmailModal from './components/EmailModal';
import ErrorBoundary from './components/ErrorBoundary';
import Logger from './services/logger';
import { SafeCSSLoader, EMAIL_MODAL_CSS } from './utils/cssLoader';
import { 
  safeString, 
  safeNumber, 
  handlePrimitiveConversionError, 
  setupGlobalErrorHandlers,
  debugObjectProperties,
  safeApiCall
} from './utils/errorHandlers';

const logger = new Logger('App');

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [summary, setSummary] = useState<ProjectSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedProjectForEmail, setSelectedProjectForEmail] = useState<Project | null>(null);

  // Setup error handlers and CSS on component mount
  useEffect(() => {
    setupGlobalErrorHandlers();
    
    // Load EmailModal CSS safely from string
    SafeCSSLoader.loadCSS(EMAIL_MODAL_CSS, 'email-modal-styles')
      .catch((cssError) => {
        logger.warn('Failed to load EmailModal CSS', cssError);
      });
      
    // Load main dashboard CSS safely from URL to fix MIME type issues
    SafeCSSLoader.loadCSSFromURL('/styles/ProjectDashboard.css', 'main-dashboard-styles')
      .catch((cssError) => {
        logger.warn('Failed to load main dashboard CSS from URL', cssError);
      });
  }, []);

  const handleError = (error: unknown, prefix: string) => {
    const errorMessage = handlePrimitiveConversionError(error, prefix);
    const finalMessage = `${safeString(prefix)}: ${safeString(errorMessage)}`;
    
    setError(finalMessage);
    logger.error(finalMessage, error);

    // Check for auth-related errors to prompt re-login
    const errorString = safeString(errorMessage).toLowerCase();
    if (errorString.includes('permission_denied') || errorString.includes('invalid_grant') || 
        errorString.includes('401') || errorString.includes('403')) {
      setError('Your session has expired or permissions are missing. Please sign in again.');
      authService.signOut();
      setIsAuthenticated(false);
    }
  };
  
  const handleAuthCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      logger.info('Authorization code found in URL, attempting to authenticate.');
      try {
        await authService.authenticate(code);
        logger.success('Authentication successful from auth code.');
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (authError) {
        handleError(authError, 'Authentication failed');
      }
    }
  };
  
  const fetchProjectData = async () => {
    logger.info('Attempting to fetch project data.');
    
    return safeApiCall(async () => {
      await projectService.initialize();
      const projectData = await projectService.getProjectData();
      
      // Debug problematic objects before processing
      if (projectData.length > 0) {
        debugObjectProperties(projectData[0], 'sample project');
      }
      
      const summaryData = projectService.getProjectSummary(projectData);
      
      setProjects(projectData);
      setSummary(summaryData);
      setIsAuthenticated(true);
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
      
      logger.success('Successfully fetched and processed project data.', { numProjects: projectData.length });
    }, 'fetchProjectData');
  };

  useEffect(() => {
    const initializeApp = async () => {
      logger.info('Initializing application...');
      setLoading(true);
      
      try {
        await handleAuthCallback();
        const hasTokens = authService.loadStoredTokens();
        if (hasTokens) {
          logger.info('User has stored tokens, proceeding to fetch data.');
          await fetchProjectData();
        } else {
          logger.warn('No stored tokens found. User needs to sign in.');
        }
      } catch (initError) {
        handleError(initError, 'App initialization failed');
      } finally {
        setLoading(false);
        logger.info('Application initialization complete.');
      }
    };

    initializeApp();
    
    const interval = setInterval(async () => {
      if (authService.isAuthenticated) {
        await refreshProjects(true);
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleSignIn = () => {
    logger.info('User initiated sign-in.');
    try {
      const authUrl = authService.getAuthUrl();
      window.location.href = authUrl;
    } catch (e) {
      handleError(e, 'Could not initiate sign-in. Please check your configuration');
    }
  };

  const handleSignOut = () => {
    logger.info('User initiated sign-out.');
    authService.signOut();
    setIsAuthenticated(false);
    setProjects([]);
    setSummary(null);
    setError(null);
  };
  
  const refreshProjects = async (isAutoRefresh = false) => {
    if (!isAuthenticated) return;
    logger.info(isAutoRefresh ? 'Auto-refreshing projects...' : 'Manual refresh initiated...');
    if (!isAutoRefresh) setIsRefreshing(true);
    
    try {
      await safeApiCall(async () => {
        const projectData = await projectService.refreshData();
        const summaryData = projectService.getProjectSummary(projectData);
        
        setProjects(projectData);
        setSummary(summaryData);
        setLastUpdated(new Date().toLocaleTimeString());
        setError(null);
        
        logger.success('Project data refreshed successfully.');
      }, 'refreshProjects');
    } catch (refreshError) {
      handleError(refreshError, 'Refresh failed');
    } finally {
      if (!isAutoRefresh) setIsRefreshing(false);
    }
  };

  const handleOpenEmailModal = (project: Project) => {
    try {
      logger.info('Opening email modal for project.', { projectName: safeString(project.projectName) });
      setSelectedProjectForEmail(project);
      setIsEmailModalOpen(true);
    } catch (modalError) {
      handleError(modalError, 'Failed to open email modal');
    }
  };

  const handleCloseEmailModal = () => {
    try {
      logger.info('Closing email modal.');
      setIsEmailModalOpen(false);
      setSelectedProjectForEmail(null);
    } catch (modalError) {
      handleError(modalError, 'Failed to close email modal');
    }
  };
  
  if (loading) {
    return (
      <div className="loading">
        <h2>Loading Project Dashboard...</h2>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="auth-required">
        <h2>Project Dashboard</h2>
        <p>Connect to your Google Sheets to view project data</p>
        <button onClick={handleSignIn} className="auth-button">
          Connect to Google Sheets
        </button>
        {error && <div className="error">Error: {safeString(error)}</div>}
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <div className="project-dashboard">
        <header className="dashboard-header">
          <h1>Project Dashboard</h1>
          <div className="dashboard-controls">
            <span className="last-updated">
              Last updated: {safeString(lastUpdated)}
            </span>
            <button onClick={() => refreshProjects(false)} disabled={isRefreshing}>
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button onClick={handleSignOut} className="logout-button">
              <LogOut size={16} />
            </button>
          </div>
        </header>
        
        {error && <div className="error">⚠️ {safeString(error)}</div>}
        
        {summary && <SummaryCards summary={summary} />}
        
        <div className="projects-grid">
          {projects.length === 0 ? (
            <div className="no-projects">
              <p>No projects found in the Google Sheet, or the data could not be loaded.</p>
            </div>
          ) : (
            projects.map(project => (
              <ProjectCard 
                key={safeString(project.id)} 
                project={project} 
                onGenerateEmail={handleOpenEmailModal} 
              />
            ))
          )}
        </div>

        {isEmailModalOpen && selectedProjectForEmail && (
          <ErrorBoundary>
            <EmailModal
              project={selectedProjectForEmail}
              isOpen={isEmailModalOpen}
              onClose={handleCloseEmailModal}
            />
          </ErrorBoundary>
        )}
      </div>
    </ErrorBoundary>
  );
}

function SummaryCards({ summary }: { summary: ProjectSummary }) {
  try {
    return (
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Projects</h3>
          <div className="summary-value">{safeString(summary.totalProjects)}</div>
        </div>
        
        <div className="summary-card">
          <h3>Total Budget</h3>
          <div className="summary-value">{safeString(summary.totalBudget)}</div>
        </div>
        
        <div className="summary-card">
          <h3>Average Progress</h3>
          <div className="summary-value">{safeString(summary.averageProgress)}%</div>
        </div>
        
        <div className="summary-card">
          <h3>Progress Breakdown</h3>
          <div className="progress-breakdown">
            <div className="progress-item">
              <span className="progress-dot low"></span>
              <span>Low (&lt;40%): {safeString(summary.progressRanges?.low)}</span>
            </div>
            <div className="progress-item">
              <span className="progress-dot medium"></span>
              <span>Medium (40-79%): {safeString(summary.progressRanges?.medium)}</span>
            </div>
            <div className="progress-item">
              <span className="progress-dot high"></span>
              <span>High (80%+): {safeString(summary.progressRanges?.high)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (summaryError) {
    logger.error('Error rendering summary cards', summaryError);
    return (
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Summary Error</h3>
          <div className="summary-value">Unable to display summary</div>
        </div>
      </div>
    );
  }
}

function ProjectCard({ project, onGenerateEmail }: { project: Project; onGenerateEmail: (project: Project) => void; }) {
  try {
    const getProgressColor = (progress: number) => {
      const safeProgress = safeNumber(progress, 0);
      if (safeProgress >= 80) return '#10b981'; // green
      if (safeProgress >= 40) return '#f59e0b'; // yellow
      return '#ef4444'; // red
    };
    
    // Ensure progress is a number for calculations
    const safeProgress = safeNumber(project.progressOverall, 0);
    
    return (
      <div className="project-card">
        <div className="project-header">
          <h3 className="project-name">{safeString(project.projectName) || 'Unnamed Project'}</h3>
          <div className="progress-circle">
            <div 
              className="progress-fill"
              style={{ 
                background: `conic-gradient(${getProgressColor(safeProgress)} ${safeProgress * 3.6}deg, #e5e7eb 0deg)`
              }}
            >
              <span className="progress-text">{safeProgress}%</span>
            </div>
          </div>
        </div>
        
        <div className="project-details">
          <div className="detail-row">
            <span className="label">Manager:</span>
            <span className="value">{safeString(project.projectManager) || 'N/A'}</span>
          </div>
          
          <div className="detail-row">
            <span className="label">Updated:</span>
            <span className="value">{safeString(project.lastUpdatedOn) || 'N/A'}</span>
          </div>
          
          <div className="detail-row">
            <span className="label">Budget:</span>
            <span className="value budget">{safeString(project.budget) || 'N/A'}</span>
          </div>
          
          {project.linkToProjectPlan && (
            <div className="detail-row">
              <span className="label">Plan:</span>
              <span className="value link">{safeString(project.linkToProjectPlan)}</span>
            </div>
          )}
          
          {project.lastSummaryNotes && (
            <div className="detail-row notes">
              <span className="label">Notes:</span>
              <span className="value">{safeString(project.lastSummaryNotes)}</span>
            </div>
          )}
        </div>
        
        <div className="project-card-footer">
          <button 
            onClick={() => onGenerateEmail(project)} 
            className="email-button"
            disabled={!project.projectName}
          >
            <Mail size={14} />
            <span>Generate Status Email</span>
          </button>
        </div>
      </div>
    );
  } catch (cardError) {
    logger.error('Error rendering project card', { error: cardError, projectId: project.id });
    return (
      <div className="project-card">
        <div className="project-header">
          <h3 className="project-name">Error Loading Project</h3>
        </div>
        <div className="project-details">
          <p>Unable to display project details due to a data error.</p>
        </div>
      </div>
    );
  }
}

export default App;