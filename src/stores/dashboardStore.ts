import { create } from "zustand";

interface DashboardState {
  startDate: string;
  endDate: string;
  setDates: (start: string, end: string) => void;
  resetDates: () => void;
}

export const useDashboardStore = create<DashboardState>()((set) => {
  const getInitialDates = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      start: firstDay.toISOString().substring(0, 10),
      end: today.toISOString().substring(0, 10),
    };
  };

  const initial = getInitialDates();

  return {
    startDate: initial.start,
    endDate: initial.end,
    setDates: (startDate, endDate) => set({ startDate, endDate }),
    resetDates: () => {
      const dates = getInitialDates();
      set({ startDate: dates.start, endDate: dates.end });
    },
  };
});
