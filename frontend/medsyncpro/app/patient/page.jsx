"use client";
import PatientProfilePage from "./PatientProfilePage";
import RouteGuard from "../components/RouteGuard";

export default function PatientPage() {
    return (
        <RouteGuard allowedRoles={["PATIENT"]}>
            <PatientProfilePage />
        </RouteGuard>
    );
}
