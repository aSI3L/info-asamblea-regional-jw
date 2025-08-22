import { z } from "zod/v4";
import { infoPrincipalFormSchema } from "@/components/pages/InfoPrincipal/components/FormInfoPrincipal";
import { Overwrite } from "@/lib/utils";

export type InfoPrincipalSchemaType = z.infer<typeof infoPrincipalFormSchema>;
export type InfoPrincipalType = { id?: string} & Overwrite<InfoPrincipalSchemaType, { year: number, imageUrl: string }>;

export interface InfoPrincipalType {
    id?: string
    mainTitle: string
    year: number
    imageUrl: string
    color: {
        primary: string
        secondary: string
        accent: string
    }
}