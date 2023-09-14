"use client";

import { Web3Button, useWeb3Modal } from "@web3modal/react";
import { getWalletClient } from "@wagmi/core";
import { WalletClient, useAccount } from "wagmi";
import { providers } from "ethers";
import { useState } from "react";
import peanut from "@squirrel-labs/peanut-sdk";

console.log(peanut.version);

export default function Home() {
  const { isConnected, address } = useAccount();
  const { open } = useWeb3Modal();
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [link, setLink] = useState<string | undefined>(undefined);

  function getRandomString(length: number) {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result_str = "";
    for (let i = 0; i < length; i++) {
      result_str += chars[Math.floor(Math.random() * chars.length)];
    }
    return result_str;
  }

  const chainList = {
    "137": {
      name: "Polygon",
      chain: "POLYGON",
    },
    "5": {
      name: "Goerli",
      chain: "ETH",
    },
  };
  const tokenList = {
    "137": {
      name: "MATIC",
      tokenType: 0,
      address: "0x0000000000000000000000000000000000000000",
    },
    "5": {
      name: "Goerli ETH",
      tokenType: 0,
      address: "0x0000000000000000000000000000000000000000",
    },
  };
  function walletClientToSigner(
    walletClient: WalletClient
  ): providers.JsonRpcSigner {
    const { account, chain, transport } = walletClient;
    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts?.ensRegistry?.address,
    };
    const provider = new providers.Web3Provider(transport, network);
    const signer = provider.getSigner(account.address);
    return signer;
  }

  const getWalletClientAndUpdateSigner = async ({
    chainId,
  }: {
    chainId: number;
  }): Promise<providers.JsonRpcSigner> => {
    const walletClient = await getWalletClient({ chainId: Number(chainId) });
    if (!walletClient) {
      throw new Error("Failed to get wallet client");
    }
    const signer = walletClientToSigner(walletClient);
    return signer;
  };

  const _createLink = async () => {
    const signer = await getWalletClientAndUpdateSigner({
      chainId: Number(selectedChain),
    });

    const response = await peanut.createLink({
      structSigner: {
        signer: signer,
      },
      linkDetails: {
        chainId: Number(selectedChain),
        tokenAmount: Number(amount),
        tokenType: tokenList[selectedChain as keyof typeof tokenList].tokenType,
        tokenAddress:
          tokenList[selectedChain as keyof typeof tokenList].address,
      },
    });

    console.log(response.createdLink.link[0]);
  };

  const _claimLinkGasless = async () => {
    const claimLinkGaslessResponse = await peanut.claimLinkGasless({
      link: "",
      recipientAddress: "",
      APIKey: "",
    });
  };

  const _claimLink = async () => {
    const signer = await getWalletClientAndUpdateSigner({
      chainId: Number(selectedChain),
    });
    const claimLinkResponse = await peanut.claimLink({
      signer: signer,
      link: "",
    });
  };

  const _createLinkAdvancedWrapper = async () => {
    const signer = await getWalletClientAndUpdateSigner({
      chainId: Number(selectedChain),
    });

    const linkDetails = {
      chainId: Number(selectedChain),
      tokenAmount: Number(amount),
      tokenType: tokenList[selectedChain as keyof typeof tokenList].tokenType,
      tokenAddress: tokenList[selectedChain as keyof typeof tokenList].address,
    };

    const passwords = [getRandomString(16)];

    const prepareTxsResponse = await peanut.prepareTxs({
      address: address ?? "",
      linkDetails,
      passwords,
    });

    const signedTxs = await Promise.all(
      prepareTxsResponse.unsignedTxs.map((unsignedTx: any) =>
        peanut.signAndSubmitTx({
          structSigner: {
            signer: signer,
          },
          unsignedTx,
        })
      )
    );

    const links = await peanut.getLinksFromTx({
      linkDetails,
      txHash: signedTxs[signedTxs.length - 1].txHash,
      passwords: passwords,
    });

    console.log(links);
  };

  return (
    <main className="flex min-h-screen bg-white text-black flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-end font-mono text-sm lg:flex">
        <Web3Button />
      </div>
      <div className="flex flex-col gap-2 justify-center items-center w-1/4 ">
        <div className="w-full">
          <label className="block text-gray-700 mb-2">Chain:</label>
          <select
            className="mb-4 border border-gray-300 p-2 w-full"
            onChange={(e) => setSelectedChain(e.target.value)}
          >
            <option value="">Select a Chain</option>
            {Object.keys(chainList).map((key) => (
              <option key={key} value={key}>
                {chainList[key as keyof typeof chainList].name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 w-full">
          <label className="block text-gray-700 mb-2">Token:</label>
          <span className="block p-2  border border-gray-300 w-full">
            {selectedChain &&
              tokenList[selectedChain as keyof typeof tokenList].name}
          </span>
        </div>
        <div className="mb-4 w-full">
          {" "}
          <label className="block text-gray-700 mb-2">Amount:</label>
          <input
            type="number"
            className="mb-4 border border-gray-300 p-2 w-full"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <button
          className="py-2 px-4 bg-blue-500 text-white"
          onClick={() => {
            if (isConnected) {
              _createLinkAdvancedWrapper();
            } else {
              open();
            }
          }}
        >
          {isConnected ? "CreateLink" : "Connect"}
        </button>
        {link && (
          <div>
            <label className="block text-gray-700 mb-2">Link:</label>
            <span className="block p-2  border border-gray-300 w-full">
              {link}
            </span>
          </div>
        )}
      </div>
    </main>
  );
}

// const _createLink = async () => {
//   const signer = await getWalletClientAndUpdateSigner({
//     chainId: Number(selectedChain),
//   });
//   console.log("signer: ", signer);
//   console.log("creating a link with the following args: ", {
//     linkDetails: {
//       chainId: Number(selectedChain),
//       tokenAmount: Number(amount),
//       tokenType: tokenList[selectedChain as keyof typeof tokenList].tokenType,
//       tokenAddress:
//         tokenList[selectedChain as keyof typeof tokenList].address,
//     },
//   });
//   const resp = await peanut.createLink({
//     structSigner: {
//      signer: signer,
//     },
//     linkDetails: {
//       chainId: Number(selectedChain),
//       tokenAmount: Number(amount),
//       tokenType: tokenList[selectedChain as keyof typeof tokenList].tokenType,
//       tokenAddress:
//         tokenList[selectedChain as keyof typeof tokenList].address,
//       trackId: "scaffold",
//     },
//   });

//   setLink(resp.createdLink.link[0]);
// };
