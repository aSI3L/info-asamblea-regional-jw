import { COLLECTIONS } from "@/constants/collections.consts";
import { GenericService } from "./generic.service";
import { infoPrincipalAdapter } from "@/adapters/info-principal.adapter";
import { categoriasAdapter } from "@/adapters/categorias.adapter";
import { edificiosAdapter } from "@/adapters/edificios.adapter";

export const infoPrincipalService = new GenericService(COLLECTIONS.INFO_PRINCIPAL, infoPrincipalAdapter)
export const categoriasService = new GenericService(COLLECTIONS.CATEGORIAS, categoriasAdapter)
export const edificiosService = new GenericService(COLLECTIONS.EDIFICIOS, edificiosAdapter)
