import {
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
} from '@mui/material';
import { useState } from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useAuthSlice } from '../../../store/authslice/auth';
import { useUserSlice } from '../../../store/user';
import signOutAPI from '../../../services/signOut';
import Layout from '../../UI/Layout';
import { styled } from '@mui/system';
import { keyframes } from '@emotion/react';
import airplaneImage from '../../../assets/images/airplane.svg';
import { supportedLanguages } from '../../../constants/Index';
import { usethemeUtils } from '../../../context/ThemeWrapper';

export default function ProfilePage() {
  const user = useUserSlice((state) => state.user);
  const setUser = useUserSlice((state) => state.setUser);
  const signOut = useAuthSlice((state) => state.signOut);
  const navigate = useNavigate();
  const { mutateAsync, isError } = useMutation({
    mutationKey: ['sign-out'],
    mutationFn: signOutAPI,
  });

  const { colorMode }: { colorMode: 'light' | 'dark' } = usethemeUtils();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const open = Boolean(anchorEl);
  // const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
  //   setAnchorEl(event.currentTarget);
  // };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted':
        return 'green';
      case 'Wrong Answer':
        return 'red';
      case 'Error':
        return 'orange';
      default:
        return 'black';
    }
  };

  const getRankColor = (distance: number | undefined): string => {
    if (distance === undefined) {
      return 'gray';
    }
    if (distance < 1000) {
      return '#4caf50'; // Green - Newbie
    }
    if (distance < 5000) {
      return '#2196f3'; // Blue - Intermediate
    }
    if (distance < 10000) {
      return '#9c27b0'; // Purple - Advanced
    }
    return '#ffd700'; // Gold - Expert
  };

  // Function to determine rank label
  const getRankLabel = (distance: number | undefined): string => {
    if (distance === undefined) {
      return 'Unranked';
    }
    if (distance < 1000) {
      return 'Newbie';
    }
    if (distance < 5000) {
      return 'Intermediate';
    }
    if (distance < 10000) {
      return 'Advanced';
    }
    return 'Expert';
  };

  // Keyframes for traveler animation
  const moveTraveler = keyframes`
    0% { transform: translateX(-100%); }
    100% { transform: translateX(0); }
  `;
  const Traveler = styled('img')<{ distance: number }>(({ distance }) => ({
    position: 'absolute',
    top: '-15px', // Position above the road
    left: `calc(${Math.min((distance / 10000) * 100, 100)}% - 20px)`, // Cap at 1000 km
    width: 40,
    height: 40,
    animation: `${moveTraveler} 2s ease-out forwards`,
    objectFit: 'contain',
  }));

  const maxDistance = 10000; // Define max milestone
  const progress = user?.distance ? Math.min((user.distance / maxDistance) * 100, 100) : 0;

  const RoadProgress = styled(LinearProgress)(() => ({
    height: 20,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    '& .MuiLinearProgress-bar': {
      background: 'linear-gradient(to right, #4caf50, #2196f3, #9c27b0, #ffd700)',
      borderRadius: 5,
    },
  }));

  return (
    <Layout className='tw-flex tw-justify-center tw-items-center'>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <main className='tw-mt-4' style={{ width: '100%' }}>
          <Menu
            anchorEl={anchorEl}
            id='account-menu'
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem
              onClick={() => {
                handleClose();
                navigate('/profile');
              }}
            >
              <AccountCircleIcon />{' '}
              <Typography marginLeft={1} variant='body2'>
                {user?.username}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <MenuItem
                onClick={async () => {
                  try {
                    await mutateAsync();
                    setUser(null);
                    signOut();
                    navigate('/signin');
                    handleClose();
                  } catch (error) {
                    alert('An error occurred while signing out. Please try again.');
                  }
                }}
              >
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                Logout
              </MenuItem>
            </MenuItem>
          </Menu>
          <Box sx={{ width: '100%' }}>
            <Tabs value={tabIndex} onChange={handleTabChange} aria-label='profile tabs'>
              <Tab label='Profile' />
              <Tab label='Submissions' />
            </Tabs>
            {tabIndex === 0 && (
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                {' '}
                <Typography
                  variant='h4'
                  gutterBottom
                  sx={{ fontWeight: 'bold', color: '#1976d2', textAlign: { xs: 'center', sm: 'left' } }}
                >
                  Profile
                </Typography>
                {user && (
                  <Card sx={{ mb: 2, boxShadow: 3, borderRadius: 2 }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 3,
                          flexDirection: { xs: 'column', sm: 'row' },
                        }}
                      >
                        <Typography
                          variant='h5'
                          sx={{ flexGrow: 1, fontWeight: 'bold', textAlign: { xs: 'center', sm: 'left' } }}
                        >
                          {user.username}
                        </Typography>
                        <Chip
                          label={`${getRankLabel(user.distance)} - ${user.distance ?? 0} km`}
                          sx={{
                            bgcolor: getRankColor(user.distance),
                            color: '#fff',
                            fontWeight: 'bold',
                            px: 1,
                            mt: { xs: 1, sm: 0 },
                          }}
                        />
                      </Box>

                      <Box sx={{ position: 'relative', mb: 4 }}>
                        <RoadProgress variant='determinate' value={progress} />
                        <Traveler src={airplaneImage} distance={user.distance ?? 0} />
                        <Box sx={{ position: 'relative', mt: 1, height: '40px', px: { xs: 1, sm: 2 } }}>
                          <Typography
                            variant='caption'
                            sx={{
                              position: 'absolute',
                              left: 0,
                              color: '#4caf50',
                              textAlign: 'left',
                              minWidth: '60px',
                            }}
                          >
                            0 km
                            <br />
                            Newbie
                          </Typography>
                          <Typography
                            variant='caption'
                            sx={{
                              position: 'absolute',
                              left: '10%',
                              transform: 'translateX(-50%)',
                              color: '#2196f3',
                              textAlign: 'center',
                              minWidth: '60px',
                            }}
                          >
                            1000 km
                            <br />
                            Intermediate
                          </Typography>
                          <Typography
                            variant='caption'
                            sx={{
                              position: 'absolute',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              color: '#9c27b0',
                              textAlign: 'center',
                              minWidth: '60px',
                            }}
                          >
                            5000 km
                            <br />
                            Advanced
                          </Typography>
                          <Typography
                            variant='caption'
                            sx={{
                              position: 'absolute',
                              right: 0,
                              color: '#ffd700',
                              textAlign: 'right',
                              minWidth: '60px',
                            }}
                          >
                            10000 km
                            <br />
                            Expert
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant='body1' color='textSecondary' sx={{ mb: 1 }}>
                        <strong>Email:</strong> {user.email}
                      </Typography>
                      <Typography variant='body1' color='textSecondary' sx={{ mb: 1 }}>
                        <strong>Favorite Language:</strong>{' '}
                        {typeof user.favoriteProgrammingLanguage === 'number'
                          ? supportedLanguages[user.favoriteProgrammingLanguage] || 'Not specified'
                          : user.favoriteProgrammingLanguage}
                      </Typography>
                      <Typography variant='body1' color='textSecondary'>
                        <strong>Distance Traveled:</strong> {user.distance ?? 0} km
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}
            {tabIndex === 1 && (
              <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%' }}>
                {' '}
                <Typography
                  variant='h4'
                  gutterBottom
                  sx={{ fontWeight: 'bold', color: '#1976d2', textAlign: { xs: 'center', sm: 'left' } }}
                >
                  Submissions
                </Typography>
                <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                  <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                    {' '}
                    <TableContainer
                      component={Paper}
                      sx={{
                        maxHeight: { xs: '50vh', sm: '60vh' },
                        overflowY: 'auto',
                        overflowX: 'auto',
                        width: '100%',
                      }}
                    >
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell
                              className={`py-2 px-4 font-bold tracking-wide ${
                                colorMode === 'dark' ? 'text-white bg-gray-800' : 'text-black bg-gray-200'
                              } text-[0.8rem] sm:text-[1rem] font-orbitron`}
                            >
                              Problem
                            </TableCell>
                            <TableCell
                              className={`py-2 px-4 font-bold tracking-wide ${
                                colorMode === 'dark' ? 'text-white bg-gray-800' : 'text-black bg-gray-200'
                              } text-[0.8rem] sm:text-[1rem] font-orbitron`}
                            >
                              Status
                            </TableCell>
                            <TableCell
                              className={`py-2 px-4 font-bold tracking-wide ${
                                colorMode === 'dark' ? 'text-white bg-gray-800' : 'text-black bg-gray-200'
                              } text-[0.8rem] sm:text-[1rem] font-orbitron`}
                            >
                              Submitted At
                            </TableCell>
                            <TableCell
                              className={`py-2 px-4 font-bold tracking-wide ${
                                colorMode === 'dark' ? 'text-white bg-gray-800' : 'text-black bg-gray-200'
                              } text-[0.8rem] sm:text-[1rem] font-orbitron`}
                            >
                              Language
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {user?.submissions?.map((submission, index) => (
                            <TableRow key={index} hover>
                              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                {submission.problemId}
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: getStatusColor(submission.status),
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                }}
                              >
                                {submission.status}
                              </TableCell>
                              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                {new Date(submission.submittedAt).toLocaleString()}
                              </TableCell>
                              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                {' '}
                                {typeof submission.languageId === 'number'
                                  ? supportedLanguages[submission.languageId] || 'Not specified'
                                  : submission.languageId}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Box>
        </main>
      </Box>
    </Layout>
  );
}
