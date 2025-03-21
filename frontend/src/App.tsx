import { RouterProvider } from 'react-router';
import router from './components/route';
import ThemeWrapper from './context/ThemeWrapper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CookiesProvider } from 'react-cookie';
import { Toaster } from 'sonner';
import { AuthContextWrapper } from './context/AuthContext';
import './App.css';
import '@fontsource/poppins'; // เพิ่มในไฟล์นี้หรือ global CSS
const queryClient = new QueryClient();
function App() {
  return (
    <CookiesProvider defaultSetOptions={{ path: '/' }}>
      <QueryClientProvider client={queryClient}>
        <AuthContextWrapper>
          <ThemeWrapper>
            {/* <ReactQueryDevtools initialIsOpen={false} position='left' /> */}
            <Toaster />

            <RouterProvider router={router}></RouterProvider>
          </ThemeWrapper>
        </AuthContextWrapper>
      </QueryClientProvider>
    </CookiesProvider>
  );
}

export default App;
