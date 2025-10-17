//src/app/dashboard/employees/page.tsx

import EmployeesPageClient from "@/components/employees/EmployeePageClient";
import FingerprintSDKLoader from "@/components/FingerprintSDKLoader";

export default function EmployeesPage() {
  return (
    <FingerprintSDKLoader>
      <EmployeesPageClient />;
    </FingerprintSDKLoader>
  )
}