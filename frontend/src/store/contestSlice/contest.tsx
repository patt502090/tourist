import { create } from 'zustand';
import { Contest } from '../../utils/types';

interface ContestSlice {
  contests: Contest[];
  setContests: (contests: Contest[]) => void;
}

export const useContestSlice = create<ContestSlice>()((set) => ({
  contests: [],
  setContests: (contests) => set(() => ({ contests })),
}));
