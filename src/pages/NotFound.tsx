import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFCF9] px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-gold" />
      </div>
      <h1 className="mb-2 font-heading text-4xl font-bold text-midnight">Página não encontrada</h1>
      <p className="mb-8 text-muted-foreground max-w-sm">
        O conteúdo que você procura não existe ou foi movido.
      </p>
      <a 
        href="/" 
        className="px-6 py-3 bg-gold text-midnight font-bold rounded-xl shadow-lg shadow-gold/20 hover:bg-gold-light transition-all"
      >
        Voltar para o início
      </a>
    </div>
  );
};

export default NotFound;
