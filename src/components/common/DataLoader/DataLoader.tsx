"use client"

import { ReactNode } from "react";
import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner";
import { useAppData } from "@/hooks/useAppData";

interface DataLoaderProps {
    children: ReactNode
}

export function DataLoader({ children }: DataLoaderProps) {
    const { isLoading, hasError, errorMessage } = useAppData();

    if (isLoading) {
        return <LoadingSpinner />
    }

    if (hasError) {
        return (
            <div className="flex justify-center items-center w-screen h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Error al cargar datos</h2>
                    <p className="text-gray-600">{errorMessage}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        )
    }

    return <>{children}</>
}