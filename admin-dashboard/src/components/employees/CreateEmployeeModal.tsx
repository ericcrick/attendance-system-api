// 'use client';

// import { useState } from 'react';
// import { X, Loader2 } from 'lucide-react';
// import { employeesApi } from '@/lib/api-client';
// import { Shift } from '@/types';

// interface CreateEmployeeModalProps {
//   shifts: Shift[];
//   onClose: () => void;
//   onSuccess: () => void;
// }

// export default function CreateEmployeeModal({
//   shifts,
//   onClose,
//   onSuccess,
// }: CreateEmployeeModalProps) {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [formData, setFormData] = useState({
//     employeeId: '',
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     department: '',
//     position: '',
//     rfidCardId: '',
//     pinCode: '',
//     shiftId: '',
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       await employeesApi.create(formData);
//       onSuccess();
//     } catch (err: any) {
//       setError(err.message || 'Failed to create employee');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
//           <h2 className="text-base font-semibold text-slate-900">
//             Add New Employee
//           </h2>
//           <button
//             onClick={onClose}
//             className="text-slate-400 hover:text-slate-600 transition-colors"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="p-4 space-y-3">
//           {error && (
//             <div className="p-3 bg-rose-50 border border-rose-200 rounded text-sm text-rose-800">
//               {error}
//             </div>
//           )}

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//             {/* Employee ID */}
//             <div>
//               <label className="block text-xs font-medium text-slate-700 mb-1">
//                 Employee ID *
//               </label>
//               <input
//                 type="text"
//                 name="employeeId"
//                 value={formData.employeeId}
//                 onChange={handleChange}
//                 required
//                 placeholder="EMP-001"
//                 className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
//               />
//             </div>

//             {/* Shift */}
//             <div>
//               <label className="block text-xs font-medium text-slate-700 mb-1">
//                 Shift *
//               </label>
//               <select
//                 name="shiftId"
//                 value={formData.shiftId}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
//               >
//                 <option value="">Select Shift</option>
//                 {shifts.map((shift) => (
//                   <option key={shift.id} value={shift.id}>
//                     {shift.name} ({shift.startTime} - {shift.endTime})
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* First Name */}
//             <div>
//               <label className="block text-xs font-medium text-slate-700 mb-1">
//                 First Name *
//               </label>
//               <input
//                 type="text"
//                 name="firstName"
//                 value={formData.firstName}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
//               />
//             </div>

//             {/* Last Name */}
//             <div>
//               <label className="block text-xs font-medium text-slate-700 mb-1">
//                 Last Name *
//               </label>
//               <input
//                 type="text"
//                 name="lastName"
//                 value={formData.lastName}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
//               />
//             </div>

//             {/* Email */}
//             <div>
//               <label className="block text-xs font-medium text-slate-700 mb-1">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
//               />
//             </div>

//             {/* Phone */}
//             <div>
//               <label className="block text-xs font-medium text-slate-700 mb-1">
//                 Phone
//               </label>
//               <input
//                 type="tel"
//                 name="phone"
//                 value={formData.phone}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
//               />
//             </div>

//             {/* Department */}
//             <div>
//               <label className="block text-xs font-medium text-slate-700 mb-1">
//                 Department *
//               </label>
//               <input
//                 type="text"
//                 name="department"
//                 value={formData.department}
//                 onChange={handleChange}
//                 required
//                 placeholder="e.g., Security"
//                 className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
//               />
//             </div>

//             {/* Position */}
//             <div>
//               <label className="block text-xs font-medium text-slate-700 mb-1">
//                 Position *
//               </label>
//               <input
//                 type="text"
//                 name="position"
//                 value={formData.position}
//                 onChange={handleChange}
//                 required
//                 placeholder="e.g., Security Officer"
//                 className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
//               />
//             </div>

//             {/* RFID Card */}
//             <div>
//               <label className="block text-xs font-medium text-slate-700 mb-1">
//                 RFID Card ID
//               </label>
//               <input
//                 type="text"
//                 name="rfidCardId"
//                 value={formData.rfidCardId}
//                 onChange={handleChange}
//                 placeholder="RFID-001"
//                 className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
//               />
//             </div>

//             {/* PIN Code */}
//             <div>
//               <label className="block text-xs font-medium text-slate-700 mb-1">
//                 PIN Code (4-6 digits)
//               </label>
//               <input
//                 type="text"
//                 name="pinCode"
//                 value={formData.pinCode}
//                 onChange={handleChange}
//                 placeholder="1234"
//                 maxLength={6}
//                 pattern="[0-9]*"
//                 className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
//               />
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-3 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-1.5"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="w-4 h-4 animate-spin" />
//                   <span>Creating...</span>
//                 </>
//               ) : (
//                 <span>Create Employee</span>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }






// src/components/employees/CreateEmployeeModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { employeesApi, departmentsApi } from '@/lib/api-client';
import { Shift, Department } from '@/types';

interface CreateEmployeeModalProps {
  shifts: Shift[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateEmployeeModal({
  shifts,
  onClose,
  onSuccess,
}: CreateEmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    departmentId: '',
    position: '',
    rfidCardId: '',
    pinCode: '',
    shiftId: '',
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data: any = await departmentsApi.getAll();
      setDepartments(data.filter((dept: Department) => dept?.isActive));
    } catch (error) {
      console?.error('Failed to fetch departments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // If departmentId is selected, find the department name
      let submitData = { ...formData };
      if (formData.departmentId) {
        const selectedDept = departments.find(d => d?.id === formData.departmentId);
        if (selectedDept) {
          submitData.department = selectedDept?.name;
        }
      }

      await employeesApi.create(submitData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deptId = e.target.value;
    const selectedDept = departments.find(d => d.id === deptId);

    setFormData({
      ...formData,
      departmentId: deptId,
      department: selectedDept ? selectedDept.name : '',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Add New Employee
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-sm text-rose-800">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Employee ID */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Employee ID *
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                placeholder="EMP-001"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Shift */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Shift *
              </label>
              <select
                name="shiftId"
                value={formData.shiftId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Shift</option>
                {shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name} ({shift.startTime} - {shift.endTime})
                  </option>
                ))}
              </select>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Department *
              </label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleDepartmentChange}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Position */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Position *
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                placeholder="e.g., Security Officer"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* RFID Card */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                RFID Card ID
              </label>
              <input
                type="text"
                name="rfidCardId"
                value={formData.rfidCardId}
                onChange={handleChange}
                placeholder="RFID-001"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* PIN Code */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                PIN Code (4-6 digits)
              </label>
              <input
                type="text"
                name="pinCode"
                value={formData.pinCode}
                onChange={handleChange}
                placeholder="1234"
                maxLength={6}
                pattern="[0-9]*"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Employee</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}