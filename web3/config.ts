import { createConfig, http, injected } from "wagmi";
import { defineChain } from "viem";
import { sepolia, polygonAmoy, arbitrumSepolia } from "viem/chains";

// Local development EVM chain (Anvil / Hardhat Node on port 8545)
export const localChain = defineChain({
  id: 31337,
  name: "EduPass Network",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
  },
});

function getInjectedProvider() {
  if (typeof window === "undefined") return undefined;
  const ethereum = (window as any).ethereum;
  if (!ethereum) return undefined;
  if (ethereum.providers?.length) {
    const metaMaskProvider = ethereum.providers.find((p: any) => p.isMetaMask);
    if (metaMaskProvider) return metaMaskProvider;
  }
  return ethereum;
}

export const wagmiConfig = createConfig({
  chains: [localChain, sepolia, polygonAmoy, arbitrumSepolia],
  connectors: [
    injected({
      target() {
        return {
          id: "windowEthereum",
          name: "MetaMask",
          provider: getInjectedProvider(),
        };
      },
    }),
  ],
  transports: {
    [localChain.id]: http("http://127.0.0.1:8545"),
    [sepolia.id]: http(),
    [polygonAmoy.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
});
