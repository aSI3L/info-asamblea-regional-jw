import { InfoPrincipalType } from "@/types/info-principal.type"

export const infoPrincipalAdapter = (infoPrincipal: any): InfoPrincipalType => ({
    id: infoPrincipal.id,
    mainTitle: infoPrincipal.mainTitle,
    year: infoPrincipal.year,
    imageUrl: infoPrincipal.imageUrl,
    color: infoPrincipal.color
})