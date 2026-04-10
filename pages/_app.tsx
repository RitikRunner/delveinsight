import type { AppProps } from "next/app";

import "@/app/globals.css";
import ThemeProvider from "@/components/theme-provider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
