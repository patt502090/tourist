import { protectedapi } from '../API/Index';
import { validateSessionRes } from '../utils/types';
const validateSession = async () => {
  try {
    const response = await protectedapi.post<validateSessionRes>('/auth/session/validation');
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

export default validateSession;
