


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
    ChevronLeft,
    ChevronRight,
    Fingerprint,
} from 'lucide-react';
import { employeesApi, shiftsApi } from '@/lib/api-client';
import { Employee, Shift } from '@/types';
import CreateEmployeeModal from '@/components/employees/CreateEmployeeModal';
import EditEmployeeModal from '@/components/employees/EditEmployeeModal';
import FaceEnrollmentModal from '@/components/employees/FaceEnrollmentModal';
import FingerprintEnrollmentModal from './FingerprintEnrollmentModal';

const ITEMS_PER_PAGE = 10;

export default function EmployeesPageClient() {
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
    const [currentPage, setCurrentPage] = useState(1);

    const [showFingerprintEnrollModal, setShowFingerprintEnrollModal] = useState(false);
    const [fingerprintEnrollEmployee, setFingerprintEnrollEmployee] = useState<Employee | null>(null);


    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterEmployees();
        setCurrentPage(1); // Reset to first page when filters change
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

    const handleEnrollFingerprint = (employee: Employee) => {
        setFingerprintEnrollEmployee(employee);
        setShowFingerprintEnrollModal(true);
    };

    const filterEmployees = () => {
        let filtered = employees;

        if (searchQuery) {
            filtered = filtered.filter(
                (emp) =>
                    (emp.fullName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                    (emp.employeeId?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                    (emp.department?.toLowerCase() || '').includes(searchQuery.toLowerCase())
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

    // Pagination calculations
    const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-3 text-sm text-slate-600">Loading employees...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Employees</h2>
                    <p className="text-sm text-slate-600 mt-0.5">
                        Manage employee records and authentication methods
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Employee</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded shadow-sm border border-slate-200 p-3">
                <div className="flex flex-col lg:flex-row gap-3">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, ID, or department..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="sm:w-48">
                        <div className="relative">
                            <Filter className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="SUSPENDED">Suspended</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mt-2 text-xs text-slate-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} employees
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                                    Employee
                                </th>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                                    Shift
                                </th>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                                    Auth Methods
                                </th>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {currentEmployees.length > 0 ? (
                                currentEmployees.map((employee) => (
                                    <tr key={employee.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-slate-900">
                                                    {employee.fullName}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {employee.employeeId}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div>
                                                <div className="text-xs text-slate-900">
                                                    {employee.department}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {employee.position}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                                {employee.shift.name}
                                            </span>
                                        </td>
                                        {/* <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center space-x-1.5">
                                                {employee.rfidCardId && (
                                                    <span className="inline-flex items-center text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                                        <CreditCard className="w-3 h-3 mr-0.5" />
                                                        RFID
                                                    </span>
                                                )}
                                                {employee.pinCode && (
                                                    <span className="inline-flex items-center text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                                        <Hash className="w-3 h-3 mr-0.5" />
                                                        PIN
                                                    </span>
                                                )}
                                                {employee.faceEncoding && (
                                                    <span className="inline-flex items-center text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                                        <Camera className="w-3 h-3 mr-0.5" />
                                                        Face
                                                    </span>
                                                )}
                                            </div>
                                        </td> */}


                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center space-x-1.5">
                                                {employee.rfidCardId && (
                                                    <span className="inline-flex items-center text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                                        <CreditCard className="w-3 h-3 mr-0.5" />
                                                        RFID
                                                    </span>
                                                )}
                                                {employee.pinCode && (
                                                    <span className="inline-flex items-center text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                                        <Hash className="w-3 h-3 mr-0.5" />
                                                        PIN
                                                    </span>
                                                )}
                                                {employee.faceEncoding && (
                                                    <span className="inline-flex items-center text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                                        <Camera className="w-3 h-3 mr-0.5" />
                                                        Face
                                                    </span>
                                                )}
                                                {employee.fingerprintTemplate && (
                                                    <span className="inline-flex items-center text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                                                        <Fingerprint className="w-3 h-3 mr-0.5" />
                                                        Print
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${employee.status === 'ACTIVE'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-rose-100 text-rose-700'
                                                    }`}
                                            >
                                                {employee.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-medium">
                                            <div className="flex items-center justify-end space-x-1.5">
                                                <button
                                                    onClick={() => handleEdit(employee)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEnrollFace(employee)}
                                                    className="text-slate-600 hover:text-slate-900"
                                                    title="Enroll Face"
                                                >
                                                    <Camera className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEnrollFingerprint(employee)}
                                                    className="text-purple-600 hover:text-purple-900"
                                                    title="Enroll Fingerprint"
                                                >
                                                    <Fingerprint className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(employee)}
                                                    className={`${employee.status === 'ACTIVE'
                                                        ? 'text-rose-600 hover:text-rose-900'
                                                        : 'text-green-600 hover:text-green-900'
                                                        }`}
                                                    title={
                                                        employee.status === 'ACTIVE'
                                                            ? 'Deactivate'
                                                            : 'Activate'
                                                    }
                                                >
                                                    {employee.status === 'ACTIVE' ? (
                                                        <XCircle className="w-4 h-4" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(employee.id)}
                                                    className="text-rose-600 hover:text-rose-900"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-8 text-center text-sm text-slate-500"
                                    >
                                        No employees found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                        <div className="text-xs text-slate-600">
                            Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-1.5 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-slate-600" />
                            </button>

                            {/* Page numbers */}
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => goToPage(pageNum)}
                                        className={`px-2.5 py-1.5 text-xs font-medium rounded transition-colors ${currentPage === pageNum
                                            ? 'bg-blue-600 text-white'
                                            : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-1.5 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-slate-600" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
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

            {showFingerprintEnrollModal && fingerprintEnrollEmployee && (
                <FingerprintEnrollmentModal
                    employee={fingerprintEnrollEmployee}
                    onClose={() => {
                        setShowFingerprintEnrollModal(false);
                        setFingerprintEnrollEmployee(null);
                    }}
                    onSuccess={() => {
                        setShowFingerprintEnrollModal(false);
                        setFingerprintEnrollEmployee(null);
                        fetchData();
                    }}
                />
            )}
        </div>
    );
}