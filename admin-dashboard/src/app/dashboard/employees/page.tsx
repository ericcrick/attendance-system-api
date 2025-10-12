// 'use client';



// import { useEffect, useState } from 'react';
// import {
//     Plus,
//     Search,
//     Edit,
//     Trash2,
//     CheckCircle,
//     XCircle,
//     CreditCard,
//     Hash,
//     Filter,
//     Camera,
// } from 'lucide-react';
// import { employeesApi, shiftsApi } from '@/lib/api-client';
// import { Employee, Shift } from '@/types';
// import CreateEmployeeModal from '@/components/employees/CreateEmployeeModal';
// import EditEmployeeModal from '@/components/employees/EditEmployeeModal';
// import FaceEnrollmentModal from '@/components/employees/FaceEnrollmentModal';

// export default function EmployeesPage() {
//     const [employees, setEmployees] = useState<Employee[]>([]);
//     const [shifts, setShifts] = useState<Shift[]>([]);
//     const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [statusFilter, setStatusFilter] = useState<string>('all');
//     const [loading, setLoading] = useState(true);
//     const [showCreateModal, setShowCreateModal] = useState(false);
//     const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
//     const [showFaceEnrollModal, setShowFaceEnrollModal] = useState(false);
//     const [faceEnrollEmployee, setFaceEnrollEmployee] = useState<Employee | null>(null);
//     const [showEditModal, setShowEditModal] = useState(false);

//     useEffect(() => {
//         fetchData();
//     }, []);

//     useEffect(() => {
//         filterEmployees();
//     }, [searchQuery, statusFilter, employees]);

//     const fetchData = async () => {
//         try {
//             const [employeesData, shiftsData]: any = await Promise.all([
//                 employeesApi.getAll(true),
//                 shiftsApi.getAll(),
//             ]);
//             setEmployees(employeesData);
//             setShifts(shiftsData);
//         } catch (error) {
//             console.error('Failed to fetch data:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const filterEmployees = () => {
//         let filtered = employees;

//         // Search filter
//         if (searchQuery) {
//             filtered = filtered.filter(
//                 (emp) =>
//                     emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                     emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                     emp.department.toLowerCase().includes(searchQuery.toLowerCase())
//             );
//         }

//         // Status filter
//         if (statusFilter !== 'all') {
//             filtered = filtered.filter((emp) => emp.status === statusFilter);
//         }

//         setFilteredEmployees(filtered);
//     };

//     const handleEdit = (employee: Employee) => {
//         setSelectedEmployee(employee);
//         setShowEditModal(true);
//     };

//     const handleDelete = async (id: string) => {
//         if (confirm('Are you sure you want to delete this employee?')) {
//             try {
//                 await employeesApi.delete(id);
//                 fetchData();
//             } catch (error: any) {
//                 alert(error.message || 'Failed to delete employee');
//             }
//         }
//     };

//     const handleToggleStatus = async (employee: Employee) => {
//         try {
//             if (employee.status === 'ACTIVE') {
//                 await employeesApi.deactivate(employee.id);
//             } else {
//                 await employeesApi.activate(employee.id);
//             }
//             fetchData();
//         } catch (error: any) {
//             alert(error.message || 'Failed to update employee status');
//         }
//     };

//     const handleEnrollFace = (employee: Employee) => {
//         setFaceEnrollEmployee(employee);
//         setShowFaceEnrollModal(true);
//     };

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center h-64">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//                     <p className="mt-4 text-gray-600">Loading employees...</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             {/* Header */}
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                 <div>
//                     <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
//                     <p className="text-gray-600 mt-1">
//                         Manage employee records and authentication methods
//                     </p>
//                 </div>
//                 <button
//                     onClick={() => setShowCreateModal(true)}
//                     className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
//                 >
//                     <Plus className="w-5 h-5" />
//                     <span>Add Employee</span>
//                 </button>
//             </div>

//             {/* Filters */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
//                 <div className="flex flex-col lg:flex-row gap-4">
//                     {/* Search */}
//                     <div className="flex-1">
//                         <div className="relative">
//                             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                             <input
//                                 type="text"
//                                 placeholder="Search by name, ID, or department..."
//                                 value={searchQuery}
//                                 onChange={(e) => setSearchQuery(e.target.value)}
//                                 className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
//                             />
//                         </div>
//                     </div>

//                     {/* Status Filter */}
//                     <div className="sm:w-48">
//                         <div className="relative">
//                             <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                             <select
//                                 value={statusFilter}
//                                 onChange={(e) => setStatusFilter(e.target.value)}
//                                 className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none appearance-none bg-white"
//                             >
//                                 <option value="all">All Status</option>
//                                 <option value="ACTIVE">Active</option>
//                                 <option value="INACTIVE">Inactive</option>
//                                 <option value="SUSPENDED">Suspended</option>
//                             </select>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Results count */}
//                 <div className="mt-3 text-sm text-gray-600">
//                     Showing {filteredEmployees.length} of {employees.length} employees
//                 </div>
//             </div>

