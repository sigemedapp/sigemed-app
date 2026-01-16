import React from 'react';
import { EquipmentStatus } from './layout/types';

export const EquipmentStatusBadge: React.FC<{ status: EquipmentStatus }> = ({ status }) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    const statusClasses: Record<EquipmentStatus, string> = {
        [EquipmentStatus.OPERATIONAL]: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
        [EquipmentStatus.IN_MAINTENANCE]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
        [EquipmentStatus.OUT_OF_SERVICE]: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
        [EquipmentStatus.FAILURE_REPORTED]: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
        [EquipmentStatus.DONATION]: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300",
        // F-IBM-05 / F-IBM-10 Statuses
        [EquipmentStatus.LOAN]: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
        [EquipmentStatus.RETURN]: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
        [EquipmentStatus.DIAGNOSIS]: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300",
        [EquipmentStatus.PREVENTIVE]: "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300",
        [EquipmentStatus.CORRECTIVE]: "bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300",
        [EquipmentStatus.OTHER]: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};
