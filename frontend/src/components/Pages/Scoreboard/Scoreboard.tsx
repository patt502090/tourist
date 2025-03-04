import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, useReactTable, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Link } from 'react-router-dom';
import { Box } from '@mui/material';
import { keyframes } from '@emotion/react'; // Install @emotion/react if not already
import getContest from '../../../services/getContest';
import { useUserSlice } from '../../../store/user';

// Define animations
const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(255, 107, 107, 0.5); }
  50% { box-shadow: 0 0 20px rgba(255, 107, 107, 0.8); }
  100% { box-shadow: 0 0 5px rgba(255, 107, 107, 0.5); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

interface ScoreboardEntry {
  rank: number;
  username: string;
  totalPoints: number;
  solvedProblems: number;
  userId: string;
}

interface ParticipantProgress {
  userId: string;
  totalPoints: number;
  solvedProblems?: number; // Optional เพราะบางตัวไม่มี
  solvedProblemIds: string[];
  _id: string;
  username?: string; // Optional เพราะไม่ใช่ทุก object จะมี
}

export default function Scoreboard() {
  const [open, setOpen] = useState<boolean>(true);
  const { contestId } = useParams<{ contestId: string }>();
  const user = useUserSlice((state) => state.user);

  // Fetch contest data
  const {
    data: contestData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['contest', contestId],
    queryFn: () => {
      if (!contestId) throw new Error('Contest ID is missing');
      return getContest(contestId);
    },
    enabled: Boolean(contestId),
  });

  const columnHelper = createColumnHelper<ScoreboardEntry>();

  const scoreboardData = useMemo(() => {
    if (!contestData?.participantProgress || !contestData?.participants) return [];

    const scoreboard: ScoreboardEntry[] = contestData.participantProgress
      .map((progress: ParticipantProgress, index: number) => {
        // หา participant จาก participantProgress
        const participant = contestData.participantProgress?.find(
          (p: ParticipantProgress) => p.userId === progress.userId
        ) || { username: 'Anonymous' };

        return {
          rank: index + 1,
          // ตรวจสอบว่า participant มี username หรือไม่
          username: 'username' in participant ? participant.username || 'Anonymous' : 'Anonymous',
          totalPoints: progress.totalPoints || 0,
          solvedProblems: progress.solvedProblems || progress.solvedProblemIds?.length || 0,
          userId: progress.userId,
        };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints) // เรียงตามคะแนน
      .map((entry, index) => ({ ...entry, rank: index + 1 })); // อัปเดต rank

    return scoreboard;
  }, [contestData]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('rank', { header: 'Rank', cell: (info) => info.getValue() }),
      columnHelper.accessor('username', { header: 'Username', cell: (info) => info.getValue() }),
      columnHelper.accessor('totalPoints', { header: 'Total Distance', cell: (info) => info.getValue() }),
      columnHelper.accessor('solvedProblems', { header: 'Problems Solved', cell: (info) => info.getValue() }),
    ],
    []
  );

  const table = useReactTable({
    data: scoreboardData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { sorting: [{ id: 'totalPoints', desc: true }] },
  });

  const handleClose = () => setOpen(false);

  if (!contestId) return <p>No contest ID provided in the URL.</p>;

  if (isLoading) {
    return (
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={open} onClick={handleClose}>
        <CircularProgress color='inherit' />
      </Backdrop>
    );
  }

  if (isError) return <p>{error?.message || 'An error occurred while fetching contest data'}</p>;

  return (
    <Box
      sx={{
        padding: '40px',
        background: 'linear-gradient(135deg, #1e1e2f 0%, #2a2a4a 100%)',
        minHeight: '100vh',
        textAlign: 'center',
      }}
    >
      {/* Title */}
      <Typography
        variant='h4'
        gutterBottom
        sx={{
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #ff6b6b, #ffcb77, #ff6b6b)',
          backgroundSize: '200% 200%',
          animation: `${gradientShift} 4s ease infinite`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 15px rgba(255, 107, 107, 0.7)',
          fontFamily: "'Orbitron', sans-serif", // Add via Google Fonts
          letterSpacing: '2px',
        }}
      >
        {contestData?.title || 'Unnamed Contest'} - ADVENTURE TABLE
      </Typography>

      {/* Back Button */}
      <Button
        variant='contained'
        component={Link}
        to={`/contests/${contestId}`}
        sx={{
          marginBottom: '30px',
          padding: '12px 24px',
          fontSize: '16px',
          background: 'linear-gradient(45deg, #ff6b6b, #ff8e53)',
          borderRadius: '25px',
          boxShadow: '0 4px 15px rgba(255, 107, 107, 0.5)',
          '&:hover': {
            background: 'linear-gradient(45deg, #ff8e53, #ff6b6b)',
            boxShadow: '0 6px 20px rgba(255, 107, 107, 0.8)',
            transform: 'scale(1.05)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        Back to Problems
      </Button>

      {/* Table */}
      <Table
        sx={{
          maxWidth: 900,
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '15px',
          overflow: 'hidden',
          boxShadow: '0 0 30px rgba(255, 107, 107, 0.2)',
        }}
      >
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableCell
                  key={header.id}
                  sx={{
                    fontWeight: 'bold',
                    color: '#fff',
                    background: 'linear-gradient(90deg, #ff6b6b, #ff8e53)',
                    padding: '15px',
                    borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  {header.isPlaceholder ? null : (header.column.columnDef.header as string)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row, index) => (
            <TableRow
              key={row.id}
              sx={{
                background: index < 3 ? `rgba(${255 - index * 50}, 107, 107, 0.1)` : 'transparent', // Top 3 get special bg
                '&:hover': { background: 'rgba(255, 107, 107, 0.2)' },
                animation: row.original.userId === user?._id ? `${glow} 2s infinite` : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  sx={{
                    color: '#fff',
                    padding: '20px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    fontFamily: "'Roboto Mono', monospace", // Add via Google Fonts
                    fontSize: '16px',
                  }}
                >
                  {cell.column.id === 'username' && row.original.userId === user?._id
                    ? `${cell.getValue() as string} (You)`
                    : cell.column.id === 'rank'
                      ? Number(cell.getValue()) === 1
                        ? '1 🥇' // อันดับ 1
                        : Number(cell.getValue()) === 2
                          ? '2 🥈' // อันดับ 2
                          : Number(cell.getValue()) === 3
                            ? '3 🥉' // อันดับ 3
                            : (cell.getValue() as string)
                      : (cell.getValue() as string)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {scoreboardData.length === 0 && (
        <Typography
          variant='body1'
          sx={{
            marginTop: '30px',
            color: '#ff8e53',
            textShadow: '0 0 10px rgba(255, 142, 83, 0.5)',
          }}
        >
          No scores available yet. Be the first to shine!
        </Typography>
      )}
    </Box>
  );
}
