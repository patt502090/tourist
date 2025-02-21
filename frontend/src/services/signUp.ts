import { AxiosError } from 'axios';
import api from '../API/Index';
import { createUser, signUpType } from '../utils/types';

const signUp = async (userinfo: createUser) => {
  try {
    const response = await api.post<signUpType>('users/createUser', userinfo, { withCredentials: true });
    if (response.data.status === 'Failure') {
      throw new Error(response.data.error);
    }
    return response.data;
  } catch (error) {
    let message = 'Some internal error occured';
    let code = 500;
    if (error instanceof AxiosError) {
      message = error.response?.data.message || 'Server Unavailable';
      code = error.response?.status || 503;
      throw new Error(`Request Failed with ${code} status : ${message}`);
    }
    if (error instanceof Error) {
      message = error.message;
    }
    throw new Error(`Request Failed with ${code}:${message}`);
  }
};

export default signUp;
