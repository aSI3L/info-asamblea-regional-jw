import { categoriasFormSchema } from "@/components/pages/InfoCategorias/components/FormCategorias";
import { Overwrite } from "@/lib/utils";
import { z } from "zod/v4";

export type CategoriasFormSchemaType = z.infer<typeof categoriasFormSchema>;
export type CategoriasType = { id?: string} & Overwrite<CategoriasFormSchemaType, { imageUrl: string }>;

export interface Category {
    id?: string
    title: string
    description: string
    backgroundImage: string
    href: string
}