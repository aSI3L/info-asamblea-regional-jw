import type { Metadata } from "next"
import { ConsultasPage } from "@/components/pages/ConsultasPage"

export const metadata: Metadata = {
  title: "",
  description: '',
}

export default function Consultas() {
  return <ConsultasPage />
}
