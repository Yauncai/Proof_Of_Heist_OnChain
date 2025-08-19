import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers';
import abiJson from '../abi/ProofOfHeist.json';

const ABI = (abiJson as any).abi ?? abiJson;

export function getContractAddress(): string {
  const addr = import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined;
  if (!addr) throw new Error('VITE_CONTRACT_ADDRESS is not set');
  return addr;
}

export function getReadProvider(): JsonRpcProvider | BrowserProvider {
  const rpc = import.meta.env.VITE_RPC_URL as string | undefined;
  if (rpc) return new JsonRpcProvider(rpc);
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return new BrowserProvider((window as any).ethereum);
  }
  throw new Error('No RPC provider available');
}

export async function getSignerProvider(): Promise<BrowserProvider> {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('No injected wallet found');
  }
  const provider = new BrowserProvider((window as any).ethereum);
  // Ensure user connects at least once
  await provider.send('eth_requestAccounts', []);
  return provider;
}

export function getReadContract() {
  const provider = getReadProvider();
  return new Contract(getContractAddress(), ABI, provider);
}

export async function getWriteContract() {
  const provider = await getSignerProvider();
  const signer = await provider.getSigner();
  return new Contract(getContractAddress(), ABI, signer);
}

export function ipfsToHttp(uri: string): string {
  if (!uri) return uri;
  if (uri.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${uri.replace('ipfs://', '')}`;
  }
  return uri;
}

export async function getConnectedAddress(): Promise<string | null> {
  try {
    if (typeof window === 'undefined' || !(window as any).ethereum) return null;
    const provider = new BrowserProvider((window as any).ethereum);
    const accounts: string[] = await provider.send('eth_accounts', []);
    if (accounts && accounts.length > 0) return accounts[0];
    return null;
  } catch {
    return null;
  }
}


