import { createContext, FC, useContext, useEffect } from 'react';
import { authCtx, contextWrapperProps } from '../utils/types';
import { useAuthSlice } from '../store/authslice/auth';
import { useUserSlice } from '../store/user';
import { useProblemSlice } from '../store/problemSlice/problem';
import { useQuery } from '@tanstack/react-query';
import getProblems from '../services/getProblems';
import getContests from '../services/getContests';
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

  // Check session
  useEffect(() => {
    if (!['/signin', '/signup'].includes(window.location.pathname)) {
      checkSession();
    }
  }, []);

  // Update contests in state
  useEffect(() => {
    if (contestsData) {
      const contests = Array.isArray(contestsData) ? contestsData : contestsData.data || [];
      setContests(contests);
      // console.log('Contests set in store:', contests);
    }
  }, [contestsData, setContests]);

  // Update problems in state
  useEffect(() => {
    if (problemsData?.data) {
      setProblems(problemsData.data);
      // console.log('Problems set in store:', problemsData.data);
    }
  }, [problemsData, setProblems]);

  // Handle session login
  useEffect(() => {
    if (sessionLoading === 'Completed') {
      if (!user) {
        // window.location.href = '/signin';
      } else {
        signIn();
      }
    }
  }, [sessionLoading, user, signIn]);

  // Debug logs
  // useEffect(() => {
  //   console.log('Problems:', { problemsData, problemsLoading, problemsError, problemsFetchError });
  //   console.log('Contests:', { contestsData, contestsLoading, contestsError, contestsFetchError });
  // }, [problemsData, contestsData, problemsLoading, contestsLoading]);

  return (
    <AuthContext.Provider
      value={{
        isLoading: problemsLoading || contestsLoading || sessionLoading === 'Pending',
        isError: problemsError || contestsError,
        error: problemsFetchError || contestsFetchError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};