import styled from "styled-components";
import { medias } from "../../constants/theme";
import Title, { TitleStyled } from "../_main/Title";
import { PublicKey } from "@solana/web3.js";
import { getEarningsPerDay } from "../../lib/staking/util";
import NFT from "./NFT";

const UnstakedNFT = ({
  title,
  NFTs,
  callback,
  isStaking,
  loading,
  getStakingInfo,
}: {
  title: string;
  NFTs: any[];
  callback: any;
  getStakingInfo: any;
  isStaking: boolean;
  loading: boolean;
}) => {
  return (
    <div className="text-center">
      <h2 className="text-white text-4xl">{title}</h2>
      <div className="w-full flex">
        {NFTs.map(
          (e: {
            name: string;
            image: string;
            mint: PublicKey;
            pubkey: PublicKey;
            farmId: PublicKey;
            farmer: any;
          }) => {
            const earningsPerDay = getEarningsPerDay(e.farmer, e.mint);

            return (
              <NFT
                nft={e}
                callback={callback}
                isStaking={isStaking}
                earningsPerDay={earningsPerDay}
                loading={loading}
                getStakingInfo={getStakingInfo}
                farmer={e.farmer}
              />
            );
          }
        )}
      </div>
    </div>
  );
};

export default UnstakedNFT;
