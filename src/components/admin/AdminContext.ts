import { createContext, useContext } from "react";

export interface UploadAssetFn {
  (file: File, folder?: string): Promise<{ ok: true; path: string; publicUrl: string }>;
}

interface AdminCtx {
  uploadAsset: UploadAssetFn;
  /** true se o usuário está autenticado e o backend está disponível para uploads reais */
  uploadEnabled: boolean;
  updateSiteConfig?: (config: any) => void;
}

export const AdminContext = createContext<AdminCtx | null>(null);

export function useAdminContext(): AdminCtx | null {
  return useContext(AdminContext);
}
