import { FC } from 'react';
import Footer from './Footer';
import Navbar from './Navbar';
interface LayOutProps {
  children: React.ReactNode;
  className?: string;
  showFooter?: boolean;
  problemSubmitHandler?: () => void;
  problemExecuteHandler?: () => void;
  executionLoading?: boolean;
  submitionLoading?: boolean;
}
const Layout: FC<LayOutProps> = ({
  children,
  className,
  showFooter = true,
  problemSubmitHandler = () => {},
  problemExecuteHandler = () => {},
  executionLoading = false,
  submitionLoading = false,
}) => {
  return (
    <>
      <Navbar
        executionLoading={executionLoading}
        submitionLoading={submitionLoading}
        problemExecuteHandler={problemExecuteHandler}
        problemSubmitHandler={problemSubmitHandler}
      ></Navbar>
      <main className={`${className ?? ''} tw-mx-2`}>{children}</main>
      {showFooter && <Footer />}
    </>
  );
};
export default Layout;
