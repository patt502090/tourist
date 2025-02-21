import { protectedapi } from '../API/Index';
import { commonresponse } from '../utils/types';
const signOutAPI = async () => {
  try {
    const response = await protectedapi.post<commonresponse>('/auth/logout');
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

export default signOutAPI;
