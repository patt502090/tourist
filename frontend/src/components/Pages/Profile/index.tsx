import {
  Avatar,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
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

export default function ProfilePage() {
  const user = useUserSlice((state) => state.user);
  const setUser = useUserSlice((state) => state.setUser);
  const signOut = useAuthSlice((state) => state.signOut);
  const navigate = useNavigate();
  const { mutateAsync, isError } = useMutation({
    mutationKey: ['sign-out'],
    mutationFn: signOutAPI,
  });
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const open = Boolean(anchorEl);
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    setAnchorEl(event.currentTarget);
  };
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
              <ListItemIcon
                onClick={async () => {
                  await mutateAsync();
                  if (isError) {
                    alert('An error occurred while signing out. Please try again.');
                    return;
                  }
                  setUser(null);
                  signOut();
                  navigate('/signin');
                }}
              >
                <LogoutIcon />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
          <Box sx={{ width: '100%' }}>
            <Tabs value={tabIndex} onChange={handleTabChange} aria-label='profile tabs'>
              <Tab label='Profile' />
              <Tab label='Submissions' />
            </Tabs>
            {tabIndex === 0 && (
              <Box sx={{ p: 3 }}>
                <h2>Profile</h2>
                <ul>
                  {user &&
                    Object.entries(user)
                      .filter(([key]) => ['username', 'email', 'favoriteProgrammingLanguage'].includes(key))
                      .map(([key, value]) => (
                        <li key={key}>
                          <strong>{key}:</strong> {value.toString()}
                        </li>
                      ))}
                </ul>
              </Box>
            )}
            {tabIndex === 1 && (
              <Box sx={{ p: 3, maxHeight: '60vh', overflowY: 'auto' }}>
                <h2>Submissions</h2>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Problem</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Submitted At</TableCell>
                        <TableCell>Language</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {user?.submissions?.map((submission, index) => (
                        <TableRow key={index}>
                          <TableCell>{submission.problemId}</TableCell>
                          <TableCell style={{ color: getStatusColor(submission.status) }}>
                            {submission.status}
                          </TableCell>
                          <TableCell>{new Date(submission.submittedAt).toLocaleString()}</TableCell>
                          <TableCell>{submission.languageId}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        </main>
      </Box>
    </Layout>
  );
}
