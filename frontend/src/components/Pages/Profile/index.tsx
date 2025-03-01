import { Avatar, IconButton, ListItemIcon, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useAuthSlice } from '../../../store/authslice/auth';
import { useUserSlice } from '../../../store/user';
import signOutAPI from '../../../services/signOut';

export default function ProfilePage() {
  const user = useUserSlice((state) => state.user);
  const setUser = useUserSlice((state) => state.setUser);
  const signOut = useAuthSlice((state) => state.signOut);
  const navigate = useNavigate();
  const { mutateAsync, isError, error } = useMutation({
    mutationKey: ['sign-out'],
    mutationFn: signOutAPI,
  });
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  console.log('user', user);
  console.log('submissions', user?.submissions);
  return (
    <>
      <Tooltip title='Account settings'>
        <IconButton
          onClick={handleClick}
          size='small'
          sx={{ ml: 2 }}
          aria-controls={open ? 'account-menu' : undefined}
          aria-haspopup='true'
          aria-expanded={open ? 'true' : undefined}
        >
          <Avatar sx={{ width: 32, height: 32 }}>{user?.username[0]}</Avatar>
        </IconButton>
      </Tooltip>
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
      <div>
        {user ? (
          <ul>
            {Object.entries(user).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {value.toString()}
              </li>
            ))}
            <h3>Submissions:</h3>
            <ul>
              {user?.submissions?.map((submission, index) => (
                <li key={index}>
                  <strong>Problem:</strong> {submission.problemId} |<strong> Status:</strong> {submission.status} |{' '}
                  <strong>Submitted At:</strong> {submission.submittedAt.toLocaleString()}| <strong>Language:</strong>{' '}
                  {submission.languageId}
                </li>
              ))}
            </ul>
          </ul>
        ) : (
          <p>No user data available</p>
        )}
      </div>
    </>
  );
}
