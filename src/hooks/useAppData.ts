import { useInfoPrincipal } from "./useInfoPrincipal";
import { useCategorias } from "./useCategorias";
import { useEffect, useMemo, useState } from "react";

export const useAppData = () => {
    const { infoPrincipal, loadingInfoPrincipal } = useInfoPrincipal();
    const { categorias, loadingCategorias } = useCategorias();
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    useEffect(() => {
        if (loadingInfoPrincipal || loadingCategorias) { return }
        if (!loadingInfoPrincipal && !loadingCategorias) {
            const hasInfoPrincipal = infoPrincipal.mainTitle !== "" && infoPrincipal.year !== 0;
            const hasCategorias = categorias.length > 0;

            if (hasInfoPrincipal && hasCategorias) {
                setIsLoading(false)
            } else {
                setIsLoading(false)
                setHasError(true)
                setErrorMessage("No se pudieron cargar los datos necesarios. Por favor, revise su conexión a internet e intente nuevamente.")
            }
        }
    }, [loadingInfoPrincipal, loadingCategorias])

    return {
        isLoading,
        hasError,
        errorMessage,
        infoPrincipal,
        categorias,
    };
};