import { protectedapi } from '../API/Index';
import { commonresponse } from '../utils/types';

const deleteProblemAPI = async (problemId: string, userId: string) => {
  if (!userId) {
    throw new Error('User is not authenticated');
  }
  try {
    const response = await protectedapi.delete<commonresponse>(`/problems/${problemId}/${userId}`, { withCredentials: true });
    if (response.data.status === 'Failure') {
      throw new Error(response.data.error);
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unknown error occurred');
  }
};

export default deleteProblemAPI;