//             {/* Employees Table */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//                 <div className="overflow-x-auto">
//                     <table className="w-full">
//                         <thead className="bg-gray-50 border-b border-gray-200">
//                             <tr>
//                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                     Employee
//                                 </th>
//                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                     Department
//                                 </th>
//                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                     Shift
//                                 </th>
//                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                     Auth Methods
//                                 </th>
//                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                     Status
//                                 </th>
//                                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                     Actions
//                                 </th>
//                             </tr>
//                         </thead>
//                         <tbody className="bg-white divide-y divide-gray-200">
//                             {filteredEmployees.length > 0 ? (
//                                 filteredEmployees.map((employee) => (
//                                     <tr key={employee.id} className="hover:bg-gray-50">
//                                         <td className="px-6 py-4 whitespace-nowrap">
//                                             <div>
//                                                 <div className="font-medium text-gray-900">
//                                                     {employee.fullName}
//                                                 </div>
//                                                 <div className="text-sm text-gray-500">
//                                                     {employee.employeeId}
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4 whitespace-nowrap">
//                                             <div>
//                                                 <div className="text-sm text-gray-900">
//                                                     {employee.department}
//                                                 </div>
//                                                 <div className="text-sm text-gray-500">
//                                                     {employee.position}
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4 whitespace-nowrap">
//                                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
//                                                 {employee.shift.name}
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4 whitespace-nowrap">
//                                             <div className="flex items-center space-x-2">
//                                                 {employee.rfidCardId && (
//                                                     <span className="inline-flex items-center text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
//                                                         <CreditCard className="w-3 h-3 mr-1" />
//                                                         RFID
//                                                     </span>
//                                                 )}
//                                                 {employee.pinCode && (
//                                                     <span className="inline-flex items-center text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
//                                                         <Hash className="w-3 h-3 mr-1" />
//                                                         PIN
//                                                     </span>
//                                                 )}
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4 whitespace-nowrap">
//                                             <span
//                                                 className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.status === 'ACTIVE'
//                                                     ? 'bg-green-100 text-green-800'
//                                                     : 'bg-red-100 text-red-800'
//                                                     }`}
//                                             >
//                                                 {employee.status}
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                                             <div className="flex items-center justify-end space-x-2">
//                                                 <button
//                                                     onClick={() => handleEdit(employee)}
//                                                     className="text-blue-600 hover:text-blue-900"
//                                                     title="Edit"
//                                                 >
//                                                     <Edit className="w-5 h-5" />
//                                                 </button>
//                                                 <button
//                                                     onClick={() => handleEnrollFace(employee)}
//                                                     className="text-purple-600 hover:text-purple-900"
//                                                     title="Enroll Face"
//                                                 >
//                                                     <Camera className="w-5 h-5" />
//                                                 </button>
//                                                 <button
//                                                     onClick={() => handleToggleStatus(employee)}
//                                                     className={`${employee.status === 'ACTIVE'
//                                                         ? 'text-red-600 hover:text-red-900'
//                                                         : 'text-green-600 hover:text-green-900'
//                                                         }`}
//                                                     title={
//                                                         employee.status === 'ACTIVE'
//                                                             ? 'Deactivate'
//                                                             : 'Activate'
//                                                     }
//                                                 >
//                                                     {employee.status === 'ACTIVE' ? (
//                                                         <XCircle className="w-5 h-5" />
//                                                     ) : (
//                                                         <CheckCircle className="w-5 h-5" />
//                                                     )}
//                                                 </button>
//                                                 <button
//                                                     onClick={() => handleDelete(employee.id)}
//                                                     className="text-red-600 hover:text-red-900"
//                                                     title="Delete"
//                                                 >
//                                                     <Trash2 className="w-5 h-5" />
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))
//                             ) : (
//                                 <tr>
//                                     <td
//                                         colSpan={6}
//                                         className="px-6 py-12 text-center text-gray-500"
//                                     >
//                                         No employees found
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* Modals */}
//             {showCreateModal && (
//                 <CreateEmployeeModal
//                     shifts={shifts}
//                     onClose={() => setShowCreateModal(false)}
//                     onSuccess={() => {
//                         setShowCreateModal(false);
//                         fetchData();
//                     }}
//                 />
//             )}

//             {showEditModal && selectedEmployee && (
//                 <EditEmployeeModal
//                     employee={selectedEmployee}
//                     shifts={shifts}
//                     onClose={() => {
//                         setShowEditModal(false);
//                         setSelectedEmployee(null);
//                     }}
//                     onSuccess={() => {
//                         setShowEditModal(false);
//                         setSelectedEmployee(null);
//                         fetchData();
//                     }}
//                 />
//             )}

//             {showFaceEnrollModal && faceEnrollEmployee && (
//                 <FaceEnrollmentModal
//                     employee={faceEnrollEmployee}
//                     onClose={() => {
//                         setShowFaceEnrollModal(false);
//                         setFaceEnrollEmployee(null);
//                     }}
//                     onSuccess={() => {
//                         setShowFaceEnrollModal(false);
//                         setFaceEnrollEmployee(null);
//                         fetchData();
//                     }}
//                 />
//             )}
//         </div>
//     );
// }








