import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useMemo, useState } from 'react';
import { Contest } from '../../../utils/types';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnFiltersState,
} from '@tanstack/react-table';
import ContestsTable from './ContestsTable';
import { Link } from 'react-router-dom';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import { useUserSlice } from '../../../store/user';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import { SelectChangeEvent } from '@mui/material';
import { useAuthContext } from '../../../context/AuthContext';
import { useContestSlice } from '../../../store/contestSlice/contest';
import useDebounce from '../../../hooks/useDebounce';

export default function ContestsSet() {
  const [open, setOpen] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { isError, isLoading, error } = useAuthContext();
  const contests = useContestSlice((state) => state.contests);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const handleClose = () => {
    setOpen(false);
  };
  const columnHelper = createColumnHelper<Contest>();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const user = useUserSlice((state) => state.user);

  // Debug contests เมื่อเปลี่ยนแปลง
  useEffect(() => {
    console.log('Contests from store:', contests);
    console.log('Number of contests:', contests.length);
    if (contests.length === 0) {
      console.warn('Warning: Contests store is empty. Check AuthContextWrapper or getContests.');
    }
  }, [contests]);

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.status ?? 'N/A', {
        id: 'Status',
        cell: (info) => {
          let icon;
          if (user && user._id) {
            const progress = info.row.original.participantProgress?.find(p => p.userId === user._id);
            icon = progress && progress.solvedProblemIds?.length === info.row.original.problems.length ? (
              <TaskAltOutlinedIcon titleAccess='Solved' color='success' />
            ) : progress && progress.solvedProblemIds?.length > 0 ? (
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
          <Link to={`/contests/${info.row.original._id}${info.row.index + 1}`}>
            {info.row.index + 1}. {info.getValue()}
          </Link>
        ),
        filterFn: 'titleFilter' as any,
}),
      columnHelper.accessor((row) => row.startTime ?? 'Not Set', {
        id: 'StartTime',
        cell: (info) => (info.getValue() === 'Not Set' ? 'Not Set' : new Date(info.getValue()).toLocaleString()),
      }),
      columnHelper.accessor((row) => row.endTime ?? 'Not Set', {
        id: 'EndTime',
        cell: (info) => (info.getValue() === 'Not Set' ? 'Not Set' : new Date(info.getValue()).toLocaleString()),
}),
      columnHelper.accessor((row) => row.participants ?? [], {
        id: 'Participants',
        cell: (info) => `${info.getValue().length} participants`,
      }),
    ],
    [user]
  );

  const table = useReactTable({
    data: contests ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: { columnFilters },
    filterFns: {
      titleFilter: (row, columnId, filterValue) => {
        const column = columnId.toLowerCase();
        return row.original[column].toLowerCase().includes(filterValue.toLowerCase());
      },
      statusFilter: (row, _columnId, filterValue) => {
        if (!user || !user._id) {
          return true; // ถ้าไม่มี user ให้แสดงทั้งหมด
        }
        const progress = row.original.participantProgress?.find((p: { userId: string }) => p.userId === user._id);
        const solvedCount = progress?.solvedProblemIds?.length || 0;
        const totalProblems = row.original.problems.length;

        if (filterValue === 'solved') {
          return solvedCount === totalProblems && totalProblems > 0;
        } else if (filterValue === 'attempted') {
          return solvedCount > 0 && solvedCount < totalProblems;
        } else if (filterValue === 'todo') {
          return solvedCount === 0;
        }
        return true; // 'all'
      },
    },
  });

  // Debug filtered rows
  useEffect(() => {
    const filteredRows = table.getFilteredRowModel().rows.map((row) => row.original);
    console.log('Filtered contests in table:', filteredRows);
  }, [table.getFilteredRowModel().rows]);

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

  if (isLoading) {
    return (
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={open} onClick={handleClose}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (isError) {
    return <p>{error?.message || 'An error occurred'}</p>;
  }

  return (
    <ContestsTable
      handleStatusChange={handleStatusChange}
      handleDifficultChange={() => {}}
      difficultyFilter="all"
      statusFilter={statusFilter}
      table={table}
      data={contests}
      searchQuery={searchQuery}
      handleQueryChange={handleQueryChange}
      clear={() => setSearchQuery('')}
      reset={() => {
        setSearchQuery('');
        setStatusFilter('all');
        table.getColumn('Status')?.setFilterValue('all');
      }}
    />
  );
}