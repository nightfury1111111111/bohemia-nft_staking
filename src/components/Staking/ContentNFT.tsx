import { PublicKey } from "@solana/web3.js";
import { getEarningsPerDay, getEarningsPerDayUnstaked } from "../../lib/staking/util";
import NFT from "./NFT";

const ContentNFT = ({
  title,
  NFTs,
  callback,
  isStaking,
  loading,
  getStakingInfo,
  claimableCoins,
}: {
  title: string;
  NFTs: any[];
  callback: any;
  getStakingInfo: any;
  isStaking: boolean;
  loading: boolean;
  claimableCoins: number;
}) => {
  return (
    <div className="flex flex-nowrap overflow-x-auto overflow-y-hidden scrollbar-hide mt-[80px]">
        {NFTs.map(
          (e: {
            name: string;
            image: string;
            mint: PublicKey;
            pubkey: PublicKey;
            farmId: PublicKey;
            farmer: any;
          }) => {
          
            const earningsPerDay = getEarningsPerDayUnstaked(e.mint);
            return (
            <div className="w-1/3">
              <NFT
                nft={e}
                callback={callback}
                isStaking={isStaking}
                earningsPerDay={earningsPerDay}
                loading={loading}
                getStakingInfo={getStakingInfo}
                farmer={e.farmer}
                claimableCoins={claimableCoins}
              />
            </div>
            );
          }
        )}
      </div>
  );
};

export default ContentNFT;
