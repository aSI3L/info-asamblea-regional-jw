"use client";

import { useCategoriasStore } from "@/stores/categorias.store";
import { useEffect } from "react";

export const useCategorias = () => {
    const categorias = useCategoriasStore(state => state.categorias);
    const loadingCategorias = useCategoriasStore(state => state.loadingCategorias);
    const getCategorias = useCategoriasStore(state => state.getCategorias);

    useEffect(() => {
        void getCategorias();
    }, []);

    useEffect(() => {
        console.log(categorias)
    }, [categorias]);
    return { categorias, loadingCategorias };
}