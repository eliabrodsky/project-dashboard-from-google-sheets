

import React, { useState } from 'react';
import { GanttChartSquare, LayoutDashboard, Search } from 'lucide-react';
import { Project } from '../types';

interface ProjectSidebarProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
}

const getStatusColor = (status?: Project['status']) => {
  switch (status) {
    case 'On Track': return 'bg-status-green';
    case 'At Risk': return 'bg-status-yellow';
    case 'Delayed': return 'bg-status-red';
    case 'Completed': return 'bg-blue-500';
    default: return 'bg-gray-400';
  }
};

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({ projects, selectedProject, onSelectProject }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter((project) =>
    project.projectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-72 bg-brand-dark text-white flex flex-col">
      <div className="flex items-center justify-center p-6 border-b border-brand-dark-accent">
        <GanttChartSquare size={28} className="text-brand-primary" />
        <h1 className="ml-3 text-2xl font-bold">Project Pulse</h1>
      </div>
      <div className="p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-brand-dark-accent border border-brand-dark-accent rounded-lg py-2 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-primary"
            aria-label="Search projects"
          />
        </div>
      </div>
      <nav className="flex-1 px-4 pb-4 overflow-y-auto">
        <h2 className="px-2 mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">Projects ({filteredProjects.length})</h2>
        <ul>
          {filteredProjects.map((project) => (
            <li key={project.id}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectProject(project);
                }}
                className={`flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
                  selectedProject?.id === project.id
                    ? 'bg-brand-primary text-white'
                    : 'hover:bg-brand-dark-accent'
                }`}
              >
                <div className="flex-1">
                  <p className="font-semibold text-sm">{project.projectName}</p>
                  <div className="flex items-center mt-1">
                     <span className={`w-2.5 h-2.5 rounded-full mr-2 ${getStatusColor(project.status)}`}></span>
                     <p className="text-xs text-gray-300">{project.status || 'N/A'} - {project.progressOverall}%</p>
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default ProjectSidebar;
