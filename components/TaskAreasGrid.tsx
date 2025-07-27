

import React from 'react';
import Card from './shared/Card';
import { TaskArea } from '../types';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface TaskAreasGridProps {
  taskAreas: TaskArea[];
}

const getStatusIcon = (status: TaskArea['status']) => {
  switch (status) {
    case 'On Track': return <CheckCircle className="text-status-green" size={18} />;
    case 'Needs Attention': return <Clock className="text-status-yellow" size={18} />;
    case 'Blocked': return <AlertTriangle className="text-status-red" size={18} />;
    default: return null;
  }
};

const getStatusColor = (status: TaskArea['status']) => {
  switch (status) {
    case 'On Track': return 'border-l-status-green';
    case 'Needs Attention': return 'border-l-status-yellow';
    case 'Blocked': return 'border-l-status-red';
    default: return 'border-l-gray-400';
  }
};

const TaskAreasGrid: React.FC<TaskAreasGridProps> = ({ taskAreas }) => {
  return (
    <Card>
      <h2 className="text-lg font-bold text-gray-800 mb-4">Operational Areas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {taskAreas.map((area) => (
          <div key={area.id} className={`p-4 bg-white rounded-lg border-l-4 shadow-sm ${getStatusColor(area.status)}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-800">{area.name}</p>
                <p className="text-xs text-gray-500">{area.owner}</p>
              </div>
              {getStatusIcon(area.status)}
            </div>
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-600">Progress</span>
                <span className="text-xs font-medium text-brand-primary">{area.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-brand-primary h-1.5 rounded-full" style={{ width: `${area.progress}%` }}></div>
              </div>
              {area.issues > 0 && (
                 <p className="text-xs text-red-600 mt-2">{area.issues} open issue{area.issues > 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TaskAreasGrid;
