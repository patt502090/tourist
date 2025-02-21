# LeetCode Clone Frontend

A feature-rich LeetCode clone designed to provide a seamless coding and problem-solving experience for developers. This project mimics the LeetCode UI and functionality with added enhancements to improve usability and performance.

## Features

- **Dynamic Problem Solving**: Responsive interface for solving coding problems with real-time feedback.
- **Shimmer Loading**: Smooth loading animations for a polished user experience.
- **Resizable Code Editor**: Powered by Monaco Editor, allowing you to customize your coding space.
- **Cookie-based Authentication**: Secure and persistent user sessions.
- **Judge0 API Integration**: Fast and reliable code execution support for multiple programming languages.
- **Dark/Light Mode**: Tailored for all-day coding sessions.
- **Real-time Updates**: Pooling mechanisms for fetching results dynamically.
- **Debouncing for Inputs**: Enhanced performance for search and filters.
- **Material UI and Tailwind CSS**: Beautiful and responsive UI components.
- **Indexed DB**: Persistent Storage for storing the user's code changes.

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file:

`VITE_API_BASE_URL` - Backend API URL for the application.

`VITE_JUDGEAPI_BASE_URL` - URL for the Judge0 API service.

`VITE_JUDGEAPI_API_KEY` - Judge0 API Key.

`VITE_JUDGEAPI_HOST` - Judge0 Host name.

## Tech Stack

**Client**: React, Zustand, TailwindCSS, Material UI, TanStack Query, TanStack Table, Monaco Editor.  
**Server**: NestJS, MongoDB, TypeScript (referenced in the backend repository).

## Run Locally

Clone the project

```bash
  git clone https://github.com/kdj309/leetcode-clone
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev
```


## Demo
[Live Application Link](https://leetcode-clone-liard.vercel.app/)
