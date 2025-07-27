

import React from 'react';
import Card from './shared/Card';
import { Milestone } from '../types';
import { format, isPast } from 'date-fns';
import { CheckCircle, Flag, Radio } from 'lucide-react';

interface MilestoneCalendarProps {
  milestones: Milestone[];
}

const MilestoneIcon: React.FC<{ type: Milestone['type'] }> = ({ type }) => {
  switch(type) {
    case 'Key Deliverable': return <Flag className="text-blue-500" size={16} />;
    case 'Phase Gate': return <CheckCircle className="text-green-500" size={16} />;
    case 'Reporting': return <Radio className="text-purple-500" size={16} />;
    default: return <Flag className="text-gray-500" size={16} />;
  }
};


const MilestoneCalendar: React.FC<MilestoneCalendarProps> = ({ milestones }) => {
  const sortedMilestones = [...milestones].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card>
      <h2 className="text-lg font-bold text-gray-800 mb-4">Upcoming Milestones</h2>
      <ul className="space-y-4">
        {sortedMilestones.map((milestone) => {
          const past = isPast(new Date(milestone.date));
          return (
            <li key={milestone.id} className="flex items-start">
              <div className={`text-center w-16 mr-4 flex-shrink-0 ${past ? 'text-gray-400' : 'text-gray-700'}`}>
                <p className="font-bold text-lg">{format(new Date(milestone.date), 'd')}</p>
                <p className="text-xs uppercase">{format(new Date(milestone.date), 'MMM')}</p>
              </div>
              <div className={`w-full p-3 rounded-lg flex items-center ${past ? 'bg-gray-50' : 'bg-blue-50'}`}>
                <MilestoneIcon type={milestone.type} />
                <div className="ml-3">
                  <p className={`font-semibold text-sm ${past ? 'text-gray-500' : 'text-gray-800'}`}>{milestone.title}</p>
                  <p className={`text-xs ${past ? 'text-gray-400' : 'text-gray-500'}`}>{milestone.type} - {milestone.status}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
};

export default MilestoneCalendar;
