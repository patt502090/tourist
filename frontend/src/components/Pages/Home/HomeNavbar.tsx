import { useQuery } from '@tanstack/react-query';
import { Link as ReactLink } from 'react-router-dom';
import darklogo from '../../../assets/images/logo-dark.26900637.svg';
import lightlogo from '../../../assets/images/logo-light.5034df26.svg';
import { usethemeUtils } from '../../../context/ThemeWrapper';
import { Button, Link, Box, Typography } from '@mui/material';
import { useAuthSlice } from '../../../store/authslice/auth';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined';
import Profile from '../../UI/Profile';
import getContests from '../../../services/getContests';
import code from './code.json';
import Lottie from 'react-lottie';

interface Contest {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
}

export default function HomeNavbar() {
  const { colorMode, toggleColorMode } = usethemeUtils();
  const isLogedIn = useAuthSlice((state) => state.isLogedIn);

  const { data: contests, isLoading } = useQuery<Contest[]>({
    queryKey: ['contests'],
    queryFn: async () => {
      const result = await getContests();
      return Array.isArray(result) ? result : [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const activeContest: Contest | undefined = contests?.find((contest: Contest) => {
    const now: Date = new Date();
    const startTime: Date = new Date(contest.startTime);
    const endTime: Date = new Date(contest.endTime);
    const oneDayBefore: Date = new Date(startTime);
    oneDayBefore.setDate(startTime.getDate() - 1);

    return (now >= startTime && now <= endTime) || (now >= oneDayBefore && now < startTime);
  });

  return (
    <>
      <nav className='tw-container tw-mx-auto tw-px-4 tw-py-2 tw-border-b tw-border-[#ffffff24] md:tw-px-6 lg:tw-px-8'>
        <div className='tw-flex tw-flex-col tw-items-center md:tw-flex-row md:tw-justify-between'>
          <Link to='/' component={ReactLink} underline='hover'>
            <div className='tw-hidden sm:tw-flex tw-items-center tw-gap-2 tw-py-2'>
              <img
                src={colorMode === 'light' ? darklogo : lightlogo}
                width={80}
                height={64}
                className='tw-object-contain tw-w-[60px] sm:tw-w-[80px] md:tw-w-[100px]'
                alt='Logo'
              />
            </div>
          </Link>

          <ul className='tw-list-none tw-flex tw-flex-row tw-items-center tw-gap-4 md:tw-flex-row md:tw-gap-6 tw-w-full md:tw-w-auto'>
            <li>
              <Link
                className={`tw-py-2 tw-px-4 ${colorMode === 'dark' ? 'tw-text-white' : ''}`}
                underline='hover'
                component={ReactLink}
                to='/problems'
              >
                Problems
              </Link>
            </li>
            <li>
              <Link
                className={`tw-py-2 tw-px-4 ${colorMode === 'dark' ? 'tw-text-white' : ''}`}
                underline='hover'
                component={ReactLink}
                to='/contests'
              >
                Contests
              </Link>
            </li>
            <li className='tw-flex tw-justify-center tw-items-center'>
              {!isLogedIn ? (
                <div className='tw-flex tw-flex-col tw-items-center tw-gap-2 sm:tw-flex-row sm:tw-gap-4'>
                  <Link
                    className={`tw-py-2 tw-px-4 ${colorMode === 'dark' ? 'tw-text-white' : ''}`}
                    underline='hover'
                    component={ReactLink}
                    to='/signin'
                  >
                    Sign in
                  </Link>
                  <span className='tw-hidden sm:tw-inline'>or</span>
                  <Link
                    className={`tw-py-2 tw-px-4 ${colorMode === 'dark' ? 'tw-text-white' : ''}`}
                    underline='hover'
                    component={ReactLink}
                    to='/signup'
                  >
                    Sign up
                  </Link>
                </div>
              ) : (
                <Profile />
              )}
            </li>
            <li>
              <Button
                className={colorMode === 'dark' ? 'tw-border-white' : ''}
                variant='text'
                onClick={toggleColorMode}
                size='large'
              >
                {colorMode === 'dark' ? <LightModeOutlinedIcon sx={{ color: 'white' }} /> : <DarkModeIcon />}
              </Button>
            </li>
          </ul>
        </div>
      </nav>

      {activeContest && !isLoading && (
        <Box
          className='tw-container tw-mx-auto tw-px-4 tw-py-4 md:tw-px-6 lg:tw-px-8'
          sx={{
            background: 'linear-gradient(45deg, #ff6b6b, #ff8e53)',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            animation: 'pulse 2s infinite',
            marginTop: '1rem',
          }}
        >
          <Lottie
            options={{
              loop: true,
              autoplay: true,
              animationData: code,
            }}
            height={80}
            width={80}
            style={{
              height: '60px',
              width: '60px',
              margin: '0 auto',
            }}
          />
          <Typography
            className='tw-mt-2'
            variant='h6'
            sx={{
              color: '#fff',
              fontWeight: 'bold',
              fontFamily: "'Roboto', sans-serif",
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            {new Date() >= new Date(activeContest.startTime) && new Date() <= new Date(activeContest.endTime)
              ? `Ongoing: ${activeContest.title}`
              : `Upcoming: ${activeContest.title} starts in ${Math.ceil(
                  (new Date(activeContest.startTime).getTime() - new Date().getTime()) / (1000 * 60 * 60)
                )} hours!`}
          </Typography>
          <Button
            component={ReactLink}
            to={`/contests/${activeContest._id}`}
            variant='contained'
            sx={{
              mt: 1,
              backgroundColor: '#fff',
              color: '#ff6b6b',
              '&:hover': { backgroundColor: '#f0f0f0' },
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            Join Now
          </Button>
        </Box>
      )}
    </>
  );
}
