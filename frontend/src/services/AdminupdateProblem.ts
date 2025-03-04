import { protectedapi } from '../API/Index';
import { Problem, getProblemType } from '../utils/types';

const AdminupdateProblemAPI = async (problemId: string, userId: string, data: Problem) => { 
  if (!userId) {
    throw new Error('User is not authenticated');
  }
  try {
    const response = await protectedapi.patch<getProblemType>(
      `/problems/${problemId}/${userId}`,
      { data }, 
      { withCredentials: true }
    );
    if (response.data.status === 'Failure') {
      throw new Error(response.data.error);
    }
    return response.data.data; 
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unknown error occurred');
  }
};

export default AdminupdateProblemAPI;