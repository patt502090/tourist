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

// กำหนด interface สำหรับ Contest
interface Contest {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
}

export default function HomeNavbar() {
  const { colorMode, toggleColorMode } = usethemeUtils();
  const isLogedIn = useAuthSlice((state) => state.isLogedIn);

  // ดึงข้อมูล contests โดยระบุ type เป็น Contest[]
  const { data: contests, isLoading } = useQuery<Contest[]>({
    queryKey: ['contests'],
    queryFn: async () => {
      const result = await getContests();
      // ถ้า result ไม่ใช่ array หรือ undefined ให้คืนค่า array ว่าง
      return Array.isArray(result) ? result : [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // หา contest ที่กำลังเกิดขึ้นหรือจะเริ่มใน 24 ชม.
  const activeContest: Contest | undefined = contests?.find((contest: Contest) => {
    const now: Date = new Date();
    const startTime: Date = new Date(contest.startTime);
    const endTime: Date = new Date(contest.endTime);
    const oneDayBefore: Date = new Date(startTime);
    oneDayBefore.setDate(startTime.getDate() - 1);

    return (
      (now >= startTime && now <= endTime) || // กำลังเกิดขึ้น
      (now >= oneDayBefore && now < startTime) // จะเริ่มใน 24 ชม.
    );
  });

  return (
    <>
      <nav className="tw-container-lg tw-mx-auto tw-flex tw-justify-around tw-p-2 tw-bottom-2 tw-border-b-[#ffffff24]">
        <div className="tw-flex tw-items-center tw-gap-2">
          <img
            src={colorMode === 'light' ? darklogo : lightlogo}
            width={100}
            height={80}
            className="tw-object-contain"
            alt="Logo"
          />
        </div>
        <ul className="tw-list-none tw-flex tw-justify-between tw-items-center tw-gap-6">
          {/* เพิ่มลิงก์ Problems และ Contests */}
          <li>
            <Link
              className={`tw-py-2 tw-px-4 ${colorMode === 'dark' ? 'tw-text-white' : ''}`}
              underline="hover"
              component={ReactLink}
              to="/problems"
            >
              Problems
            </Link>
          </li>
          <li>
            <Link
              className={`tw-py-2 tw-px-4 ${colorMode === 'dark' ? 'tw-text-white' : ''}`}
              underline="hover"
              component={ReactLink}
              to="/contests"
            >
              Contests
            </Link>
          </li>
          {/* ส่วน Sign in/Sign up หรือ Profile */}
          <li className="tw-flex tw-justify-center tw-items-center">
            {!isLogedIn ? (
              <div className="tw-flex tw-justify-between tw-items-center tw-gap-2">
                <Link
                  className={`tw-py-2 tw-px-4 ${colorMode === 'dark' ? 'tw-text-white' : ''}`}
                  underline="hover"
                  component={ReactLink}
                  to="/signin"
                >
                  Sign in
                </Link>
                <span>or</span>
                <Link
                  className={`tw-py-2 tw-px-4 ${colorMode === 'dark' ? 'tw-text-white' : ''}`}
                  underline="hover"
                  component={ReactLink}
                  to="/signup"
                >
                  Sign up
                </Link>
              </div>
            ) : (
              <Profile />
            )}
          </li>
          {/* ปุ่มเปลี่ยนธีม */}
          <li>
            <Button
              className={colorMode === 'dark' ? 'tw-border-white' : ''}
              variant="text"
              onClick={toggleColorMode}
              size="large"
            >
              {colorMode === 'dark' ? (
                <LightModeOutlinedIcon sx={{ color: 'white' }} />
              ) : (
                <DarkModeIcon />
              )}
            </Button>
          </li>
        </ul>
      </nav>

      {/* Banner สำหรับ Contest */}
      {activeContest && !isLoading && (
        <Box
          className="tw-container-lg tw-mx-auto tw-p-4"
          sx={{
            background: 'linear-gradient(45deg, #ff6b6b, #ff8e53)',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            animation: 'pulse 2s infinite',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: '#fff',
              fontWeight: 'bold',
              fontFamily: "'Roboto', sans-serif",
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
            variant="contained"
            sx={{
              mt: 1,
              backgroundColor: '#fff',
              color: '#ff6b6b',
              '&:hover': { backgroundColor: '#f0f0f0' },
            }}
          >
            Join Now
          </Button>
        </Box>
      )}

      {/* CSS Animation */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </>
  );
}