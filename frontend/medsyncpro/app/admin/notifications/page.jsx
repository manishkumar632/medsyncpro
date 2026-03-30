"use client";
import React from "react";
import { useNotifications } from "@/app/context/NotificationContext";
import { Bell, CheckCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
    const { notifications, markAsRead } = useNotifications();
    const router = useRouter();

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        if (notification.type === "VERIFICATION_REQUEST" && notification.referenceId) {
            router.push(`/admin/verifications/details?id=${notification.referenceId}`);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Bell className="text-teal-600" />
                    Notifications
                </h1>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                        <Bell className="w-12 h-12 text-gray-300 mb-4" />
                        <p>No new notifications at the moment.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {notifications.map((notif) => (
                            <li
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`p-5 hover:bg-gray-50 cursor-pointer transition-colors duration-200 flex items-start gap-4 ${!notif.isRead ? 'bg-teal-50/30' : ''}`}
                            >
                                <div className="mt-1">
                                    {notif.type === "VERIFICATION_REQUEST" ? (
                                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                                            <Clock size={20} />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center">
                                            <Bell size={20} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className={`text-base ${!notif.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                            {notif.title}
                                        </h3>
                                        <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                                            {new Date(notif.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className={`mt-1 text-sm ${!notif.isRead ? 'text-gray-800' : 'text-gray-500'}`}>
                                        {notif.message}
                                    </p>
                                    {!notif.isRead && (
                                        <div className="mt-3">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                                                New
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
