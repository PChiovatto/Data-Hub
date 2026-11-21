import type {Metadata} from "next";
import "./pipeline.css";
export const metadata:Metadata={title:"Data Hub · Fontes e destinos",description:"Conecte fontes, selecione contas e campos, visualize os dados e configure seus destinos."};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
