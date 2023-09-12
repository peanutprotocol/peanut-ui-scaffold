"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { goerli, polygon } from "wagmi/chains";
import { useEffect, useState } from "react";
const inter = Inter({ subsets: ["latin"] });

//Add the needed chains
const chains = [polygon, goerli];

//Make sure you have a .env file with a WC_PROJECT_ID
const projectId = process.env.WC_PROJECT_ID ?? "";

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});

const ethereumClient = new EthereumClient(wagmiConfig, chains);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  return (
    <html lang="en">
      <body className={inter.className}>
        {ready && <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>}
        <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
      </body>
    </html>
  );
}
