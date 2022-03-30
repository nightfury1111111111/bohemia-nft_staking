import Button from "../_main/Button";
import { mint_list } from "../../configs/mint_list";
import { stakingGlobals } from "../../constants/staking";
import {useEffect, useState} from "react";
import ContentNFT from "./ContentNFT";
export const StakingInfos = ({
  NftStaked,
  claim,
  claimableCoins,
  walletStakedNfts,
}: {
  claim?: CallableFunction;
  NftStaked: number;
  claimableCoins: number;
  walletStakedNfts: number;
}) => {
  const totalSupply = mint_list.length;
  const [nftClaimableCoins, setNftClaimableCoins] = useState(0);

  useEffect(() => {
    setNftClaimableCoins(claimableCoins);

    const interval = setInterval(() => {
      setNftClaimableCoins((prev) => prev + ((15 / 86400) * walletStakedNfts));
    }, 1000);
    return () => clearInterval(interval);
  }, [claimableCoins, walletStakedNfts]);

  return (
    <div className="h-[200px] w-full text-center">
      <div className="earning">
        <div className="earnings-title">
          <h4>
            {Math.round(((NftStaked as number) / totalSupply) * 100)}% Staked ({NftStaked}/{totalSupply})
          </h4>

          <h4>
            {nftClaimableCoins.toFixed(4)} {stakingGlobals.tokenName} earned
          </h4>
        </div>        
        <Button onClick={claim}>Claim All</Button>
      </div>
    </div>
  );
};


