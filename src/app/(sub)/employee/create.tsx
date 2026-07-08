import { useRouter } from 'expo-router';

import { EmployeeFormScreen } from '@/features/employee/employee-form-screen';

export default function EmployeeCreateRoute() {
  const router = useRouter();

  return <EmployeeFormScreen mode="create" onClose={() => router.replace('/employee')} />;
}
