import { protectedapi } from '../API/Index';
import { refreshTokenRes } from '../utils/types';
const verifySession = async () => {
  try {
    const response = await protectedapi.post<refreshTokenRes>('/auth/refresh');
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

export default verifySession;
