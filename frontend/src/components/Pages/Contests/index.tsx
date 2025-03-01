import Footer from '../../UI/Footer';
import ProblemsSet from '../Problems';
import { useQuery } from '@tanstack/react-query';
import getUser from '../../../services/getUser';
import { useLocation } from 'react-router';
import { useEffect } from 'react';
import { useAuthSlice } from '../../../store/authslice/auth';
import { useUserSlice } from '../../../store/user';
import HomeNavbar from '../Home/HomeNavbar';
import ContestsTable from './ContestsTable';

function ContestsList() {
  const isLogedIn = useAuthSlice((state) => state.isLogedIn);
  const user = useUserSlice((state) => state.user);
  const setUser = useUserSlice((state) => state.setUser);
  const { state } = useLocation();
  const { data, isError, error, isSuccess } = useQuery({
    queryKey: ['get-user'],
    queryFn: () => getUser(state),
    enabled: isLogedIn && state !== '' && state !== null && user == null,
  });
  useEffect(() => {
    if (data && isSuccess) {
      setUser(data.data);
    }
  }, [data, isSuccess]);
  if (isError) {
    console.log(error);
  }

  return (
    <>
      <HomeNavbar />
      <main className='tw-mt-4'>
        <ContestsTable />
      </main>
      <Footer />
    </>
  );
}

export default ContestsList;
