import styled from "styled-components";
import { medias } from "../../constants/theme";
import Title, { TitleStyled } from "../_main/Title";
import { PublicKey } from "@solana/web3.js";
import { getEarningsPerDay } from "../../lib/staking/util";
import NFT from "./NFT";

const ContentNFT = ({
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
    <ContentNFTStyled isStaking={isStaking}>
      <Title>{title}</Title>
      <div className="list">
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
    </ContentNFTStyled>
  );
};

export default ContentNFT;

const ContentNFTStyled = styled.div<{ isStaking: boolean }>`
  width: 100%;
  height: fit-content;
  padding-bottom: 20px;

  ${TitleStyled} {
    margin: 0 auto;
    color: white;
  }
  ${medias.min768} {
    width: 47%;
  }
  .list {
    width: 90%;
    margin: 40px auto;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
`;
