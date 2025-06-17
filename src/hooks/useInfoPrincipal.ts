import { useInfoPrincipalStore } from "@/stores/info-principal.store"
import { useEffect } from "react"

export const useInfoPrincipal = () => {
    const infoPrincipal = useInfoPrincipalStore(state => state.infoPrincipal)
    const getInfoPrincipal = useInfoPrincipalStore(state => state.getInfoPrincipal)

    useEffect(() => {
        void getInfoPrincipal()
    }, [])

    useEffect(() => {
        if (infoPrincipal.color.primary !== document.documentElement.style.getPropertyValue('--primary-color')){
            document.documentElement.style.setProperty('--primary-color', infoPrincipal.color.primary)
            document.documentElement.style.setProperty('--secondary-color', infoPrincipal.color.secondary)
            document.documentElement.style.setProperty('--accent-color', infoPrincipal.color.accent)
        }
    }, [infoPrincipal])

    return { infoPrincipal }
}