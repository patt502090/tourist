import { Button } from "antd";
import UserLayout from "./components/UserLayout";

export default function App() {
  return (
    <UserLayout>
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-500 mb-4">Hello Tailwind + AntD!</h1>
      <Button type="primary" className="!bg-green-500 !border-green-500 hover:!bg-green-600">
        กดเลย!
      </Button>
    </div>
    </UserLayout>
  );
}
