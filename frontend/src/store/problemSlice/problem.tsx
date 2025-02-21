import { create } from 'zustand';
import { Problem } from '../../utils/types';

interface ProblemSlice {
  problems: Problem[];
  setProblems: (problems: Problem[]) => void;
}

export const useProblemSlice = create<ProblemSlice>()((set) => ({
  problems: [],
  setProblems: (problems) => set(() => ({ problems })),
}));
