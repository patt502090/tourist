import { protectedapi } from '../API/Index';
import { getContestType } from '../utils/types';
const getContest = async (id: string) => {
  try {
    const response = await protectedapi.get<getContestType>(`/contests/${id}`);
    if (response.data.status === 'Failure') {
      throw new Error(response.data.error);
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};

export default getContest;
