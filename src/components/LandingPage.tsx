import React, { useEffect, useState } from "react";
import svg from "../assets/svg";
import Img from "../assets/pepeImages";
import tabList from "../assets/buttonList.png";
import { Link } from "react-router-dom";
import "../animation.scss";

// hooks to solana
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
// end of solana
const LandingPage: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  //blockchain
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // solana  start

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

  // solana stop

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImgIndex((prevIndex) => (prevIndex + 1) % Img.length);
    }, 1000); // 1000 milliseconds = 1 second

    return () => clearInterval(intervalId);
  }, []);
  return (
    <div className="w-full xl:min-h-screen flex flex-row justify-center bg-gradient-to-b from-[#000E1A] to-[#2D1D46]">
      {/* container */}
      <div className="w-full max-w-[1440px] relative pb-30 xl:h-[100vh]">
        <div className="flex flex-col xl:flex-row xl:justify-between">
          <div className="w-full px-[20px] xl:max-w-[50%] pt-20">
            {/* title */}
            <div className="mb-10 xl:mb-16" data-aos="fade-down">
              <p
                className="font-sans text-white text-[30px] xl:text-[40px] text-left neon-text rotating-text break-words"
                data-text="play Pepe Trump Frog Game to collect money"
              >
                play Pepe Trump Frog Game to collect money
              </p>
            </div>

            {/* token amount */}
            <div
              className="flex flex-row justify-center items-center relative mb-16 xl:mb-32"
              data-aos="fade-up"
              data-aos-duration="500"
            >
              <div className="rounded-[30px] border-[3px] border-[#02437B] bg-[414141] bg-opacity-[25] w-full p-1">
                <p className="font-sans text-white text-[25px] xl:text-[40px]">
                  <span className="text-[#FFDC00]">21365</span>
                </p>
              </div>
              <div className="absolute left-[-10px] xl:left-[-20px] top-1/2 transform -translate-y-1/2 h-full flex items-center w-16 xl:w-full">
                {svg.catCoinSVG}
              </div>
            </div>

            {/* cat image */}
            <div className="w-full xl:hidden relative" data-aos="zoom-in-up">
              <div className="w-full rounded-[90px] overflow-hidden">
                <div>
                  <img src={Img[currentImgIndex]} className="w-full" />
                </div>
                <div className="absolute top-0 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[rgba(1,15,26,1)] via-[rgba(14,19,40,0.5)] to-[rgba(14,19,40,1)] text-white"></div>
              </div>
            </div>

            {/* leader board */}
            <div
              className="relative"
              data-aos="fade-right"
              data-aos-offset="300"
              data-aos-easing="ease-in-sine"
            >
              <div className="absolute left-1/2 transform -translate-y-1/2 -translate-x-1/2 rounded-[13px] border-[3px] bg-[#0B1225] p-[3px]">
                <p className="font-sans text-[24px] xl:text-[32px] text-white p-1 xl:p-2">
                  Leader-Board
                </p>
              </div>
              <div className="border-[3px] rounded-[30px] border-[#BED9E6] bg-transparent sm:px-[10px] py-[40px] xl:p-[40px] w-full">
                <div className="w-full flex flex-row gap-2 xl:gap-10 p-2 justify-center items-center">
                  <div>{svg.firthMedal}</div>
                  <div className="rounded-full border-2 border-white overflow-hidden w-[40px] h-[40px] bg-[url('./assets/avatar1.jpg')] bg-cover"></div>
                  <div className="grow rounded-md border-transparent bg-[#434553] p-3 flex flex-row justify-between gap-10 font-jua text-white text-[17px] text-left">
                    <p>Nguyen</p>
                    <p className=" grow text-yellow-400 hidden xl:flex xl:flex-row xl:gap-2 xl:items-center">
                      {svg.fullStar}
                      {svg.fullStar}
                      {svg.fullStar}
                      {svg.fullStar}
                      {svg.fullStar}
                    </p>
                    <p>488 714 827</p>
                  </div>
                </div>
                <div className="w-full flex flex-row gap-2 xl:gap-10 p-2 justify-center items-center">
                  <div>{svg.firthMedal}</div>
                  <div className="rounded-full border-2 border-white overflow-hidden w-[40px] h-[40px] bg-[url('./assets/avatar1.jpg')] bg-cover"></div>
                  <div className="grow rounded-md border-transparent bg-[#434553] p-3 flex flex-row justify-between gap-10 font-jua text-white text-[17px] text-left">
                    <p>Nguyen</p>
                    <p className=" grow text-yellow-400 hidden xl:flex xl:flex-row xl:gap-2 xl:items-center">
                      {svg.fullStar}
                      {svg.fullStar}
                      {svg.fullStar}
                      {svg.fullStar}
                      {svg.fullStar}
                    </p>
                    <p>488 714 827</p>
                  </div>
                </div>
                <div className="w-full flex flex-row gap-2 xl:gap-10 p-2 justify-center items-center">
                  <div>{svg.firthMedal}</div>
                  <div className="rounded-full border-2 border-white overflow-hidden w-[40px] h-[40px] bg-[url('./assets/avatar1.jpg')] bg-cover"></div>
                  <div className="grow rounded-md border-transparent bg-[#434553] p-3 flex flex-row justify-between gap-10 font-jua text-white text-[17px] text-left">
                    <p>Nguyen</p>
                    <p className=" grow text-yellow-400 hidden xl:flex xl:flex-row xl:gap-2 xl:items-center">
                      {svg.fullStar}
                      {svg.fullStar}
                      {svg.fullStar}
                      {svg.fullStar}
                      {svg.fullStar}
                    </p>
                    <p>488 714 827</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="w-full px-5 mt-5 xl:hidden"
            data-aos="fade-up"
            data-aos-anchor-placement="top-bottom"
          >
            <div className="w-full relative">
              <div className="w-full">
                <img src={tabList} className="w-full" />
              </div>
              <div className="absolute top-0 left-0 w-full flex flex-col grow pt-[10vw]">
                <button
                  onClick={handleClick}
                  className="font-bold text-[30px] font-sans mb-[10vw] menuBtn"
                >
                  {isConnected
                    ? shortenAddress(walletAddress!)
                    : "Connect Wallet"}
                </button>
                <p className="font-bold text-[30px] font-sans mb-[10vw] menuBtn ">
                  <Link to="/game">Start Game</Link>
                </p>
                <p className="font-bold text-[30px] font-sans menuBtn ">Shop</p>
              </div>
            </div>
          </div>

          {/* cat image */}
          <div className="relative w-full max-w-[40%] h-screen hidden xl:block">
            <div
              className="absolute top-0 right-0 w-[576px] h-[576px] rounded-[167px] overflow-hidden hidden xl:block"
              data-aos="zoom-in-up"
            >
              <div>
                <img src={Img[currentImgIndex]} className="w-full" />
              </div>
              <div className="absolute top-0 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[rgba(1,15,26,1)] via-[rgba(14,19,40,0.5)] to-[rgba(14,19,40,1)] text-white"></div>
            </div>
            <div
              className="absolute w-full xl:w-[540px] xl:h-[500px] bottom-0 xl:right-[20px] bg-[url('./assets/buttonList.png')] bg-cover"
              data-aos="fade-up"
              data-aos-anchor-placement="top-center"
            >
              <div className="flex flex-col grow pt-[65px]">
                <button
                  onClick={handleClick}
                  className="font-bold text-[40px] font-sans mb-[60px]  menuBtn"
                >
                  {isConnected
                    ? shortenAddress(walletAddress!)
                    : "Connect Wallet"}
                </button>
                <p className="font-bold text-[40px] font-sans mb-[60px]  menuBtn">
                  <Link to="/game">Start Game</Link>
                </p>
                <p className="font-bold text-[40px] font-sans menuBtn">Shop</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="fixed w-full h-24 bottom-0 bg-[url('assets/footer.png')] bg-cover"></div>
    </div>
  );
};
export default LandingPage;
