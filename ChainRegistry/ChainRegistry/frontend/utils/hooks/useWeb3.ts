import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { contractAddress } from '../constants';
import abi from '../abi.json';
import useWeb3Store from '../web3store';
import shallow from 'zustand/shallow';

const useWeb3 = () => {
  const connectedAccount = useWeb3Store((state) => state.connectedAccount);
  const [setBalance] = useWeb3Store(state => [state.setBalance], shallow);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [setContract] = useWeb3Store(state => [state.setContract], shallow);

  const BalanceContract = useCallback(async () => {
    if (!provider || !connectedAccount) return;

    const balance = await provider.getBalance(connectedAccount);
    setBalance(ethers.utils.formatEther(balance));

    const signer = provider.getSigner();
    const LandContract = new ethers.Contract(contractAddress, abi, signer);
    setContract(LandContract);
  }, [connectedAccount, provider, setBalance, setContract]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const newProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(newProvider);
    }
  }, []);

  useEffect(() => {
    if (connectedAccount && provider) BalanceContract();
  }, [connectedAccount, provider, BalanceContract]);
};

export default useWeb3;
