import { infoPrincipalService } from "@/services/index.generic.service";
import { InfoPrincipalType } from "@/types/info-principal.type";
import { create } from "zustand";

interface InfoPrincipalStore {
    infoPrincipal: InfoPrincipalType
    getInfoPrincipal: () => Promise<void>
}

export const useInfoPrincipalStore = create<InfoPrincipalStore>((set) => ({
    infoPrincipal: {
        mainTitle: "",
        year: 0,
        imageUrl: "",
        color: {
            primary: "",
            secondary: "",
            accent: ""
        }
    },
    getInfoPrincipal: async () => {
        const infoPrincipalResponse = await infoPrincipalService.getAll()
        if (infoPrincipalResponse && Array.isArray(infoPrincipalResponse) && infoPrincipalResponse.length > 0) {
            set(() => ({ infoPrincipal: infoPrincipalResponse[0] }))
        } else {
            console.log("Error: Get Info Principal")
        }
    },
}))
