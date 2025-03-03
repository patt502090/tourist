import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Link, useParams } from 'react-router-dom';
import { difficultyColors } from '../../../constants/Index';
import { isAccepted, isRejected } from '../../../utils/helpers';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import {
  capitalize,
  SelectChangeEvent,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
} from '@mui/material';
import useDebounce from '../../../hooks/useDebounce';
import getContest from '../../../services/getContest';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserSlice } from '../../../store/user';
import ProblemsTable from '../Problems/ProblemsTable';
import CoolContestHeader from '../../UI/CoolContestHeader';
import { protectedapi } from '../../../API/Index';

interface ProblemData {
  _id: string;
  title: string;
  difficulty: string;
  points?: number;
  description?: string;
  sampleInput?: string;
  sampleOutput?: string;
  testCases?: { input: string; output: string }[];
  status?: string;
  starterCode?: { lang_id: number; code: string }[];
  systemCode?: { lang_id: number; code: string }[];
  metadata?: { tags: string[]; timeLimit: string; memoryLimit: string };
  imports?: string[];
  languagestoskip?: string[];
}

interface Problem {
  data: ProblemData;
  message: string;
  status: string;
}

export default function ProblemsSet() {
  const [open, setOpen] = useState<boolean>(true);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [timeDisplay, setTimeDisplay] = useState<string>(''); // Unified time display
  const [dialogOpen, setDialogOpen] = useState<boolean>(false); // For confirmation dialog
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false); // For feedback
  const [snackbarMessage, setSnackbarMessage] = useState<string>(''); // Feedback message
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const handleClose = () => setOpen(false);
  const columnHelper = createColumnHelper<ProblemData>();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const user = useUserSlice((state) => state.user);
  const { contestId } = useParams<{ contestId: string }>();
  const queryClient = useQueryClient();

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

  // Mutation for joining contest
  const joinContestMutation = useMutation({
    mutationFn: () => protectedapi.put(`/contests/${contestId}/join`, { userId: user?._id }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contest', contestId] });
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to join contest';
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
      console.error('Failed to join contest:', errorMessage);
    },
  });

  // Memoize problems
  const problems = useMemo(() => {
    const problemData = (contestData?.problems || []) as unknown as Problem[];
    return problemData.map((problem: Problem) => ({
      ...problem.data,
      _id: problem.data._id,
      title: problem.data.title || 'Untitled',
      difficulty: problem.data.difficulty || 'unknown',
    }));
  }, [contestData]);

  // Check if user has joined the contest
  const hasJoined = useMemo(() => {
    return contestData?.participants?.includes(user?._id || '');
  }, [contestData, user]);

  // Countdown logic
  useEffect(() => {
    if (!contestData?.startTime) return;

    const startTime = new Date(contestData.startTime).getTime();
    const endTime = contestData.endTime ? new Date(contestData.endTime).getTime() : null;
    const now = new Date().getTime();

    const updateTimer = () => {
      const currentTime = new Date().getTime();

      if (!hasJoined && currentTime < startTime) {
        const distanceToStart = startTime - currentTime;
        if (distanceToStart <= 0) {
          setTimeDisplay('Contest Started');
          return;
        }
        const days = Math.floor(distanceToStart / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distanceToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distanceToStart % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distanceToStart % (1000 * 60)) / 1000);
        setTimeDisplay(`Starts in ${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s`);
      } else if (endTime) {
        const distanceToEnd = endTime - currentTime;
        if (distanceToEnd <= 0) {
          setTimeDisplay('Contest Ended');
          return;
        }
        const days = Math.floor(distanceToEnd / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distanceToEnd % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distanceToEnd % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distanceToEnd % (1000 * 60)) / 1000);
        setTimeDisplay(`${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s left`);
      } else {
        setTimeDisplay('Ongoing');
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [contestData?.startTime, contestData?.endTime, hasJoined]);

  // Handle join contest with confirmation
  const handleJoinContest = () => {
    if (!user?._id) {
      setSnackbarMessage('Please log in to join the contest.');
      setSnackbarOpen(true);
      return;
    }
    setDialogOpen(true);
  };

  const confirmJoinContest = async () => {
    console.log('Starting confirmJoinContest');
    try {
      console.log('Attempting initial join mutation with userId:', user?._id);
      await joinContestMutation.mutateAsync(); // Wait for the initial join mutation
      console.log('Initial join mutation succeeded');

      // Additional PUT request after successful join
      console.log('Sending additional PUT to /contests/${contestId}/join with userId:', user?._id);
      await protectedapi.put(`/contests/${contestId}/join`, { userId: user?._id });
      console.log('Additional PUT request succeeded');

      setSnackbarMessage('Successfully joined and updated contest!');
      setSnackbarOpen(true);
      console.log('Success message set, Snackbar opened');
    } catch (err) {
      const errorMessage =
        (err as any).response?.data?.message || (err as any).message || 'Failed to update contest after joining';
      console.error('Error occurred:', errorMessage, 'Full error:', err);
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
      console.log('Error message set, Snackbar opened with:', errorMessage);
    }
    setDialogOpen(false);
    console.log('Dialog closed');
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.status, {
        id: 'Status',
        cell: (info) => {
          let icon;
          if (user) {
            icon = isAccepted(info.row.original._id, user?.submissions) ? (
              <TaskAltOutlinedIcon titleAccess='Solved' color='success' />
            ) : isRejected(info.row.original._id, user?.submissions) ? (
              <PendingOutlinedIcon titleAccess='Attempted' color='warning' />
            ) : null;
          }
          return <div>{icon}</div>;
        },
        filterFn: 'statusFilter' as any,
      }),
      columnHelper.accessor((row) => row.title, {
        id: 'Title',
        cell: (info) => (
          <Link to={`/problems/${info.row.original._id}${info.row.index + 1}`}>
            {info.row.index + 1}. {info.getValue() || 'Untitled'}
          </Link>
        ),
        filterFn: 'titleFilter' as any,
      }),
      columnHelper.accessor((row) => row.difficulty, {
        id: 'Difficulty',
        cell: (info) => (
          <div style={{ color: difficultyColors[info.getValue() as keyof typeof difficultyColors] || '#000000' }}>
            {capitalize(info.getValue() || 'unknown')}
          </div>
        ),
        filterFn: 'difficultyFilter' as any,
      }),
    ],
    [user]
  );

  const table = useReactTable({
    data: problems,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: { columnFilters },
    filterFns: {
      difficultyFilter: (row, columnId, filterValue) => {
        if (filterValue === 'all') return true;
        const column = columnId.toLowerCase();
        return row.original[column] === filterValue;
      },
      titleFilter: (row, columnId, filterValue) => {
        const column = columnId.toLowerCase();
        return row.original[column]?.toLowerCase().includes(filterValue.toLowerCase()) || false;
      },
      statusFilter: (row, _columnId, filterValue) => {
        const acceptedProblems = [
          ...new Set(user?.submissions?.filter((s) => s.status === 'Accepted').map((s) => s.problemId)),
        ];
        const rejectedProblems = [
          ...new Set(user?.submissions?.filter((s) => s.status === 'Wrong Answer').map((s) => s.problemId)),
        ];
        const onlyRejectProblems = rejectedProblems.filter((id) => !acceptedProblems.includes(id));
        if (filterValue === 'solved') {
          return acceptedProblems?.includes(row.original._id);
        } else if (filterValue === 'attempted') {
          return onlyRejectProblems?.includes(row.original._id);
        } else if (filterValue === 'todo') {
          return !onlyRejectProblems?.includes(row.original._id) && !acceptedProblems.includes(row.original._id);
        }
        return true;
      },
    },
  });

  const handleDifficultyChange = (event: SelectChangeEvent) => {
    setDifficultyFilter(event.target.value);
    table.getColumn('Difficulty')?.setFilterValue(event.target.value);
  };
  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    table.getColumn('Status')?.setFilterValue(event.target.value);
  };

  const handleQueryChange = (queryvalue: string) => {
    setSearchQuery(queryvalue);
  };

  useEffect(() => {
    table.getColumn('Title')?.setFilterValue(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  if (!contestId) {
    return <p>No contest ID provided in the URL.</p>;
  }

  if (isLoading) {
    return (
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={open} onClick={handleClose}>
        <CircularProgress color='inherit' />
      </Backdrop>
    );
  }

  if (isError) {
    return <p>{error?.message || 'An error occurred while fetching contest data'}</p>;
  }

  if (problems.length === 0) {
    return <p>No problems found for this contest.</p>;
  }

  const showTable = hasJoined && contestData && new Date() >= new Date(contestData.startTime);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      {/* Contest Header */}
      <CoolContestHeader contestData={contestData} timeLeft={timeDisplay} />

      {/* Join Button or Scoreboard */}
      <Box sx={{ margin: '20px 0' }}>
        {!hasJoined && contestData && new Date() < new Date(contestData.startTime) ? (
          <Button
            variant='contained'
            color='primary'
            onClick={handleJoinContest}
            sx={{ padding: '10px 20px', fontSize: '16px' }}
          >
            Join Contest
          </Button>
        ) : (
          <Button
            variant='contained'
            color='primary'
            component={Link}
            to={`/contests/${contestId}/scoreboard`}
            sx={{ padding: '10px 20px', fontSize: '16px' }}
          >
            View Scoreboard
          </Button>
        )}
      </Box>

      {/* Problems Table */}
      {showTable && (
        <div style={{ textAlign: 'left' }}>
          <ProblemsTable
            handleStatusChange={handleStatusChange}
            difficultyFilter={difficultyFilter}
            statusFilter={statusFilter}
            handleDifficultChange={handleDifficultyChange}
            table={table}
            data={problems}
            searchQuery={searchQuery}
            handleQueryChange={handleQueryChange}
            clear={() => setSearchQuery('')}
            reset={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setDifficultyFilter('all');
              table.getColumn('Difficulty')?.setFilterValue('all');
              table.getColumn('Status')?.setFilterValue('all');
            }}
          />
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby='join-contest-dialog-title'
        aria-describedby='join-contest-dialog-description'
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1A1F2E 30%, #0A0E17 90%)' // Cyberpunk gradient
                : 'linear-gradient(135deg, #FFFFFF 30%, #F6F8FA 90%)', // Cute gradient
            border: (theme) => (theme.palette.mode === 'dark' ? '1px solid #FF69B4' : '1px solid #E8ECEF'),
            width: '400px',
          },
        }}
      >
        <DialogTitle
          id='join-contest-dialog-title'
          sx={{
            fontWeight: 700,
            fontSize: '1.5rem',
            color: (theme) => (theme.palette.mode === 'dark' ? '#FF69B4' : '#424242'), // Pink for cyberpunk, gray for cute
            textAlign: 'center',
            borderBottom: (theme) =>
              theme.palette.mode === 'dark' ? '1px solid rgba(255, 105, 180, 0.3)' : '1px solid #E8ECEF',
            padding: '16px 24px',
            backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 105, 180, 0.1)' : 'transparent'),
          }}
        >
          Join Contest
        </DialogTitle>
        <DialogContent
          sx={{
            marginTop: '16px',
            padding: '24px',
            color: (theme) => (theme.palette.mode === 'dark' ? '#E0E0E0' : '#616161'),
          }}
        >
          <DialogContentText
            id='join-contest-dialog-description'
            sx={{
              fontSize: '1.1rem',
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            Are you sure you want to join this contest? Once joined, you’ll be part of the competition!
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            padding: '16px 24px',
            justifyContent: 'center',
            gap: 2,
            borderTop: (theme) =>
              theme.palette.mode === 'dark' ? '1px solid rgba(255, 105, 180, 0.3)' : '1px solid #E8ECEF',
          }}
        >
          <Button
            onClick={handleDialogClose}
            color='primary'
            sx={{
              padding: '8px 20px',
              fontWeight: 600,
              borderRadius: '8px',
              textTransform: 'capitalize',
              color: (theme) => (theme.palette.mode === 'dark' ? '#00E5FF' : '#FF9999'), // Cyan for cyberpunk, pink for cute
              '&:hover': {
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(0, 229, 255, 0.1)' : 'rgba(255, 153, 153, 0.1)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmJoinContest}
            color='primary'
            variant='contained'
            autoFocus
            sx={{
              padding: '8px 20px',
              fontWeight: 600,
              borderRadius: '8px',
              textTransform: 'capitalize',
              backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#FF1493' : '#FF8A8A'), // Neon pink for cyberpunk, coral for cute
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              '&:hover': {
                backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#FF4081' : '#FF6699'),
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              },
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={joinContestMutation.isError ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
