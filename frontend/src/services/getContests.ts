import api from '../API/Index';
import { getContestsType } from '../utils/types';
const getProblems = async () => {
  try {
    const response = await api.get<getContestsType>('/contests');
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

export default getProblems;
