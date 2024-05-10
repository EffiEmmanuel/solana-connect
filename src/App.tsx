import { ChangeEvent, FC, useState } from "react";
import Navbar from "./Components/Navbar";
import { MdOutlineAddAPhoto } from "react-icons/md";
import { FaLink, FaXmark } from "react-icons/fa6";
import {
  ConnectionContext,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  Account,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";

require("@solana/wallet-adapter-react-ui/styles.css");

const App: FC = () => {
  const { publicKey, wallet, signTransaction, sendTransaction } = useWallet();
  const { connection } = useConnection();

  // Form Fields
  const [tokenName, setTokenName] = useState<string>("");
  const [symbol, setSymbol] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [symbolImage, setSymbolImage] = useState<string>("");
  const [image, setImage] = useState<File | null>();

  // Handle image
  const [renderImage, setRenderImage] = useState<string | null>("");
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const reader = new FileReader();

    console.log("FILE:", file);
    setImage(file);

    reader.onloadend = () => {
      setRenderImage(reader.result as string);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  async function uploadFile(
    file: File,
    resourceType: string,
    uploadPreset: string
  ) {
    // UPLOAD IMAGE TO CLOUDINARY FIRST
    const formData = new FormData();
    formData.append("file", file);
    if (uploadPreset === "token-json")
      formData.append("public_id", `${tokenName}-${Date.now()}-${symbol}.json`);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/gethsemane-tech/${resourceType}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    return response;
  }

  //   async function mintToken(metadata: JSON) {
  //   async function mintToken() {
  //     const connection = new Connection("https://api.devnet.solana.com");

  //     if (publicKey) {
  //       // Generate a new token mint
  //       const mint = await PublicKey.createWithSeed(
  //         publicKey,
  //         `${tokenName}-${symbol}`,
  //         SystemProgram.programId
  //       );

  //       console.log("Mint:", mint.toBase58());

  //       //   const mintInfo = await getMint(
  //       //     connection,
  //       //     mint
  //       //   )

  //       //   console.log(mintInfo.supply);
  //     }

  //     if (publicKey) {
  //       //   createAndMint(umi, {
  //       //     // mint: publicKey,
  //       //   })
  //     }
  //   }

  async function handleCreateToken() {
    if (image) {
      const uploadImageResponse = await uploadFile(
        image,
        "image",
        "token-creator"
      );
      const uploadImageData = await uploadImageResponse.json();
      console.log("UPLOAD IMAGE DATA FROM CLOUDINARY:", uploadImageData);

      // Create json file for metadata
      const metadataJSON = JSON.stringify({
        name: tokenName,
        symbol,
        description,
        image: uploadImageData?.secure_url,
      });

      // Step 2: Convert JSON data to a Blob
      const blob = new Blob([metadataJSON], { type: "application/json" });

      // Step 3: Create a File object from the Blob
      const file = new File(
        [blob],
        `${tokenName}-${Date.now()}-${symbol}.json`,
        { type: "application/json" }
      );

      // Upload it to cloudinary
      const uploadMetadataResponse = await uploadFile(
        file,
        "raw",
        "token-json"
      );
      const uploadMetadataData = await uploadMetadataResponse.json();

      console.log("METADATA FROM CLOUDINARY:", uploadMetadataData);
      // Add the metadata uri to the metadata
      const metadata = {
        name: tokenName,
        symbol: symbol,
        uri: uploadMetadataData?.secure_url,
      };

      // Create mint account
      const mintAccount = Keypair.generate();

      // Set token authority
      if (publicKey && signTransaction && sendTransaction) {
        const setAuthorityInstruction = Token.createSetAuthorityInstruction(
          TOKEN_PROGRAM_ID,
          mintAccount.publicKey,
          publicKey,
          "MintTokens",
          publicKey,
          []
        );

        const tx = new Transaction().add(setAuthorityInstruction);
        tx.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
        tx.feePayer = publicKey;
        await signTransaction(tx);
        await sendTransaction(tx, connection);
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white py-6 px-10">
      <Navbar />

      {/* Create Token */}
      <div className="bg-darkPurple w-full p-10 rounded-lg mt-7">
        <h2 className="text-lg font-semibold">Create Spl Token</h2>

        <div className="bg-lightPurple rounded-lg p-5 mt-5 flex lg:flex-row flex-col relative">
          <div className="flex flex-row w-full lg:w-[50%]">
            <div className="hidden lg:flex flex-col">
              <div className="border-[3px] border-lightGray rounded-full h-10 w-10 p-2">
                <div className="h-5 w-5 bg-lightGray rounded-full"></div>
              </div>
            </div>

            <div className="py-1 px-3">
              <h3 className="uppercase text-lg text-lightGray font-semibold">
                Token Information
              </h3>
              <p className="text-sm">
                This information is stored on IPFS by + Metaplex Metadata
                standard.
              </p>

              {/* Form */}
              <div className="mt-5">
                <form className="flex flex-col gap-y-5">
                  <div className="flex flex-col gap-y-1">
                    <label
                      htmlFor="tokenName"
                      className="text-sm text-lightGray"
                    >
                      Token Name (ex. Dexlab)
                    </label>

                    <input
                      type="text"
                      name="tokenName"
                      id="tokenName"
                      className="p-2 px-4 rounded-lg h-10 w-full focus:border-none outline-none focus:outline-none bg-darkPurple placeholder:text-gray-500"
                      value={tokenName}
                      onChange={(e) => setTokenName(e.target.value)}
                      placeholder="Enter token name"
                    />
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <label htmlFor="symbol" className="text-sm text-lightGray">
                      Symbol (Max 10, ex. DXL)
                    </label>

                    <input
                      type="text"
                      name="symbol"
                      id="symbol"
                      className="p-2 px-4 rounded-lg h-10 w-full focus:border-none outline-none focus:outline-none bg-darkPurple placeholder:text-gray-500"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value)}
                      placeholder="Enter token symbol"
                    />
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <label
                      htmlFor="description"
                      className="text-sm text-lightGray"
                    >
                      (Optional) Description
                    </label>

                    <textarea
                      name="description"
                      id="description"
                      className="p-2 px-4 rounded-lg h-10 w-full focus:border-none outline-none focus:outline-none bg-darkPurple placeholder:text-gray-500"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter project description"
                    ></textarea>
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <label
                      htmlFor="description"
                      className="text-sm text-lightGray"
                    >
                      Symbol Image (ex. Square size 128x128 or larger is
                      recommended.)
                    </label>

                    <input
                      type="text"
                      name="symbolImage"
                      id="symbolImage"
                      className="p-2 px-4 rounded-lg h-10 w-full focus:border-none outline-none focus:outline-none bg-darkPurple placeholder:text-gray-500"
                      value={symbolImage}
                      onChange={(e) => setSymbolImage(e.target.value)}
                      placeholder="Enter or upload symbol icon url"
                    />

                    <div className="mt-2 w-full relative border-dashed border-[1px] border-gray-300 rounded-lg h-24 flex flex-col items-center justify-center overflow-hidden">
                      <>
                        <MdOutlineAddAPhoto
                          size={24}
                          className="text-gray-300"
                        />
                        <small className="text-gray-300 text-center">
                          Click to Insert Profile Picture
                        </small>
                        <input
                          className="absolute top-0 bg-transparent w-full h-full opacity-0 cursor-pointer"
                          type="file"
                          name="image"
                          id="image"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </>

                      {renderImage && image && (
                        <div className="absolute w-full h-full top-0 flex justify-center items-center">
                          <div className="flex flex-row items-center justify-center h-10 w-10 rounded-full bg-lightPurple p-2 absolute top-3 right-3 cursor-pointer z-40">
                            <FaXmark
                              onClick={() => {
                                setImage(null);
                                setRenderImage("");
                              }}
                              size={16}
                              className="text-lightGray"
                            />
                          </div>
                          <img
                            src={renderImage}
                            alt="Uploaded"
                            className="object-cover h-full w-full z-10"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {publicKey ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleCreateToken();
                      }}
                      className="rounded-full h-14 w-full bg-[#43437D]"
                    >
                      Create Token
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        alert(
                          "Use the connect wallet button at the top of the page to connect your wallet"
                        );
                      }}
                      disabled={publicKey ? true : false}
                      className="rounded-full h-14 w-full bg-[#43437D]"
                    >
                      <>{publicKey ? "Wallet Connected" : "Connect Wallet"}</>
                    </button>
                  )}
                </form>

                <div className="text-gray-500 my-5">
                  <p>CREATE TOKEN</p>
                  <p>
                    Generate a token. In this process, you can get a token mint
                    address.
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Line */}
          <div className="hidden lg:block -ml-px absolute mt-0.5 top-14 left-10 w-0.5 h-[79.5%] bg-gray-300"></div>
          <div className="hidden lg:flex flex-col absolute -ml-px bottom-12 left-5">
            <div className="border-[3px] border-lightGray rounded-full h-10 w-10 p-2">
              <div className="h-5 w-5 bg-lightGray rounded-full"></div>
            </div>
          </div>

          <div className="w-full lg:w-[50%]">
            <div className="py-1">
              <h3 className="uppercase text-lg text-lightGray font-semibold">
                Preview
              </h3>
            </div>
            <div className="bg-darkPurple rounded-lg p-2 mt-2 h-max">
              <div className="bg-lightPurple rounded-lg p-4">
                <div className="flex flex-row items-center gap-x-2">
                  <div className="overflow-hidden h-16 w-16 rounded-full bg-green-500 flex items-center justify-center">
                    {!renderImage && (
                      <h1 className="text-2xl font-bold uppercase">
                        {symbol ? symbol?.split("")[0] : "S"}
                      </h1>
                    )}
                    {renderImage && (
                      <img
                        src={renderImage}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex flex-col">
                    <p className="text-blue-600">
                      {!tokenName ? " Token Name" : tokenName}
                    </p>
                    <p className="text-lightGray">
                      {!symbol ? " Symbol" : symbol}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-darkPurple mt-4 rounded-lg p-6">
              <h3 className="text-lg text-lightGray">Token Information</h3>

              <div className="flex flex-col gap-y-10 mt-5">
                <div className="flex flex-row gap-x-2">
                  <span>Name:</span>
                  <span>{tokenName}</span>
                </div>
                <div className="flex flex-row gap-x-2">
                  <span>Symbol:</span>
                  <span>{symbol}</span>
                </div>
                <div className="flex flex-row gap-x-2">
                  <span>Program:</span>
                  <a
                    className="text-blue-600 flex flex-row gap-x-1 items-center"
                    target="_blank"
                    href="https://solscan.io/address/TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                  >
                    <span>Token Program</span>
                    <FaLink size={14} />
                  </a>
                </div>

                <div className="flex flex-row gap-x-2">
                  <span>Mint Authority:</span>
                  <span>{publicKey ? publicKey?.toBase58() : ""}</span>
                </div>

                <div className="flex flex-row gap-x-2">
                  <span>Update Authority:</span>
                  <span>{publicKey ? publicKey?.toBase58() : ""}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default App;
