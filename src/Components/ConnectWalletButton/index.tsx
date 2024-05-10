import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { FC, useEffect } from "react";

const ConnectWalletButton: FC = () => {
  const { publicKey } = useWallet();

  const { connection } = useConnection();

  // Function: Airdrop 1 SOL to wallet
  async function airdropSOLToWallet() {
    if (publicKey && connection) {
      const airdropSignature = connection.requestAirdrop(
        publicKey,
        LAMPORTS_PER_SOL
      );
      try {
        const txId = await airdropSignature;
        console.log("Airdrop Transaction Id:", txId);
        console.log(`https://explorer.solana.com/tx/${txId}?cluster=devnet`);
      } catch (error) {
        console.log("Error:", error);
      }
    }
  }

  useEffect(() => {
    if (publicKey && connection) {
      // Airdrop 1 SOL to user's wallet
      airdropSOLToWallet();
    }
  }, [publicKey, connection]);

  return (
    <div className="App">
      <WalletMultiButton />
    </div>
  );
};

export default ConnectWalletButton;
