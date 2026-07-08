import { useLocalSearchParams, useRouter } from 'expo-router';

import { EmployeeFormScreen } from '@/features/employee/employee-form-screen';

export default function EmployeeDetailRoute() {
  const params = useLocalSearchParams<{ employeeId?: string | string[] }>();
  const router = useRouter();
  const employeeId = Array.isArray(params.employeeId) ? params.employeeId[0] : params.employeeId;

  function handleClose() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/employee');
  }

  return (
    <EmployeeFormScreen
      employeeId={employeeId}
      mode="edit"
      onClose={handleClose}
    />
  );
}
