// src/app/dashboard/departments/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { departmentsApi } from '@/lib/api-client';
import { Department } from '@/types';
import CreateDepartmentModal from '@/components/departments/CreateDepartmentModal';
import EditDepartmentModal from '@/components/departments/EditDepartmentModal';

const ITEMS_PER_PAGE = 10;

// Toast notification component
const Toast = ({
  message,
  type,
  onClose
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) => (
  <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-5 duration-300">
    <div className={`flex items-center space-x-2 px-4 py-3 rounded shadow-lg ${type === 'success'
      ? 'bg-green-600 text-white'
      : 'bg-rose-600 text-white'
      }`}>
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <XCircle className="w-5 h-5" />
      )}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-white/80 hover:text-white"
      >
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    filterDepartments();
    setCurrentPage(1);
  }, [searchQuery, departments]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data: any = await departmentsApi.getAll(true);
      setDepartments(data);
      setFilteredDepartments(data);
    } catch (error: any) {
      console.error('Failed to fetch departments:', error);
      showToast(error.message || 'Failed to fetch departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterDepartments = () => {
    let filtered = departments;

    if (searchQuery) {
      filtered = filtered.filter(
        (dept) =>
          dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dept.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDepartments(filtered);
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setShowEditModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this department? All employees must be reassigned first.')) {
      try {
        await departmentsApi.delete(id);
        showToast('Department deleted successfully', 'success');
        fetchDepartments();
      } catch (error: any) {
        showToast(error.message || 'Failed to delete department', 'error');
      }
    }
  };

  const handleToggleStatus = async (department: Department) => {
    try {
      await departmentsApi.toggle(department.id);
      showToast(
        `Department ${department.isActive ? 'deactivated' : 'activated'} successfully`,
        'success'
      );
      fetchDepartments();
    } catch (error: any) {
      showToast(error.message || 'Failed to toggle department status', 'error');
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    showToast('Department created successfully', 'success');
    fetchDepartments();
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedDepartment(null);
    showToast('Department updated successfully', 'success');
    fetchDepartments();
  };

  // Pagination
  const totalPages = Math.ceil(filteredDepartments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentDepartments = filteredDepartments.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-sm text-slate-600">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Departments</h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Manage organizational departments
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded shadow-sm border border-slate-200 p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="mt-2 text-xs text-slate-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredDepartments.length)} of {filteredDepartments.length} departments
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentDepartments.map((department) => (
          <div
            key={department.id}
            className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden hover:shadow transition-shadow"
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-2">
                  <div className="bg-blue-50 p-2 rounded">
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-slate-900">
                      {department.name}
                    </h3>
                    <p className="text-xs text-slate-500">{department.code}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleStatus(department)}
                  className={`${department.isActive
                    ? 'text-green-600 hover:text-green-700'
                    : 'text-slate-400 hover:text-slate-500'
                    }`}
                  title={department.isActive ? 'Active' : 'Inactive'}
                >
                  {department.isActive ? (
                    <ToggleRight className="w-6 h-6" />
                  ) : (
                    <ToggleLeft className="w-6 h-6" />
                  )}
                </button>
              </div>

              {/* Description */}
              {department.description && (
                <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                  {department.description}
                </p>
              )}

              {/* Manager Info */}
              {department.managerName && (
                <div className="bg-slate-50 rounded p-2 mb-3">
                  <p className="text-xs font-medium text-slate-700">
                    Manager: {department.managerName}
                  </p>
                  {department.managerEmail && (
                    <p className="text-xs text-slate-500">{department.managerEmail}</p>
                  )}
                </div>
              )}

              {/* Employee Count */}
              <div className="flex items-center space-x-1.5 mb-3">
                <Users className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-600">
                  {department.employeeCount || 0} employees
                </span>
              </div>

              {/* Status Badge */}
              <div className="mb-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${department.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-700'
                    }`}
                >
                  {department.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-3 border-t border-slate-200">
                <button
                  onClick={() => handleEdit(department)}
                  className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded text-xs font-medium hover:bg-blue-100 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(department.id)}
                  className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded text-xs font-medium hover:bg-rose-100 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {currentDepartments.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">No departments found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first department
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded shadow-sm border border-slate-200 px-4 py-3 flex items-center justify-between">
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

      {/* Modals */}
      {showCreateModal && (
        <CreateDepartmentModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {showEditModal && selectedDepartment && (
        <EditDepartmentModal
          department={selectedDepartment}
          onClose={() => {
            setShowEditModal(false);
            setSelectedDepartment(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}