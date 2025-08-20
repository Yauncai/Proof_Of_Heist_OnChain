import { useEffect, useState } from 'react';
import { getReadContract, ipfsToHttp } from '../lib/web3';

export interface OwnedNFT {
  id: string;
  name: string;
  image: string;
  description: string;
  mintDate: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | string;
  attributes: Array<{ trait_type: string; value: string }>;
}

export function useOwnedNFTs(ownerAddress: string | undefined) {
  const [nfts, setNfts] = useState<OwnedNFT[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!ownerAddress) return;
      setLoading(true);
      setError(null);
      try {
        const contract = getReadContract();
        const bal = await contract.balanceOf(ownerAddress);
        const count = Number(bal);
        const items: OwnedNFT[] = [];
        for (let i = 0; i < count; i++) {
          const tokenId = await contract.tokenOfOwnerByIndex(ownerAddress, i);
          const uri = await contract.tokenURI(tokenId);
          const httpUri = ipfsToHttp(uri);
          const meta = await fetch(httpUri).then((r) => r.json()).catch(() => ({}));
          items.push({
            id: tokenId.toString(),
            name: meta.name ?? `POH #${tokenId}`,
            image: ipfsToHttp(meta.image ?? ''),
            description: meta.description ?? 'Proof of Heist NFT',
            mintDate: '',
            rarity: meta.attributes?.find((a: any) => a.trait_type === 'Rarity')?.value ?? 'Rare',
            attributes: Array.isArray(meta.attributes) ? meta.attributes : []
          });
        }
        if (!cancelled) setNfts(items);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load NFTs');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [ownerAddress]);

  return { nfts, loading, error };
}


