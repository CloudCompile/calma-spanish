import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname
const getRepositoryName = () => {
  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository) return "";
  const segments = repository.split("/");
  if (segments.length < 2 || !segments[1]) return "";
  return segments[1];
};
// GitHub Pages builds expect GITHUB_REPOSITORY in "owner/repo" format.
const calculateBasePath = () => {
  const repositoryName = getRepositoryName();
  return process.env.GITHUB_ACTIONS && repositoryName
    ? `/${repositoryName}/`
    : "/";
};
const base = calculateBasePath();

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
});
