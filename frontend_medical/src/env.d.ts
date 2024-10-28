/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // Agrega aquí otras variables de ambiente si las necesitas
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
