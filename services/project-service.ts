import { google, sheets_v4 } from 'googleapis';
import authService from './simple-auth';
import { SPREADSHEET_CONFIG, REFRESH_INTERVAL } from '../config';
import type { Project } from '../types';
import Logger from './logger';

const logger = new Logger('ProjectService');

class ProjectService {
  private sheets: sheets_v4.Sheets | null = null;
  private cache: Project[] | null = null;
  private lastFetch: number | null = null;

  async initialize() {
    logger.info('Initializing ProjectService...');
    if (!authService.isAuthenticated) {
      logger.warn('Initialization failed: user not authenticated.');
      throw new Error('Authentication required');
    }
    
    const client = authService.getClient();
    this.sheets = google.sheets({ version: 'v4', auth: client });
    logger.success('ProjectService initialized with Google Sheets client.');
  }

  async getProjectData(): Promise<Project[]> {
    logger.info('getProjectData called.');
    if (!this.sheets) {
        logger.warn('Sheets service not initialized. Initializing now...');
        await this.initialize();
        if(!this.sheets) {
            logger.error("Sheets service could not be initialized.", {});
            throw new Error("Sheets service could not be initialized.");
        }
    }

    if (this.isCacheValid()) {
      logger.info('Returning cached project data.');
      return this.cache!;
    }
    
    logger.info('Cache is invalid or empty. Fetching data from Google Sheets...');
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_CONFIG.ID,
        range: `${SPREADSHEET_CONFIG.SHEET_NAME}!${SPREADSHEET_CONFIG.RANGE}`
      });
      logger.success('Successfully fetched data from Google Sheets.');
      
      const rawData = response.data.values || [];
      const projects = this.parseProjectData(rawData);
      
      this.cache = projects;
      this.lastFetch = Date.now();
      logger.info(`Parsed and cached ${projects.length} projects.`);
      
      return projects;
    } catch (error) {
      logger.error('Failed to fetch project data from Google Sheets', error);
      throw error;
    }
  }
  
  private parseProjectData(rawData: any[][]): Project[] {
    if (rawData.length < 2) {
      return [];
    }
    const dataRows = rawData.slice(1);
    return dataRows.map((row, index) => {
      if (!row[0]) return null;
      return {
        id: index + 1,
        projectName: row[0] || '',
        projectManager: row[1] || '',
        lastUpdatedOn: this.parseDate(row[2]),
        budget: this.parseBudget(row[3]),
        linkToProjectPlan: row[4] || '',
        progressOverall: this.parseProgress(row[5]),
        lastSummaryNotes: row[6] || '',
        rawData: row
      };
    }).filter((project): project is Project => project !== null);
  }
  
  private parseDate(dateValue: string): string | null {
    if (!dateValue) return null;
    try {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? dateValue : date.toLocaleDateString();
    } catch {
      return dateValue;
    }
  }
  
  private parseBudget(budgetValue: string): string {
    if (!budgetValue) return '$0';
    if (String(budgetValue).includes('$')) {
      return budgetValue;
    }
    const numValue = parseFloat(String(budgetValue).replace(/[^0-9.-]+/g,""));
    if (!isNaN(numValue)) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0,
      }).format(numValue);
    }
    return budgetValue;
  }
  
  private parseProgress(progressValue: string): number {
    if (!progressValue) return 0;
    const numValue = String(progressValue).replace('%', '');
    const progress = parseFloat(numValue);
    return isNaN(progress) ? 0 : Math.min(Math.max(progress, 0), 100);
  }
  
  private isCacheValid(): boolean {
    if (!this.cache || !this.lastFetch) return false;
    const age = Date.now() - this.lastFetch;
    return age < REFRESH_INTERVAL;
  }
  
  clearCache(): void {
    logger.info('Clearing project data cache.');
    this.cache = null;
    this.lastFetch = null;
  }
  
  async refreshData(): Promise<Project[]> {
    logger.info('Refreshing project data.');
    this.clearCache();
    return this.getProjectData();
  }
  
  getTotalBudget(projects: Project[]): number {
    return projects.reduce((total, project) => {
      const budgetNum = parseFloat(project.budget.replace(/[^0-9.-]+/g,""));
      return total + (isNaN(budgetNum) ? 0 : budgetNum);
    }, 0);
  }
  
  getProjectSummary(projects: Project[]) {
    const totalBudget = this.getTotalBudget(projects);
    const averageProgress = projects.length > 0 ? projects.reduce((sum, p) => sum + p.progressOverall, 0) / projects.length : 0;
    
    const progressRanges = {
      low: projects.filter(p => p.progressOverall < 40).length,
      medium: projects.filter(p => p.progressOverall >= 40 && p.progressOverall < 80).length,
      high: projects.filter(p => p.progressOverall >= 80).length
    };
    
    return {
      totalProjects: projects.length,
      totalBudget: new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0,
      }).format(totalBudget),
      averageProgress: Math.round(averageProgress),
      progressRanges
    };
  }
}

const projectService = new ProjectService();
export default projectService;