"use client";
import DoctorProfileClient from "./DoctorProfileClient";
import RouteGuard from "../../../components/RouteGuard";

export default function DoctorProfilePage() {
    return (
        <RouteGuard allowedRoles={["PATIENT"]}>
            <DoctorProfileClient />
        </RouteGuard>
    );
}