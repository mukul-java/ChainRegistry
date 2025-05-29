import { ethers } from "ethers";
import create from "zustand";
import { devtools } from "zustand/middleware";
import ContractABI from "./abi.json"; // Ensure ABI is an array (not wrapped in an object)
import { contractAddress } from "./constants";

interface Web3State {
  isInstalledWallet: boolean;
  isConnected: boolean;
  connectedAccount: string | null;
  contract: ethers.Contract | null;
  balance: string | number;

  // Setters
  setIsConnected: (pay: boolean) => void;
  setIsInstalledWallet: (pay: boolean) => void;
  setConnectedAccount: (pay: string | null) => void;
  setContract: (pay: ethers.Contract) => void;
  setBalance: (pay: number | string) => void;

  // Initialize web3 + contract
  initWeb3: () => Promise<void>;
}

const useWeb3Store = create<Web3State>()(
  devtools((set) => ({
    isInstalledWallet: false,
    isConnected: false,
    connectedAccount: null,
    contract: null,
    balance: 0,

    setIsConnected: (pay) => set(() => ({ isConnected: pay })),
    setIsInstalledWallet: (pay) => set(() => ({ isInstalledWallet: pay })),
    setConnectedAccount: (pay) => set(() => ({ connectedAccount: pay })),
    setContract: (pay) => set(() => ({ contract: pay })),
    setBalance: (pay) => set(() => ({ balance: pay })),

    initWeb3: async () => {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const ethereum = (window as any).ethereum;
          // Create provider & request accounts
          const provider = new ethers.BrowserProvider(ethereum);
          await ethereum.request({ method: "eth_requestAccounts" });

          const signer = await provider.getSigner();
          const address = await signer.getAddress();

          // ContractABI should be the ABI array itself
          const contract = new ethers.Contract(contractAddress, ContractABI, signer);
          const balance = await provider.getBalance(address);

          set({
            isInstalledWallet: true,
            isConnected: true,
            connectedAccount: address,
            contract,
            balance: ethers.formatEther(balance),
          });
        } catch (error) {
          console.error("Error initializing web3:", error);
          set({
            isInstalledWallet: true,
            isConnected: false,
            connectedAccount: null,
            contract: null,
            balance: 0,
          });
        }
      } else {
        set({
          isInstalledWallet: false,
          isConnected: false,
          connectedAccount: null,
          contract: null,
          balance: 0,
        });
        console.warn("MetaMask not found.");
      }
    },
  }))
);

export default useWeb3Store;
