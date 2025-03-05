import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';
import { keyframes } from '@emotion/react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(30, 64, 175, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(30, 64, 175, 0); }
  100% { box-shadow: 0 0 0 0 rgba(30, 64, 175, 0); }
`;

export default function ElegantContestHeader({ contestData, timeLeft }: any) {
  return (
    <div
      style={{
        padding: '40px 20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
          zIndex: 0,
        }}
      />

      {/* Contest Title */}
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: 800,
          color: '#1e293b',
          fontFamily: "'Playfair Display', serif",
          letterSpacing: '2px',
          textTransform: 'uppercase',
          position: 'relative',
          paddingBottom: '15px',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          animation: `${fadeIn} 1s ease-out`,
          '&:after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100px',
            height: '4px',
            background: 'linear-gradient(90deg, #4b5eaa, #a5b4fc)',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(75, 94, 170, 0.3)',
          },
          '&:hover': {
            color: '#4b5eaa',
          },
        }}
      >
        {contestData?.title || 'Unnamed Contest'}
      </Typography>

      {/* Countdown Timer */}
      <Box
      className='tw-mt-4'
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '15px 30px',
          borderRadius: '50px',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
          border: '2px solid #e2e8f0',
          position: 'relative',
          zIndex: 1,
          transition: 'all 0.4s ease',
          animation: timeLeft !== 'Contest Ended' ? `${pulse} 2s infinite` : 'none',
          '&:hover': {
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-4px)',
          },
        }}
      >
        <Typography
          sx={{
            fontWeight: 600,
            color: timeLeft === 'Contest Ended' ? '#dc2626' : '#1e40af', // เปลี่ยนจากเขียวเป็นน้ำเงินเข้ม
            fontFamily: "'Montserrat', sans-serif",
            letterSpacing: '1px',
            padding: '4px 12px',
            borderRadius: '8px',
            background:
              timeLeft === 'Contest Ended'
                ? 'rgba(220, 38, 38, 0.1)' // พื้นหลังแดงสำหรับจบ
                : 'rgba(30, 64, 175, 0.1)', // พื้นหลังน้ำเงินอ่อน
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          Time Left: <span style={{ fontWeight: 700 }}>{timeLeft || 'Loading...'}</span>
        </Typography>
      </Box>
    </div>
  );
}