import { useEffect, useState } from "react";
import moment from "moment";
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
    <div> 
      {isStaking ? (
      <div className="relative inline-block w-[460px] cursor-pointer"
      onClick={() => {
        callback(stakingGlobals.farmId, nft.mint);
      }}>        
         <img src="./staked-frame.gif" alt="staked bohemian" />           
         <img className="absolute top-[84px] left-[120px] w-[215px]" src={nft.image} alt="" />
         <div className="absolute bottom-[38px] left-[80px] w-[220px] text-center">
           <h2 className="text-ld mb-[-2px]">coins: {claimableCoins.toFixed(4)}</h2>
           <h3 className="text-md">{earningsPerDay} $WOOP / DAY</h3>
         </div>             
       </div>    
      ) : (
     
          <div className="relative inline-block w-[460px] cursor-pointer" onClick={() =>
            callback(stakingGlobals.farmId, nft.mint, nft.pubkey, nft.creator)
          }>        
            <img src="./unstaked-frame.gif" alt="unstaked bohemian" />           
            <img className="absolute top-[25px] left-[55px] w-[240px]" src={nft.image} alt="" />
            <div className="absolute bottom-[150px] left-[65px] w-[220px] text-center">
              <h2 className="text-xl mb-[-2px]">{nft.name}</h2>
              <h3 className="text-lg">15 $WOOP / DAY</h3>
            </div>                 
          </div>        
       
      )}
    </div>
  );
};

export default NFT;
