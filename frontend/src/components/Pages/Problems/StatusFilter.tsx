import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';

export default function StatusFilter({
  value,
  handleChange,
}: {
  value: string;
  handleChange: (event: SelectChangeEvent) => void;
}) {
  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size='small'>
      <InputLabel id='status-select-small-label'>Status</InputLabel>
      <Select
        labelId='status-select-small-label'
        id='demo-select-small'
        value={value}
        label='Status'
        onChange={handleChange}
      >
        <MenuItem value='all'>All</MenuItem>
        <MenuItem value='todo'>Todo</MenuItem>
        <MenuItem value='solved'>Solved</MenuItem>
        <MenuItem value='attempted'>Attempted</MenuItem>
      </Select>
    </FormControl>
  );
}
