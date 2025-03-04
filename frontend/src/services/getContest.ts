import { protectedapi } from '../API/Index';
import { Problem } from '../utils/types';

// Interface for the raw contest response
interface Contest {
  _id: string;
  title: string;
  description: string;
  participants: string[];
  startTime: string;
  endTime: string;
  problems: string[]; // Array of problem IDs
  participantProgress?: Array<{
    userId: string;
    totalPoints: number;
    solvedProblems: number;
    solvedProblemIds: string[];
    _id: string;
  }>;
  __v?: number;
}

// Fetch a problem by ID
const getProblem = async (problemId: string): Promise<Problem> => {
  try {
    const response = await protectedapi.get<Problem>(`/problems/${problemId}`);
    // Assuming /problems/${id} returns the problem directly, adjust if wrapped
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch problem ${problemId}: ${error.message}`);
    }
    throw new Error(`Failed to fetch problem ${problemId}`);
  }
};

const getContest = async (id: string): Promise<Contest> => {
  try {
    // Fetch the contest by ID
    const response = await protectedapi.get<Contest>(`/contests/${id}`);
    const contestData = response.data;

    // Extract problem IDs from the contest
    const problemIds = contestData.problems || [];

    // Fetch full details for each problem
    const problemsPromises = problemIds.map((problemId: string) => getProblem(problemId));
    const problems = await Promise.all(problemsPromises);

    // Replace problem IDs with full problem data
    contestData.problems = problems as any; // Type assertion due to array type mismatch

    return contestData;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred while fetching the contest');
  }
};

export default getContest;