import { createContext, useContext, useEffect, useState } from "react";
import { normalizeCatalog } from "../lib/comics.js";

// status: "loading" | "ready" | "error"
const CatalogContext = createContext({ status: "loading", catalog: null, error: null });

export function CatalogProvider({ children }) {
  const [state, setState] = useState({ status: "loading", catalog: null, error: null });

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/comics.json", { cache: "no-cache", signal: controller.signal });
        if (!response.ok) throw new Error(`comics.json returned ${response.status}`);
        const catalog = normalizeCatalog(await response.json());
        setState({ status: "ready", catalog, error: null });
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Could not load comics.json", error);
        setState({ status: "error", catalog: null, error });
      }
    }
    load();
    return () => controller.abort();
  }, []);

  return <CatalogContext.Provider value={state}>{children}</CatalogContext.Provider>;
}

// eslint-disable-next-line react/only-export-components
export function useCatalog() {
  return useContext(CatalogContext);
}
