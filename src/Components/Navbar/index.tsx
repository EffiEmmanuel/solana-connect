import { FC } from "react";
import ConnectWalletButton from "../ConnectWalletButton";

const Navbar: FC = () => {
  return (
    <div className="flex flex-row items-center justify-between">
      <h1 className="text-xl font-bold">Token Creator</h1>
      <ConnectWalletButton />
    </div>
  );
};

export default Navbar;
