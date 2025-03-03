import { createContext, FC, useContext, useEffect } from 'react';
import { authCtx, contextWrapperProps } from '../utils/types';
import { useAuthSlice } from '../store/authslice/auth';
import { useUserSlice } from '../store/user';
import { useProblemSlice } from '../store/problemSlice/problem';
import { useQuery } from '@tanstack/react-query';
import getProblems from '../services/getProblems';
import getContests from '../services/getContests'; // สมมติว่ามี service นี้
import { useContestSlice } from '../store/contestSlice/contest';

export const AuthContext = createContext<authCtx>({ isLoading: false, isError: false, error: null });

export const useAuthContext = () => useContext(AuthContext);

export const AuthContextWrapper: FC<contextWrapperProps> = ({ children }) => {
  const signIn = useAuthSlice((state) => state.signIn);
  const checkSession = useUserSlice((state) => state.checkSession);
  const sessionLoading = useUserSlice((state) => state.sessionLoading);
  const user = useUserSlice((state) => state.user);
  const { setProblems } = useProblemSlice();
  const { setContests } = useContestSlice();

  // Fetch problems
  const {
    data: problemsData,
    isLoading: problemsLoading,
    isError: problemsError,
    error: problemsFetchError,
  } = useQuery({
    queryKey: ['problems'],
    queryFn: getProblems,
    refetchOnWindowFocus: false,
  });
  
  const {
    data: contestsData,
    isLoading: contestsLoading,
    isError: contestsError,
    error: contestsFetchError,
  } = useQuery({
    queryKey: ['contests'],
    queryFn: getContests,
    refetchOnWindowFocus: false,
  });


  // เช็ค session
  useEffect(() => {
    if (!['/signin', '/signup'].includes(window.location.pathname)) {
      checkSession();
    }
  }, []);

  // อัปเดตปัญหา (problems) ใน state

  useEffect(() => {
    if (contestsData?.data) {
      setContests(contestsData.data);
      // console.log(contestsData.data)
    }
  }, [contestsData]);

  useEffect(() => {
    if (problemsData?.data) {
      setProblems(problemsData.data);
    }
  }, [problemsData]);

  // จัดการ session login
  useEffect(() => {
    if (sessionLoading === 'Completed') {
      if (!user) {
        // window.location.href = '/signin';
      } else {
        signIn();
      }
    }
  }, [sessionLoading, user, signIn]);

  return (
    <AuthContext.Provider
      value={{
        isLoading: problemsLoading || contestsLoading,
        isError: problemsError || contestsError,
        error: problemsFetchError || contestsFetchError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
