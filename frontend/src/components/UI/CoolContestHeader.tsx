import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';

export default function ElegantContestHeader({ contestData, timeLeft }:any) {
  return (
    <div style={{ padding: '30px', textAlign: 'center',}}>
      {/* Contest Title */}
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 700,
          color: '#1e293b', // Dark slate for sophistication
          fontFamily: "'Roboto Slab', serif", // Elegant serif font (add via Google Fonts)
          letterSpacing: '1px',
          textTransform: 'uppercase',
          position: 'relative',
          paddingBottom: '10px',
          '&:after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80px',
            height: '3px',
            background: 'linear-gradient(90deg, #4b5eAA, #7aa2f7)', // Subtle gradient underline
            borderRadius: '2px',
          },
          transition: 'color 0.3s ease',
          '&:hover': {
            color: '#4b5eaa', // Slightly lighter on hover
          },
        }}
      >
        {contestData?.title || 'Unnamed Contest'}
      </Typography>

      {/* Countdown Timer */}
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          background: '#ffffff',
          padding: '12px 24px',
          borderRadius: '30px', // Rounded pill shape
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', // Soft shadow
          border: '1px solid #e2e8f0', // Light border
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-2px)', // Subtle lift on hover
          },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 500,
            color: timeLeft === 'Contest Ended' ? '#dc2626' : '#15803d', // Red for ended, green for active
            fontFamily: "'Roboto', sans-serif", // Clean sans-serif
            letterSpacing: '0.5px',
            padding: '0 8px',
            borderRadius: '4px',
            background: timeLeft === 'Contest Ended'
              ? 'rgba(220, 38, 38, 0.05)' // Light red background
              : 'rgba(21, 128, 61, 0.05)', // Light green background
          }}
        >
          Time Left: <span style={{ fontWeight: 700 }}>{timeLeft || 'Loading...'}</span>
        </Typography>
      </Box>
    </div>
  );
}