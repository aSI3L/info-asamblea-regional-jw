import { Category } from "@/types/category.type";

export const categoriasAdapter = (categoria: any): Category => ({
    id: categoria.id,
    title: categoria.name,
    description: categoria.description,
    backgroundImage: categoria.imageUrl,
    href: categoria.href
})