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
import {
  capitalize,
  SelectChangeEvent,
  IconButton,
  Snackbar,
  Alert,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
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
import AdminupdateProblemAPI from '../../services/AdminupdateProblem';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import AdmincreateProblemAPI from '../../services/AdmincreateProblem';

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
  const setProblems = useProblemSlice((state) => state.setProblems);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<Problem>({
    title: '',
    description: '',
    difficulty: 'easy',
    sampleInput: '',
    sampleOutput: '',
    testCases: [],
    status: '',
    starterCode: [],
    systemCode: [],
    metadata: {
      timeLimit: 1000,
      memoryLimit: 512,
    },
    contest: '',
    points: 0,
  });
  const [updateformData, setUpdateFormData] = useState<Problem>({
    title: '',
    description: '',
    difficulty: 'easy',
    testCases: [],
    status: '',
    starterCode: [],
    systemCode: [],
    metadata: {
      timeLimit: 1000,
      memoryLimit: 512,
    },
    contest: '',
    points: 0,
  });

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

  const { mutateAsync: AdminupdateProblem } = useMutation({
    mutationFn: ({ problemId, userId, data }: { problemId: string; userId: string; data: Problem }) =>
      AdminupdateProblemAPI(problemId, userId, data),
    onSuccess: (updatedProblem: Problem) => {
      setProblems(problems.map((p) => (p._id === updatedProblem._id ? updatedProblem : p)));
      queryClient.invalidateQueries({ queryKey: ['get-problems'] });
      setSnackbarMessage('Problem updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setEditModalOpen(false);
    },
    onError: (error: Error) => {
      setSnackbarMessage(`Failed to update problem: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    },
  });

  const { mutateAsync: createProblem } = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Problem }) => AdmincreateProblemAPI(userId, data),
    onSuccess: (newProblem: Problem) => {
      setProblems([...problems, newProblem]);
      queryClient.invalidateQueries({ queryKey: ['get-problems'] });
      setSnackbarMessage('Problem created successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setCreateModalOpen(false);
      setFormData({
        title: '',
        description: '',
        difficulty: 'easy',
        sampleInput: '',
        sampleOutput: '',
        testCases: [],
        status: '',
        starterCode: [],
        systemCode: [],
        metadata: {
          timeLimit: 1000,
          memoryLimit: 512,
        },
        contest: '',
        points: 0,
      });
    },
    onError: (error: Error) => {
      setSnackbarMessage(`Failed to create problem: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    },
  });

  const handleCreateClick = () => {
    setFormData({
      title: '',
      description: '',
      difficulty: 'easy',
      sampleInput: '',
      sampleOutput: '',
      testCases: [],
      status: '',
      starterCode: [],
      systemCode: [],
      metadata: {
        timeLimit: 1000,
        memoryLimit: 512,
      },
      contest: '',
      points: 0,
    });
    setCreateModalOpen(true);
  };
  const handleCreateSubmit = async () => {
    if (!user) {
      setSnackbarMessage('User is not authenticated');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      await createProblem({ userId: user._id, data: formData });
    } catch (error) {
      console.error('Failed to create problem:', error);
    }
  };

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

  const handleEditClick = (problem: Problem) => {
    console.log(problem);
    setSelectedProblem(problem);
    setFormData(problem);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!user || !selectedProblem || !selectedProblem._id) {
      return;
    }

    try {
      await AdminupdateProblem({
        problemId: selectedProblem._id,
        userId: user._id,
        data: updateformData,
      });
    } catch (error) {
      console.error('Failed to update problem:', error);
      setSnackbarMessage(`Failed to update problem: ${(error as Error).message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setEditModalOpen(false);
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
          <>
            <IconButton onClick={() => info.row.original._id && handleEditClick(info.row.original)} aria-label='edit'>
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={() => info.row.original._id && handleDelete(info.row.original._id)}
              aria-label='delete'
            >
              <DeleteIcon />
            </IconButton>
          </>
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
      <div className='flex justify-center items-center py-6'>
        <div className='flex flex-col items-center max-w-4xl w-full px-4'>
          <Typography
            variant='h4'
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: '#1976d2',
              textAlign: { xs: 'center', sm: 'center' },
            }}
          >
            Admin
          </Typography>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
            sx={{
              backgroundColor: '#10b981',
              '&:hover': { backgroundColor: '#059669' },
              color: 'white',
              padding: '8px 16px',
            }}
          >
            Create Problem
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className='flex-1 flex justify-center items-start'>
        <div className='max-w-4xl w-full px-4'>
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
        </div>
      </div>
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>Edit Problem</DialogTitle>
        <DialogContent className='space-y-4 py-4'>
          <TextField
            fullWidth
            label='Title'
            value={updateformData.title}
            onChange={(e) => setUpdateFormData({ ...updateformData, title: e.target.value })}
            variant='outlined'
          />
          <TextField
            fullWidth
            label='Description'
            multiline
            rows={4}
            value={updateformData.description}
            onChange={(e) => setUpdateFormData({ ...updateformData, description: e.target.value })}
            variant='outlined'
          />
          <TextField
            fullWidth
            select
            label='Difficulty'
            value={updateformData.difficulty}
            onChange={(e) =>
              setUpdateFormData({ ...updateformData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })
            }
            variant='outlined'
            SelectProps={{ native: true }}
          >
            <option value='easy'>Easy</option>
            <option value='medium'>Medium</option>
            <option value='hard'>Hard</option>
          </TextField>
          <TextField
            fullWidth
            label='Points'
            type='number'
            value={updateformData.points ?? ''} // Handle undefined case
            onChange={(e) => setUpdateFormData({ ...updateformData, points: Number(e.target.value) })}
            variant='outlined'
          />

          {/* Test Cases Editor */}
          <div>
            <h3 className='text-lg font-semibold mb-2'>Test Cases</h3>
            {(updateformData.testCases || []).map((testCase, index) => (
              <div key={index} className='flex space-x-2 mb-2'>
                <TextField
                  fullWidth
                  label={`Input ${index + 1}`}
                  value={testCase.input}
                  onChange={(e) => {
                    const newTestCases = [...updateformData.testCases];
                    newTestCases[index].input = e.target.value;
                    setUpdateFormData({ ...updateformData, testCases: newTestCases });
                  }}
                  variant='outlined'
                />
                <TextField
                  fullWidth
                  label={`Output ${index + 1}`}
                  value={testCase.output}
                  onChange={(e) => {
                    const newTestCases = [...updateformData.testCases];
                    newTestCases[index].output = e.target.value;
                    setUpdateFormData({ ...updateformData, testCases: newTestCases });
                  }}
                  variant='outlined'
                />
                <IconButton
                  onClick={() => {
                    const newTestCases = updateformData.testCases.filter((_, i) => i !== index);
                    setUpdateFormData({ ...updateformData, testCases: newTestCases });
                  }}
                  aria-label='delete-test-case'
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            ))}
            <Button
              onClick={() =>
                setUpdateFormData({
                  ...updateformData,
                  testCases: [...updateformData.testCases, { input: '', output: '' }],
                })
              }
              variant='outlined'
              className='mt-2'
            >
              Add Test Case
            </Button>
          </div>

          {/* Starter Code Editor */}
          <div>
            <h3 className='text-lg font-semibold mb-2'>Starter Code</h3>
            {(updateformData.starterCode || []).map((item, index) => (
              <div key={index} className='flex space-x-2 mb-2'>
                <TextField
                  label={`Language ID ${index + 1}`}
                  type='number'
                  value={item.lang_id}
                  onChange={(e) => {
                    const newStarterCode = [...updateformData.starterCode];
                    newStarterCode[index] = { ...newStarterCode[index], lang_id: Number(e.target.value) };
                    setUpdateFormData({ ...updateformData, starterCode: newStarterCode });
                  }}
                  variant='outlined'
                  className='w-1/4'
                />
                <TextField
                  fullWidth
                  multiline
                  label={`Code ${index + 1}`}
                  value={item.code}
                  onChange={(e) => {
                    const newStarterCode = [...updateformData.starterCode];
                    newStarterCode[index] = { ...newStarterCode[index], code: e.target.value };
                    setUpdateFormData({ ...updateformData, starterCode: newStarterCode });
                  }}
                  variant='outlined'
                />
                <IconButton
                  onClick={() => {
                    const newStarterCode = updateformData.starterCode.filter((_, i) => i !== index);
                    setUpdateFormData({ ...updateformData, starterCode: newStarterCode });
                  }}
                  aria-label='delete-starter-code'
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            ))}
            <Button
              onClick={() =>
                setUpdateFormData({
                  ...updateformData,
                  starterCode: [...updateformData.starterCode, { lang_id: 0, code: '' }],
                })
              }
              variant='outlined'
              className='mt-2'
            >
              Add Starter Code
            </Button>
          </div>

          {/* System Code Editor */}
          <div>
            <h3 className='text-lg font-semibold mb-2'>System Code</h3>
            {(updateformData.systemCode || []).map((item, index) => (
              <div key={index} className='flex space-x-2 mb-2'>
                <TextField
                  label={`Language ID ${index + 1}`}
                  type='number'
                  value={item.lang_id}
                  onChange={(e) => {
                    const newSystemCode = [...updateformData.systemCode];
                    newSystemCode[index] = { ...newSystemCode[index], lang_id: Number(e.target.value) };
                    setUpdateFormData({ ...updateformData, systemCode: newSystemCode });
                  }}
                  variant='outlined'
                  className='w-1/4'
                />
                <TextField
                  fullWidth
                  multiline
                  label={`Code ${index + 1}`}
                  value={item.code}
                  onChange={(e) => {
                    const newSystemCode = [...updateformData.systemCode];
                    newSystemCode[index] = { ...newSystemCode[index], code: e.target.value };
                    setUpdateFormData({ ...updateformData, systemCode: newSystemCode });
                  }}
                  variant='outlined'
                />
                <IconButton
                  onClick={() => {
                    const newSystemCode = updateformData.systemCode.filter((_, i) => i !== index);
                    setUpdateFormData({ ...updateformData, systemCode: newSystemCode });
                  }}
                  aria-label='delete-system-code'
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            ))}
            <Button
              onClick={() =>
                setUpdateFormData({
                  ...updateformData,
                  systemCode: [...updateformData.systemCode, { lang_id: 0, code: '' }],
                })
              }
              variant='outlined'
              className='mt-2'
            >
              Add System Code
            </Button>
          </div>

          {/* Metadata Editor */}
          <div>
            <h3 className='text-lg font-semibold mb-2'>Metadata</h3>
            <TextField
              fullWidth
              label='Time Limit (ms)'
              type='number'
              value={updateformData.metadata.timeLimit ?? ''} // Handle undefined
              onChange={(e) =>
                setUpdateFormData({
                  ...updateformData,
                  metadata: { ...updateformData.metadata, timeLimit: Number(e.target.value) },
                })
              }
              variant='outlined'
            />
            <TextField
              fullWidth
              label='Memory Limit (MB)'
              type='number'
              value={updateformData.metadata.memoryLimit ?? ''} // Handle undefined
              onChange={(e) =>
                setUpdateFormData({
                  ...updateformData,
                  metadata: { ...updateformData.metadata, memoryLimit: Number(e.target.value) },
                })
              }
              variant='outlined'
            />
          </div>

          <TextField
            fullWidth
            label='Contest ID'
            value={updateformData.contest ?? ''} // Handle null/undefined
            onChange={(e) => setUpdateFormData({ ...updateformData, contest: e.target.value || null })}
            variant='outlined'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)} className='text-gray-500'>
            Cancel
          </Button>
          <Button onClick={handleEditSubmit} variant='contained' className='bg-blue-500'>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>Create New Problem</DialogTitle>
        <DialogContent className='space-y-4 py-4'>
          <TextField
            fullWidth
            label='Title'
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            variant='outlined'
          />
          <TextField
            fullWidth
            label='Description'
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            variant='outlined'
          />
          <TextField
            fullWidth
            select
            label='Difficulty'
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
            variant='outlined'
            SelectProps={{ native: true }}
          >
            <option value='easy'>Easy</option>
            <option value='medium'>Medium</option>
            <option value='hard'>Hard</option>
          </TextField>
          <TextField
            fullWidth
            label='Points'
            type='number'
            value={formData.points ?? ''} // Handle undefined
            onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
            variant='outlined'
          />
          <TextField
            fullWidth
            label='Sample Input'
            multiline
            value={formData.sampleInput}
            onChange={(e) => setFormData({ ...formData, sampleInput: e.target.value })}
            variant='outlined'
          />
          <TextField
            fullWidth
            label='Sample Output'
            multiline
            value={formData.sampleOutput}
            onChange={(e) => setFormData({ ...formData, sampleOutput: e.target.value })}
            variant='outlined'
          />
          <TextField
            fullWidth
            label='Status'
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            variant='outlined'
          />
          <TextField
            fullWidth
            label='Contest ID'
            value={formData.contest ?? ''} // Handle null/undefined
            onChange={(e) => setFormData({ ...formData, contest: e.target.value || null })}
            variant='outlined'
          />

          {/* Test Cases Editor */}
          <div>
            <h3 className='text-lg font-semibold mb-2'>Test Cases</h3>
            {(formData.testCases || []).map((testCase, index) => (
              <div key={index} className='flex space-x-2 mb-2'>
                <TextField
                  fullWidth
                  label={`Input ${index + 1}`}
                  value={testCase.input}
                  onChange={(e) => {
                    const newTestCases = [...formData.testCases];
                    newTestCases[index].input = e.target.value;
                    setFormData({ ...formData, testCases: newTestCases });
                  }}
                  variant='outlined'
                />
                <TextField
                  fullWidth
                  label={`Output ${index + 1}`}
                  value={testCase.output}
                  onChange={(e) => {
                    const newTestCases = [...formData.testCases];
                    newTestCases[index].output = e.target.value;
                    setFormData({ ...formData, testCases: newTestCases });
                  }}
                  variant='outlined'
                />
                <IconButton
                  onClick={() => {
                    const newTestCases = formData.testCases.filter((_, i) => i !== index);
                    setFormData({ ...formData, testCases: newTestCases });
                  }}
                  aria-label='delete-test-case'
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            ))}
            <Button
              onClick={() =>
                setFormData({ ...formData, testCases: [...formData.testCases, { input: '', output: '' }] })
              }
              variant='outlined'
              className='mt-2'
            >
              Add Test Case
            </Button>
          </div>

          {/* Starter Code Editor */}
          <div>
            <h3 className='text-lg font-semibold mb-2'>Starter Code</h3>
            {(formData.starterCode || []).map((item, index) => (
              <div key={index} className='flex space-x-2 mb-2'>
                <TextField
                  label={`Language ID ${index + 1}`}
                  type='number'
                  value={item.lang_id}
                  onChange={(e) => {
                    const newStarterCode = [...formData.starterCode];
                    newStarterCode[index] = { ...newStarterCode[index], lang_id: Number(e.target.value) };
                    setFormData({ ...formData, starterCode: newStarterCode });
                  }}
                  variant='outlined'
                  className='w-1/4'
                />
                <TextField
                  fullWidth
                  multiline
                  label={`Code ${index + 1}`}
                  value={item.code}
                  onChange={(e) => {
                    const newStarterCode = [...formData.starterCode];
                    newStarterCode[index] = { ...newStarterCode[index], code: e.target.value };
                    setFormData({ ...formData, starterCode: newStarterCode });
                  }}
                  variant='outlined'
                />
                <IconButton
                  onClick={() => {
                    const newStarterCode = formData.starterCode.filter((_, i) => i !== index);
                    setFormData({ ...formData, starterCode: newStarterCode });
                  }}
                  aria-label='delete-starter-code'
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            ))}
            <Button
              onClick={() =>
                setFormData({
                  ...formData,
                  starterCode: [...formData.starterCode, { lang_id: 0, code: '' }],
                })
              }
              variant='outlined'
              className='mt-2'
            >
              Add Starter Code
            </Button>
          </div>

          {/* System Code Editor */}
          <div>
            <h3 className='text-lg font-semibold mb-2'>System Code</h3>
            {(formData.systemCode || []).map((item, index) => (
              <div key={index} className='flex space-x-2 mb-2'>
                <TextField
                  label={`Language ID ${index + 1}`}
                  type='number'
                  value={item.lang_id}
                  onChange={(e) => {
                    const newSystemCode = [...formData.systemCode];
                    newSystemCode[index] = { ...newSystemCode[index], lang_id: Number(e.target.value) };
                    setFormData({ ...formData, systemCode: newSystemCode });
                  }}
                  variant='outlined'
                  className='w-1/4'
                />
                <TextField
                  fullWidth
                  multiline
                  label={`Code ${index + 1}`}
                  value={item.code}
                  onChange={(e) => {
                    const newSystemCode = [...formData.systemCode];
                    newSystemCode[index] = { ...newSystemCode[index], code: e.target.value };
                    setFormData({ ...formData, systemCode: newSystemCode });
                  }}
                  variant='outlined'
                />
                <IconButton
                  onClick={() => {
                    const newSystemCode = formData.systemCode.filter((_, i) => i !== index);
                    setFormData({ ...formData, systemCode: newSystemCode });
                  }}
                  aria-label='delete-system-code'
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            ))}
            <Button
              onClick={() =>
                setFormData({
                  ...formData,
                  systemCode: [...formData.systemCode, { lang_id: 0, code: '' }],
                })
              }
              variant='outlined'
              className='mt-2'
            >
              Add System Code
            </Button>
          </div>

          {/* Metadata Editor */}
          <div>
            <h3 className='text-lg font-semibold mb-2'>Metadata</h3>
            <TextField
              fullWidth
              label='Time Limit (ms)'
              type='number'
              value={formData.metadata.timeLimit ?? ''}
              onChange={(e) =>
                setFormData({ ...formData, metadata: { ...formData.metadata, timeLimit: Number(e.target.value) } })
              }
              variant='outlined'
            />
            <TextField
              fullWidth
              label='Memory Limit (MB)'
              type='number'
              value={formData.metadata.memoryLimit ?? ''}
              onChange={(e) =>
                setFormData({ ...formData, metadata: { ...formData.metadata, memoryLimit: Number(e.target.value) } })
              }
              variant='outlined'
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateModalOpen(false)} className='text-gray-500'>
            Cancel
          </Button>
          <Button onClick={handleCreateSubmit} variant='contained' className='bg-blue-500'>
            Create
          </Button>
        </DialogActions>
      </Dialog>
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
