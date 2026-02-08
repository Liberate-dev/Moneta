import React from 'react';
import { Dose } from '../types';

interface DoseCardProps {
  dose: Dose;
  onTake: (doseId: string) => void;
  isNext?: boolean;
}

export const DoseCard: React.FC<DoseCardProps> = ({ dose, onTake, isNext = false }) => {
  const date = new Date(dose.scheduledTime);
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  
  const isPending = dose.status === 'pending';
  const isMissed = dose.status === 'missed';
  const isTaken = dose.status === 'taken';

  let cardClass = "relative overflow-hidden rounded-2xl p-4 mb-3 border transition-all ";
  let statusIcon = null;

  if (isTaken) {
    cardClass += "bg-green-50 border-green-200 opacity-75";
    statusIcon = <div className="bg-green-100 text-green-600 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>;
  } else if (isMissed) {
    cardClass += "bg-red-50 border-red-200";
    statusIcon = <div className="bg-red-100 text-red-600 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></div>;
  } else if (isNext) {
    cardClass += "bg-white border-sky-500 ring-4 ring-sky-500/10 shadow-xl scale-[1.02]";
  } else {
    cardClass += "bg-white border-slate-200 text-slate-500";
  }

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center justify-center bg-slate-100 rounded-lg p-2 min-w-[60px]">
             <span className="text-xs font-bold text-slate-500 uppercase">{dateString}</span>
             <span className={`text-lg font-bold ${isMissed ? 'text-red-500' : 'text-slate-800'}`}>{timeString}</span>
          </div>
          
          <div>
            <h4 className={`font-bold text-lg ${isTaken ? 'text-green-800 line-through' : 'text-slate-800'}`}>
              {dose.drugName}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                Dose {dose.pillNumber}/{dose.totalPills}
              </span>
              {isMissed && <span className="text-xs font-bold text-red-600">MISSED</span>}
            </div>
          </div>
        </div>

        <div>
          {isPending && (
            <button 
              onClick={() => onTake(dose.id)}
              className={`p-3 rounded-full transition-colors ${
                isNext 
                  ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/40 animate-pulse' 
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
          )}
          {!isPending && statusIcon}
        </div>
      </div>
      
      {isNext && (
        <div className="absolute top-0 right-0 bg-sky-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">
          DUE NOW
        </div>
      )}
    </div>
  );
};