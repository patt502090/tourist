import { flexRender } from '@tanstack/react-table';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Paper from '@mui/material/Paper';
import { Problem } from '../../../utils/types';
import TablePaginationActions from './ProblemTableActions';
import { styled } from '@mui/material/styles';
import { usethemeUtils } from '../../../context/ThemeWrapper';
import { Container, IconButton, SelectChangeEvent } from '@mui/material';
import { Table as TableType } from '@tanstack/react-table';
import DifficultyFilter from './DifficultyFilter';
import StatusFilter from './StatusFilter';
import ProblemSearch from './ProblemSearch';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';

function ProblemsTable({
  data,
  table,
  handleDifficultChange,
  difficultyFilter,
  statusFilter,
  handleStatusChange,
  searchQuery,
  handleQueryChange,
  clear,
  reset,
}: {
  data: Problem[];
  table: TableType<Problem>;
  handleDifficultChange: (event: SelectChangeEvent) => void;
  difficultyFilter: string;
  statusFilter: string;
  searchQuery: string;
  handleStatusChange: (event: SelectChangeEvent) => void;
  handleQueryChange: (queryvalue: string) => void;
  clear: () => void;
  reset: () => void;
}) {
  const { colorMode } = usethemeUtils();

  const StyledTableRow = styled(TableRow)(() => ({
    '&:nth-of-type(odd)': {
      backgroundColor: colorMode === 'dark' ? '#ffffff12' : '#f7f8fa',
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));
  const { pageSize, pageIndex } = table.getState().pagination;

  return (
    <Container maxWidth='lg' sx={{ maxHeight: '75dvh', overflowY: 'auto', scrollbarWidth: 'thin' }}>
      <div className='tw-flex tw-justify-between'>
        <div className='tw-flex'>
          <DifficultyFilter value={difficultyFilter} handleChange={handleDifficultChange}></DifficultyFilter>
          <StatusFilter value={statusFilter} handleChange={handleStatusChange}></StatusFilter>
        </div>
        <div className='tw-flex'>
          <ProblemSearch clear={clear} queryvalue={searchQuery} onChangeHandler={handleQueryChange} />
          <div className='tw-flex tw-justify-center tw-items-center'>
            <IconButton title='reset' size='small' onClick={reset}>
              <RestartAltOutlinedIcon />
            </IconButton>
          </div>
        </div>
      </div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650, maxHeight: '75dvh', overflowY: 'auto' }} aria-label='simple table'>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableCell key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <div>{flexRender(header.column.columnDef.header, header.getContext())}</div>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => {
              return (
                <StyledTableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    );
                  })}
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, { label: 'All', value: data?.length }]}
        component='div'
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={pageSize}
        page={pageIndex}
        slotProps={{
          select: {
            inputProps: { 'aria-label': 'Problems per page' },
            native: true,
          },
        }}
        onPageChange={(_, page) => {
          table.setPageIndex(page);
        }}
        onRowsPerPageChange={(e) => {
          const size = e.target.value ? Number(e.target.value) : 10;
          table.setPageSize(size);
        }}
        ActionsComponent={TablePaginationActions}
      />
    </Container>
  );
}
export default ProblemsTable;
