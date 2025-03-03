import api from '../API/Index';
import { getContestsType } from '../utils/types';
const getContests = async () => {
  try {
    const response = await api.get<getContestsType>('/contests');
    if (response.data.status === 'Failure') {
      throw new Error(response.data.error);
    }
    // console.log(response.data);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};

export default getContests;
