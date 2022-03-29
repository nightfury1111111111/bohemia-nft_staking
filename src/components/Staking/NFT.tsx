import { useEffect, useState } from "react";
import moment from "moment";
import styled from "styled-components";
import { medias } from "../../constants/theme";
import Button from "../_main/Button";
import { stakingGlobals } from "../../constants/staking";

const NFT = ({
  nft,
  callback,
  isStaking,
  earningsPerDay,
  getStakingInfo,
  loading,
  farmer,
}: {
  nft: any;
  callback: any;
  isStaking: boolean;
  earningsPerDay: number;
  loading: boolean;
  getStakingInfo: any;
  farmer: any;
}) => {
  const [claimableCoins, setClaimableCoins] = useState(() => {
    if (nft.farmer === null || nft.farmer === undefined) return 0;

    const lastUpdatedTs = moment(
      new Date(nft.farmer.rewardA.fixedRate.lastUpdatedTs.toNumber() * 1000)
    );
    const now = moment();
    const diffInSec = now.diff(lastUpdatedTs, "seconds");
    const diffInCoins = diffInSec * (earningsPerDay / 86400);

    return (
      (nft.farmer.rewardA.accruedReward.toNumber() -
        nft.farmer.rewardA.paidOutReward.toNumber()) /
        Math.pow(10, 9) +
        diffInCoins ?? 0
    );
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setClaimableCoins((prev) => prev + earningsPerDay / 86400);
    }, 1000);
    return () => clearInterval(interval);
  });

  return (
    <div className="w-1/3"> 
      {isStaking ? (
        <div className="display-button">
          <img className="pict" src={nft.image} alt="" />
          <span>{nft.name}</span>
          <span>Est. claimable coins: {claimableCoins.toFixed(4)}</span>
          <span>Reward rate: {earningsPerDay}</span>
          <Button
            disabled={loading}
            onClick={() => {
              callback(stakingGlobals.farmId, nft.mint);
            }}
          >
            Unstake
          </Button>
        </div>
      ) : (
        <div className="w-full">
           <div className="relative">    
              <img src="./unstaked-frame.png" alt="unstaked bohemian" />           
              <img className="absolute top-[17px] left-[88px] w-[220px]" src={nft.image} alt="" /> 
              <h2 className="absolute text-2xl left-[145px] bottom-[150px]">{nft.name}</h2>
              <div className="absolute bottom-[150px] right-[50px]">
                <Button
                  disabled={loading}
                  onClick={() =>
                    callback(stakingGlobals.farmId, nft.mint, nft.pubkey, nft.creator)
                  }
                >
                Stake
                </Button>  
              </div>            
            </div>        
        </div>
      )}
    </div>
  );
};

export default NFT;
