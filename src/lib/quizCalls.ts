import { parseEther } from 'ethers';
import ProofOfHeistAbi from '../abi/ProofOfHeist.json';

const clickContractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const clickContractAbi = [
  {
    type: 'function',
    name: 'enterGame',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
] as const;

export const quizCalls = [
  {
    address: clickContractAddress,
    abi: clickContractAbi,
    functionName: 'enterGame',
    args: [],
    value: parseEther('0.001'),

  }
];