// File: src/app/dashboard/employees/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    CreditCard,
    Hash,
    Filter,
    Camera,
} from 'lucide-react';
import { employeesApi, shiftsApi } from '@/lib/api-client';
import { Employee, Shift } from '@/types';
import CreateEmployeeModal from '@/components/employees/CreateEmployeeModal';
import EditEmployeeModal from '@/components/employees/EditEmployeeModal';
import FaceEnrollmentModal from '@/components/employees/FaceEnrollmentModal';

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [showFaceEnrollModal, setShowFaceEnrollModal] = useState(false);
    const [faceEnrollEmployee, setFaceEnrollEmployee] = useState<Employee | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterEmployees();
    }, [searchQuery, statusFilter, employees]);

    const fetchData = async () => {
        try {
            const [employeesData, shiftsData]: any = await Promise.all([
                employeesApi.getAll(true),
                shiftsApi.getAll(),
            ]);
            setEmployees(employeesData);
            setShifts(shiftsData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterEmployees = () => {
        let filtered = employees;

        if (searchQuery) {
            filtered = filtered.filter(
                (emp) =>
                    emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((emp) => emp.status === statusFilter);
        }

        setFilteredEmployees(filtered);
    };

    const handleEdit = (employee: Employee) => {
        setSelectedEmployee(employee);
        setShowEditModal(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this employee?')) {
            try {
                await employeesApi.delete(id);
                fetchData();
            } catch (error: any) {
                alert(error.message || 'Failed to delete employee');
            }
        }
    };

    const handleToggleStatus = async (employee: Employee) => {
        try {
            if (employee.status === 'ACTIVE') {
                await employeesApi.deactivate(employee.id);
            } else {
                await employeesApi.activate(employee.id);
            }
            fetchData();
        } catch (error: any) {
            alert(error.message || 'Failed to update employee status');
        }
    };

    const handleEnrollFace = (employee: Employee) => {
        setFaceEnrollEmployee(employee);
        setShowFaceEnrollModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading employees...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
                    <p className="text-gray-600 mt-1">
                        Manage employee records and authentication methods
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Employee</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, ID, or department..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                            />
                        </div>
                    </div>

                    <div className="sm:w-48">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none appearance-none bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="SUSPENDED">Suspended</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mt-3 text-sm text-gray-600">
                    Showing {filteredEmployees.length} of {employees.length} employees
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Employee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Shift
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Auth Methods
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map((employee) => (
                                    <tr key={employee.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {employee.fullName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {employee.employeeId}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm text-gray-900">
                                                    {employee.department}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {employee.position}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {employee.shift.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                {employee.rfidCardId && (
                                                    <span className="inline-flex items-center text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                        <CreditCard className="w-3 h-3 mr-1" />
                                                        RFID
                                                    </span>
                                                )}
                                                {employee.pinCode && (
                                                    <span className="inline-flex items-center text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                                        <Hash className="w-3 h-3 mr-1" />
                                                        PIN
                                                    </span>
                                                )}
                                                {employee.faceEncoding && (
                                                    <span className="inline-flex items-center text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                                        <Camera className="w-3 h-3 mr-1" />
                                                        Face
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.status === 'ACTIVE'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {employee.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEdit(employee)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleEnrollFace(employee)}
                                                    className="text-purple-600 hover:text-purple-900"
                                                    title="Enroll Face"
                                                >
                                                    <Camera className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(employee)}
                                                    className={`${employee.status === 'ACTIVE'
                                                        ? 'text-red-600 hover:text-red-900'
                                                        : 'text-green-600 hover:text-green-900'
                                                        }`}
                                                    title={
                                                        employee.status === 'ACTIVE'
                                                            ? 'Deactivate'
                                                            : 'Activate'
                                                    }
                                                >
                                                    {employee.status === 'ACTIVE' ? (
                                                        <XCircle className="w-5 h-5" />
                                                    ) : (
                                                        <CheckCircle className="w-5 h-5" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(employee.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-12 text-center text-gray-500"
                                    >
                                        No employees found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showCreateModal && (
                <CreateEmployeeModal
                    shifts={shifts}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchData();
                    }}
                />
            )}

            {showEditModal && selectedEmployee && (
                <EditEmployeeModal
                    employee={selectedEmployee}
                    shifts={shifts}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedEmployee(null);
                    }}
                    onSuccess={() => {
                        setShowEditModal(false);
                        setSelectedEmployee(null);
                        fetchData();
                    }}
                />
            )}

            {showFaceEnrollModal && faceEnrollEmployee && (
                <FaceEnrollmentModal
                    employee={faceEnrollEmployee}
                    onClose={() => {
                        setShowFaceEnrollModal(false);
                        setFaceEnrollEmployee(null);
                    }}
                    onSuccess={() => {
                        setShowFaceEnrollModal(false);
                        setFaceEnrollEmployee(null);
                        fetchData();
                    }}
                />
            )}
        </div>
    );
}