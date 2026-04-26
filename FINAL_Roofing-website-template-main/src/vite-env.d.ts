/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BRAND_CONFIG_JSON?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
