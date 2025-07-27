

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';
import { Sheet, Video, Calendar, Flag, Lightbulb } from 'lucide-react';
import Card from './shared/Card';
import { Project, AiSummary } from '../types';

interface ProjectOverviewProps {
  project: Project;
  latestInsight?: AiSummary;
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project, latestInsight }) => {
  const budgetData = [
    { name: 'Budget', used: project.budgetUsed || 0, remaining: (project.budgetTotal || 0) - (project.budgetUsed || 0) },
  ];
  
  const progressColor = project.progressOverall > 75 ? '#48bb78' : project.progressOverall > 40 ? '#ecc94b' : '#f56565';

  const InfoPill = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string }) => (
    <div className="flex items-start text-sm">
      <Icon className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
      <div>
        <p className="font-semibold text-gray-800">{value || 'N/A'}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
  
  return (
    <Card>
      {latestInsight && (
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
          <h3 className="text-base font-bold text-blue-800 flex items-center mb-2">
            <Lightbulb size={18} className="mr-2" />
            Latest AI Insights
          </h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs font-semibold text-blue-700">Overall Health</p>
              <p className="text-sm text-blue-900">{latestInsight.overall_health}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-700">Executive Summary</p>
              <p className="text-sm text-blue-900">{latestInsight.executive_summary}</p>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Project Snapshot</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <InfoPill icon={Flag} label="Status" value={project.status} />
              <InfoPill icon={Calendar} label="Due Date" value={project.dueDate ? format(new Date(project.dueDate), 'MMM d, yyyy') : 'N/A'} />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Overall Progress: {project.progressOverall}%</label>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div className="h-2.5 rounded-full" style={{ width: `${project.progressOverall}%`, backgroundColor: progressColor }}></div>
              </div>
            </div>

             <div className="flex space-x-2 mt-4">
                <a href={project.linkToProjectPlan} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200">
                  <Sheet size={14} className="mr-1.5" /> Project Plan
                </a>
                {project.meetingLink && (
                  <a href={project.meetingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
                    <Video size={14} className="mr-1.5" /> Meeting Room
                  </a>
                )}
            </div>
        </div>

        <div>
            <h3 className="text-base font-bold text-gray-800 mb-2">Budget Overview</h3>
            <p className="text-2xl font-bold text-gray-900">${((project.budgetUsed || 0) / 1000000).toFixed(2)}M / ${((project.budgetTotal || 0) / 1000000).toFixed(2)}M</p>
            <p className="text-sm text-gray-500">Total Budget Used</p>
            <div className="h-40 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetData} layout="vertical" margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" hide />
                <Tooltip
                    cursor={{fill: 'transparent'}}
                    formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)}
                />
                <Bar dataKey="used" stackId="a" fill="#38b2ac" radius={[4, 0, 0, 4]} />
                <Bar dataKey="remaining" stackId="a" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
            </div>
        </div>
      </div>
    </Card>
  );
};

export default ProjectOverview;
