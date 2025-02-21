import { createContext, FC, useContext, useEffect } from 'react';
import { authCtx, contextWrapperProps } from '../utils/types';
import { useAuthSlice } from '../store/authslice/auth';
import { useUserSlice } from '../store/user';
import { useProblemSlice } from '../store/problemSlice/problem';
import { useQuery } from '@tanstack/react-query';
import getProblems from '../services/getProblems';

export const AuthContext = createContext<authCtx>({ isLoading: false, isError: false, error: null });

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  return ctx;
};

export const AuthContextWrapper: FC<contextWrapperProps> = ({ children }) => {
  const signIn = useAuthSlice((state) => state.signIn);
  const checkSession = useUserSlice((state) => state.checkSession);
  const sessionLoading = useUserSlice((state) => state.sessionLoading);
  const user = useUserSlice((state) => state.user);

  useEffect(() => {
    if (sessionLoading === 'Completed') {
      if (!user) {
        // window.location.href = '/signin';
      } else {
        signIn();
      }
    }
  }, [sessionLoading]);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['problems'],
    queryFn: getProblems,
    refetchOnWindowFocus: false,
  });
  const { setProblems } = useProblemSlice();
  useEffect(() => {
    if (data && data.data) {
      setProblems(data.data);
    }
  }, [data]);
  useEffect(() => {
    if (!['/signin', '/signup'].includes(window.location.pathname)) {
      checkSession();
    }
  }, []);

  return <AuthContext.Provider value={{ isLoading, isError, error }}>{children}</AuthContext.Provider>;
};
