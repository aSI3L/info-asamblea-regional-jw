import { categoriasService } from "@/services/index.generic.service";
import { Category } from "@/types/category.type";
import { create } from "zustand";

interface CategoriasStore {
    categorias: Category[]
    loadingCategorias: boolean
    getCategorias: () => Promise<void>
}

export const useCategoriasStore = create<CategoriasStore>((set) => ({
    categorias: [],
    loadingCategorias: true,
    getCategorias: async () => {
        const categoriasResponse = await categoriasService.getAll();
        if (categoriasResponse) {
            set({ categorias: categoriasResponse, loadingCategorias: false });
        }
        set({ loadingCategorias: false });
    },
}))