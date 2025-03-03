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
import { capitalize, SelectChangeEvent } from '@mui/material';
import useDebounce from '../../../hooks/useDebounce';
import getContest from '../../../services/getContest';
import { useQuery } from '@tanstack/react-query';
import { useUserSlice } from '../../../store/user';
import ProblemsTable from '../Problems/ProblemsTable';

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
  const [timeLeft, setTimeLeft] = useState<string>(''); // State สำหรับนับถอยหลัง
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const handleClose = () => setOpen(false);
  const columnHelper = createColumnHelper<ProblemData>();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const user = useUserSlice((state) => state.user);
  const { contestId } = useParams<{ contestId: string }>();

  // Fetch contest data
  const {
    data: contestData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['contest', contestId],
    queryFn: () => {
      if (!contestId) {
        throw new Error("Contest ID is missing");
      }
      return getContest(contestId);
    },
    enabled: Boolean(contestId),
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

  // คำนวณเวลาที่เหลือและอัปเดตทุกวินาที
  useEffect(() => {
    if (!contestData?.endTime) return;

    const endTime = new Date(contestData.endTime).getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance <= 0) {
        setTimeLeft('Contest Ended');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s`
      );
    };

    updateTimer(); // เรียกครั้งแรกทันที
    const timer = setInterval(updateTimer, 1000); // อัปเดตทุกวินาที

    return () => clearInterval(timer); // Cleanup เมื่อ component unmount
  }, [contestData?.endTime]);

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.status, {
        id: 'Status',
        cell: (info) => {
          let icon;
          if (user) {
            icon = isAccepted(info.row.original._id, user?.submissions) ? (
              <TaskAltOutlinedIcon titleAccess="Solved" color="success" />
            ) : isRejected(info.row.original._id, user?.submissions) ? (
              <PendingOutlinedIcon titleAccess="Attempted" color="warning" />
            ) : null;
          } else {
            icon = null;
          }
          return <div>{icon}</div>;
        },
        filterFn: 'statusFilter' as any,
      }),
      columnHelper.accessor((row) => row.title, {
        id: 'Title',
        cell: (info) => {
          const title = info.getValue();
          return (
            <Link to={`/problems/${info.row.original._id}${info.row.index + 1}`}>
              {info.row.index + 1}. {title || 'Untitled'}
            </Link>
          );
        },
        filterFn: 'titleFilter' as any,
      }),
      columnHelper.accessor((row) => row.difficulty, {
        id: 'Difficulty',
        cell: (info) => {
          const difficulty = info.getValue();
          return (
            <div style={{ color: difficultyColors[difficulty as keyof typeof difficultyColors] || '#000000' }}>
              {capitalize(difficulty || 'unknown')}
            </div>
          );
        },
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
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (isError) {
    return <p>{error?.message || 'An error occurred while fetching contest data'}</p>;
  }

  if (problems.length === 0) {
    return <p>No problems found for this contest.</p>;
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      {/* ชื่อการแข่งขัน */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        {contestData?.title || 'Unnamed Contest'}
      </Typography>

      {/* นาฬิกานับถอยหลัง */}
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          backgroundColor: '#f5f5f5',
          padding: '10px 20px',
          borderRadius: '8px',
          display: 'inline-block',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          color: timeLeft === 'Contest Ended' ? '#d32f2f' : '#388e3c',
        }}
      >
        Time Left: {timeLeft || 'Loading...'}
      </Typography>

      {/* ปุ่มดู Scoreboard */}
      <div style={{ margin: '20px 0' }}>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to={`/contests/${contestId}/scoreboard`}
          sx={{ padding: '10px 20px', fontSize: '16px' }}
        >
          View Scoreboard
        </Button>
      </div>

      {/* ตารางปัญหา */}
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
    </div>
  );
}