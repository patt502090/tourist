import { Avatar, IconButton, ListItemIcon, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { useUserSlice } from '../../store/user';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuthSlice } from '../../store/authslice/auth';
import { useMutation } from '@tanstack/react-query';
import signOutAPI from '../../services/signOut';
import { useNavigate } from 'react-router';

export default function Profile() {
  const user = useUserSlice((state) => state.user);
  const setUser = useUserSlice((state) => state.setUser);
  const signOut = useAuthSlice((state) => state.signOut);
  const navigate = useNavigate();
  const { mutateAsync } = useMutation({
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
    </>
  );
}
