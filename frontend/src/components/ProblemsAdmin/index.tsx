import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useMemo, useState } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { capitalize, SelectChangeEvent, IconButton, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuthContext } from '../../context/AuthContext';
import { useProblemSlice } from '../../store/problemSlice/problem';
import useDebounce from '../../hooks/useDebounce';
import { Problem } from '../../utils/types';
import { useUserSlice } from '../../store/user';
import { difficultyColors } from '../../constants/Index';
import ProblemsTable from '../Pages/Problems/ProblemsTable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import deleteProblemAPI from '../../services/deleteProblem';

export default function ProblemsSetAdmin() {
  const [open, setOpen] = useState<boolean>(true);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const { isError, isLoading, error } = useAuthContext();
  const problems = useProblemSlice((state) => state.problems);
  const setProblems = useProblemSlice((state) => state.setProblems); // Add setter for problems
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const handleClose = () => {
    setOpen(false);
  };
  const columnHelper = createColumnHelper<Problem>();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const user = useUserSlice((state) => state.user);
  const queryClient = useQueryClient();

  const { mutateAsync: deleteProblem } = useMutation({
    mutationFn: ({ problemId, userId }: { problemId: string; userId: string }) => deleteProblemAPI(problemId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-problems'] });
    },
  });

  const handleDelete = async (problemId: string) => {
    try {
      if (user) {
        await deleteProblem({ problemId, userId: user._id });
        setProblems(problems.filter((problem) => problem._id !== problemId));
        setSnackbarMessage('Problem deleted successfully');
        setSnackbarSeverity('success');
      } else {
        console.error('User is not authenticated');
        setSnackbarMessage('User is not authenticated');
        setSnackbarSeverity('error');
      }
    } catch (error) {
      console.error('Failed to delete problem:', error);
      setSnackbarMessage(`Failed to delete problem: ${(error as Error).message}`);
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.status, {
        id: 'Status',
        filterFn: 'statusFilter' as any,
      }),
      columnHelper.accessor((row) => row.title, {
        id: 'Title',
        cell: (info) => {
          return (
            <Link to={`/problems/${info.row.original._id}${info.row.index + 1}`}>
              {info.row.index + 1}. {info.getValue()}
            </Link>
          );
        },
        filterFn: 'titleFilter' as any,
      }),
      columnHelper.accessor((row) => row.difficulty, {
        id: 'Difficulty',
        cell: (info) => {
          return <div style={{ color: difficultyColors[info.getValue()] }}>{capitalize(info.getValue())}</div>;
        },
        filterFn: 'difficultyFilter' as any,
      }),
      columnHelper.display({
        id: 'Actions',
        cell: (info) => (
          <IconButton onClick={() => handleDelete(info.row.original._id)} aria-label='delete'>
            <DeleteIcon />
          </IconButton>
        ),
      }),
    ],
    [user, problems]
  );

  const table = useReactTable({
    data: problems ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      columnFilters,
    },
    filterFns: {
      difficultyFilter: (row, columnId, filterValue) => {
        if (filterValue === 'all') {
          return row;
        }
        const column = columnId.toLowerCase();
        const value = filterValue ? row.original[column] === filterValue : row.original[column];
        return value;
      },
      titleFilter: (row, columnId, filterValue) => {
        const column = columnId.toLowerCase();
        // console.log(row.original[column], filterValue); // Comment out or remove this line
        const value = row.original[column].toLowerCase().includes(filterValue.toLowerCase());
        return value;
      },
      statusFilter: (row, _columnId, filterValue) => {
        const acceptedProblems = [
          ...new Set(user?.submissions.filter((s) => s.status === 'Accepted').map((s) => s.problemId)),
        ];
        const rejectedProblems = [
          ...new Set(user?.submissions.filter((s) => s.status === 'Wrong Answer').map((s) => s.problemId)),
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

  if (isLoading) {
    return (
      <>
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={open} onClick={handleClose}>
          <CircularProgress color='inherit' />
        </Backdrop>
      </>
    );
  }

  if (isError) {
    return <p>{error?.message}</p>;
  }

  return (
    <>
      Admin
      <ProblemsTable
        handleStatusChange={handleStatusChange}
        difficultyFilter={difficultyFilter}
        statusFilter={statusFilter}
        handleDifficultChange={handleDifficultyChange}
        table={table}
        data={problems}
        searchQuery={searchQuery}
        handleQueryChange={handleQueryChange}
        clear={() => {
          setSearchQuery('');
        }}
        reset={() => {
          setSearchQuery('');
          setStatusFilter('all');
          setDifficultyFilter('all');
          table.getColumn('Difficulty')?.setFilterValue('all');
          table.getColumn('Status')?.setFilterValue('all');
        }}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
