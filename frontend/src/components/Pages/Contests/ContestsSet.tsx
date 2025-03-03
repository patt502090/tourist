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
import { Link } from 'react-router-dom';
import { isAccepted, isRejected } from '../../../utils/helpers';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import { useUserSlice } from '../../../store/user';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import { SelectChangeEvent } from '@mui/material';
import { useContestSlice } from '../../../store/contestSlice/contest';
import useDebounce from '../../../hooks/useDebounce';
import ContestsTable from './ContestsTable';

export default function ContestsSet() {
  const [open, setOpen] = useState<boolean>(false); // ปิด backdrop ถ้าไม่มี loading
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const contests = useContestSlice((state) => state.contests);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const handleClose = () => setOpen(false);
  const columnHelper = createColumnHelper<Contest>();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const user = useUserSlice((state) => state.user);

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
        cell: (info) => (
          <Link to={`/contests/${info.row.original._id}${info.row.index + 1}`}>
            {info.row.index + 1}. {info.getValue()}
          </Link>
        ),
        filterFn: 'titleFilter' as any,
      }),
      columnHelper.accessor((row) => row.startTime, {
        id: 'StartTime',
        cell: (info) => new Date(info.getValue()).toLocaleString(),
      }),
      columnHelper.accessor((row) => row.endTime, {
        id: 'EndTime',
        cell: (info) => new Date(info.getValue()).toLocaleString(),
      }),
      columnHelper.accessor((row) => row.participants, {
        id: 'Participants',
        cell: (info) => `${info.getValue() ? info.getValue().length : 0} participants`,
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
      titleFilter: (row, columnId, filterValue) =>
        row.original[columnId].toLowerCase().includes(filterValue.toLowerCase()),
    },
  });

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

  return (
    <ContestsTable
      handleStatusChange={handleStatusChange}
      handleDifficultChange={() => {}} // ถ้าไม่ใช้ difficultyFilter
      statusFilter={statusFilter}
      difficultyFilter="all" // ถ้าไม่ใช้ difficultyFilter
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