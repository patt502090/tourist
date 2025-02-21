import axios from 'axios';
const judgeapi = axios.create({
  baseURL: import.meta.env.VITE_JUDGEAPI_BASE_URL,
  headers: {
    'x-rapidapi-key': import.meta.env.VITE_JUDGEAPI_API_KEY,
    'x-rapidapi-host': import.meta.env.VITE_JUDGEAPI_HOST,
    'Content-Type': 'application/json',
  },
});

export default judgeapi;
