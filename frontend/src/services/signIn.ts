import api from '../API/Index';
import { signInType } from '../utils/types';
const signIn = async (userInfo: { email: string; password: string }) => {
  try {
    const response = await api.post<signInType>('/auth/login', { ...userInfo }, { withCredentials: true });
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

export default signIn;
