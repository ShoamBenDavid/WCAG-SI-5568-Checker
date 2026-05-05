import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { TranslationProvider } from "./hooks/useTranslation";

const chromeApi = (globalThis as any).chrome;
const isExtensionPopup = Boolean(chromeApi?.runtime?.id);

if (isExtensionPopup) {
  document.body.classList.add("extension-popup");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TranslationProvider>
      <App />
    </TranslationProvider>
  </StrictMode>
);
