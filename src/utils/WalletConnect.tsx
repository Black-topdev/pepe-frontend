// src/components/WalletConnect.tsx
import React, { useState } from "react";
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

declare global {
  interface Window {
    solana?: any; // Add Phantom wallet to the window interface
  }
}

const WalletConnect: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Helper function to shorten the address
  const shortenAddress = (address: string): string => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Check if Phantom is installed
  const isPhantomInstalled = (): boolean => {
    return window?.solana?.isPhantom || false;
  };

  // Function to connect the Phantom wallet
  const connectWallet = async (): Promise<void> => {
    try {
      const { solana } = window;
      if (solana && solana.isPhantom) {
        const response = await solana.connect();
        setWalletAddress(response.publicKey.toString());
        setIsConnected(true);
      } else {
        // If Phantom is not installed, prompt the user to download it
        alert(
          "Phantom Wallet is not installed. Redirecting you to download Phantom Wallet."
        );
        window.open("https://phantom.app/", "_blank");
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    }
  };

  // Function to disconnect the Phantom wallet
  const disconnectWallet = async (): Promise<void> => {
    try {
      const { solana } = window;
      if (solana && solana.isPhantom) {
        await solana.disconnect();
        setWalletAddress(null);
        setIsConnected(false);
      }
    } catch (error) {
      console.error("Error disconnecting from wallet:", error);
    }
  };

  // Function to send SOL tokens
  const sendSOL = async (
    recipientAddress: string,
    amount: number
  ): Promise<void> => {
    if (!isConnected || !walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      const fromPubKey = new PublicKey(walletAddress);
      const toPubKey = new PublicKey(recipientAddress);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromPubKey,
          toPubkey: toPubKey,
          lamports: amount * LAMPORTS_PER_SOL, // Convert to lamports
        })
      );

      // Sign and send transaction
      const { solana } = window;
      const { signature } = await solana.signAndSendTransaction(transaction);
      console.log("Transaction signature:", signature);

      // Confirm transaction
      const confirmation = await connection.confirmTransaction(signature);
      console.log("Transaction confirmed:", confirmation);
    } catch (error) {
      console.error("Error sending SOL:", error);
    }
  };

  // Handle button click (connect/disconnect)
  const handleClick = (): void => {
    if (isConnected) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };

  return (
    <div>
      <button onClick={handleClick}>
        {isConnected ? shortenAddress(walletAddress!) : "Connect Wallet"}
      </button>

      {isConnected && (
        <div>
          <p>Connected: {shortenAddress(walletAddress!)}</p>
          <button
            onClick={() => sendSOL("recipientPublicKeyHere", 0.01)} // Replace with actual recipient address
          >
            Send 0.01 SOL
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
