
import { DrugQRCodeData, Dose, Drug } from '../types';

export const generateSchedule = (
  drugData: DrugQRCodeData, 
  drugId: string, 
  startTime: Date
): Dose[] => {
  const doses: Dose[] = [];
  const totalDoses = drugData.total_pills; // Assuming 1 pill per dose for simplicity based on prompt logic
  
  // Calculate interval in hours (24 / frequency)
  // e.g., 3 times a day = every 8 hours
  const intervalHours = 24 / drugData.frequency_per_day;

  let currentTime = new Date(startTime);

  for (let i = 0; i < totalDoses; i++) {
    doses.push({
      id: crypto.randomUUID(),
      drugId: drugId,
      drugName: drugData.name,
      scheduledTime: currentTime.toISOString(),
      status: 'pending',
      pillNumber: i + 1,
      totalPills: totalDoses,
      notificationSent: false
    });

    // Add interval to current time for next dose
    currentTime = new Date(currentTime.getTime() + intervalHours * 60 * 60 * 1000);
  }

  return doses;
};

export const calculateCompliance = (doses: Dose[]): number => {
  const completed = doses.filter(d => d.status === 'taken').length;
  const missed = doses.filter(d => d.status === 'missed').length;
  const totalPast = completed + missed;
  
  if (totalPast === 0) return 100;
  return Math.round((completed / totalPast) * 100);
};

export const getRemainingDays = (doses: Dose[]): number => {
  const pending = doses.filter(d => d.status === 'pending');
  if (pending.length === 0) return 0;
  
  const lastDose = new Date(pending[pending.length - 1].scheduledTime);
  const now = new Date();
  const diffTime = Math.abs(lastDose.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays;
};
