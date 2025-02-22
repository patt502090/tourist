import axios from 'axios';
const judgeapi = axios.create({
  baseURL: import.meta.env.VITE_JUDGEAPI_BASE_URL || 'https://judge0-ce.p.rapidapi.com',
  headers: {
    'x-rapidapi-key': import.meta.env.VITE_JUDGEAPI_API_KEY || '129f8f9029msha41a8399612ae9cp10c969jsn2a453b0b7d0d',
    'x-rapidapi-host': import.meta.env.VITE_JUDGEAPI_HOST || 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json',
  },
});

export default judgeapi;
