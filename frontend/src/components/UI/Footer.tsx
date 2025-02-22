import { Box } from '@mui/material';

export default function Footer() {
  return (
    <footer className='tw-sticky tw-bottom-0 tw-py-1'>
      <div className='tw-container-lg tw-flex tw-justify-evenly tw-max-auto'>
        <Box sx={{ paddingBlock: '5px' }}>Copyright &copy; 2025 Porametix</Box>
        <Box sx={{ paddingBlock: '5px' }}>Made For SDA 240-229</Box>
      </div>
    </footer>
  );
}
