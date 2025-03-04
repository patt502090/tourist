import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useMemo, useState } from 'react';
import { Contest } from '../../../utils/types';
import GroupIcon from '@mui/icons-material/Group';
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
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import { SelectChangeEvent, Box, Typography, Chip, Backdrop } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useAuthContext } from '../../../context/AuthContext';
import { useContestSlice } from '../../../store/contestSlice/contest';
import { useUserSlice } from '../../../store/user';
import useDebounce from '../../../hooks/useDebounce';

export default function ContestsSet() {
  const [open, setOpen] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { isError, isLoading, error } = useAuthContext();
  const contests = useContestSlice((state) => {
    // console.log('Contests:', state.contests);
    return state.contests;
  });
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const handleClose = () => setOpen(false);
  const columnHelper = createColumnHelper<Contest>();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const user = useUserSlice((state) => state.user);

  const columns = useMemo(
    () => [
      columnHelper.accessor(
        (row) => {
          console.log('ck', row.startTime, row.endTime);
          const now = new Date(); // Local ICT time
          const start = row.startTime ? new Date(row.startTime) : null; // UTC parsed correctly
          const end = row.endTime ? new Date(row.endTime) : null; // UTC parsed correctly

          // console.log(`Now: ${now}, Start: ${start}, End: ${end}`);
          // console.log(`Contest: ${row.title}, Now: ${now}, Start: ${start}, End: ${end}`);

          if (!start || isNaN(start.getTime())) {
            return 'Not Set';
          }
          if (now < start) {
            return 'Not Started';
          }
          if (end && !isNaN(end.getTime()) && now >= start && now <= end) {
            return 'In Progress';
          }
          if (end && !isNaN(end.getTime()) && now > end) {
            return 'Ended';
          }
          return 'Ongoing';
        },
        {
          id: 'Status',
          cell: (info) => {
            const status = info.getValue() as string;
            let icon;
            let color;

            switch (status) {
              case 'Not Started':
                icon = <PendingOutlinedIcon />;
                color = 'warning';
                break;
              case 'In Progress':
                icon = <TaskAltOutlinedIcon />;
                color = 'success';
                break;
              case 'Ended':
                icon = <TaskAltOutlinedIcon />;
                color = 'grey.500';
                break;
              case 'Ongoing':
                icon = <TaskAltOutlinedIcon />;
                color = 'info';
                break;
              case 'Not Set':
              default:
                icon = null;
                color = 'grey.500';
                break;
            }
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {icon && (
                  <Box component='span' sx={{ color }}>
                    {icon}
                  </Box>
                )}
                <Typography variant='body2' sx={{ color, fontWeight: 500, textTransform: 'capitalize' }}>
                  {status}
                </Typography>
              </Box>
            );
          },
          filterFn: 'timeStatusFilter' as any,
        }
      ),
      columnHelper.accessor((row) => row.title, {
        id: 'Title',
        cell: (info) => (
          <Link to={`/contests/${info.row.original._id}`}>
            {info.row.index + 1}. {info.getValue()}
          </Link>
        ),
        filterFn: 'titleFilter' as any,
      }),
      columnHelper.accessor((row) => row.startTime ?? 'Not Set', {
        id: 'StartTime',
        cell: (info) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTimeIcon
              fontSize='small'
              sx={{ color: info.getValue() === 'Not Set' ? 'grey.500' : 'primary.main' }}
            />
            <Typography
              variant='body2'
              sx={{
                fontWeight: 500,
                color: info.getValue() === 'Not Set' ? 'grey.500' : 'text.primary',
                fontFamily: "'Roboto', sans-serif",
              }}
            >
              {info.getValue() === 'Not Set'
                ? 'Not Set'
                : new Date(info.getValue()).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
            </Typography>
          </Box>
        ),
      }),
      columnHelper.accessor((row) => row.endTime ?? 'Not Set', {
        id: 'EndTime',
        cell: (info) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTimeIcon
              fontSize='small'
              sx={{ color: info.getValue() === 'Not Set' ? 'grey.500' : 'primary.main' }}
            />
            <Typography
              variant='body2'
              sx={{
                fontWeight: 500,
                color: info.getValue() === 'Not Set' ? 'grey.500' : 'text.primary',
                fontFamily: "'Roboto', sans-serif",
              }}
            >
              {info.getValue() === 'Not Set'
                ? 'Not Set'
                : new Date(info.getValue()).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
            </Typography>
          </Box>
        ),
      }),
      columnHelper.accessor((row) => row.participantProgress ?? [], {
        id: 'Participants',
        cell: (info) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon fontSize='small' sx={{ color: 'secondary.main' }} />
            <Chip
              label={info.getValue().length}
              size='small'
              sx={{
                backgroundColor: 'secondary.light',
                color: 'secondary.contrastText',
                fontWeight: 600,
                borderRadius: '16px',
                height: '24px',
                '& .MuiChip-label': { padding: '0 8px' },
              }}
            />
            <Typography variant='body2' sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
              Participants
            </Typography>
          </Box>
        ),
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
      timeStatusFilter: (row, _columnId, filterValue) => {
        if (filterValue === 'all'){
            return true;
        }

        const now = new Date();
        const start = row.original.startTime ? new Date(row.original.startTime) : null;
        const end = row.original.endTime ? new Date(row.original.endTime) : null;

        if (!start || isNaN(start.getTime())) {
          return filterValue === 'Not Set';
        }
        if (now < start) {
          return filterValue === 'Not Started';
        }
        if (end && !isNaN(end.getTime()) && now >= start && now <= end) {
          return filterValue === 'In Progress';
        }
        if (end && !isNaN(end.getTime()) && now > end) {
          return filterValue === 'Ended';
        }
        return filterValue === 'Ongoing';
      },
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

  if (isLoading) {
    return (
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={open} onClick={handleClose}>
        <CircularProgress color='inherit' />
      </Backdrop>
    );
  }

  if (isError) {
    return <p>{error?.message || 'An error occurred'}</p>;
  }

  return (
    <Box sx={{ padding: '20px' }}>
      {/* Header */}
      <Typography
        variant='h4'
        sx={{
          fontWeight: 700,
          color: 'text.primary',
          marginBottom: '20px',
          textAlign: 'center',
          fontFamily: "'Roboto Slab', 'Poppins', serif", // Refined font stack
          letterSpacing: '0.5px', // Subtle spacing for elegance
          textShadow: (theme) => (
            theme.palette.mode === 'dark'
              ? '0 2px 4px rgba(255, 105, 180, 0.3)'  // Cyberpunk neon glow
              : '0 2px 4px rgba(0, 0, 0, 0.1)'        // Cute soft shadow
          ),
          lineHeight: 1.2, // Tighter line height for neatness
          padding: '8px 16px', // Slight padding for a framed effect
          background: (theme) => (
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(255, 20, 147, 0.1), rgba(0, 229, 255, 0.1))' // Cyberpunk gradient
              : 'linear-gradient(135deg, rgba(255, 138, 138, 0.05), rgba(255, 255, 255, 0.05))'
            ), // Cute subtle gradient
          borderRadius: '8px', // Rounded edges
          border: (theme) => (
            theme.palette.mode === 'dark' ? '1px solid rgba(255, 105, 180, 0.3)' : '1px solid rgba(0, 0, 0, 0.05)'
          ),
        }}
      >
        List of Competitions
      </Typography>

      {/* Contests Table */}
      <ContestsTable
        handleStatusChange={handleStatusChange}
        handleDifficultChange={() => {}}
        difficultyFilter='all'
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
    </Box>
  );
}
