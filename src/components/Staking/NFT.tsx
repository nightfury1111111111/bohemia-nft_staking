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
  claimableCoins,
}: {
  nft: any;
  callback: any;
  isStaking: boolean;
  earningsPerDay: number;
  loading: boolean;
  getStakingInfo: any;
  farmer: any;
  claimableCoins: number;
}) => {
  const [nftClaimableCoins, setNftClaimableCoins] = useState(claimableCoins);

  useEffect(() => {
    const interval = setInterval(() => {
      setNftClaimableCoins((prev) => prev + earningsPerDay / 86400);
    }, 1000);
    return () => clearInterval(interval);
  });

  return (
    <NFTStyled>
      <img className="pict" src={nft.image} alt="" />
      <span>{nft.name}</span>
      {isStaking ? (
        <div className="display-button">
          <span>Est. claimable coins: {nftClaimableCoins.toFixed(4)}</span>
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
        <Button
          disabled={loading}
          onClick={() =>
            callback(stakingGlobals.farmId, nft.mint, nft.pubkey, nft.creator)
          }
        >
          Stake
        </Button>
      )}
    </NFTStyled>
  );
};

export default NFT;

const NFTStyled = styled.div`
  border: 3px solid black;
  border-radius: 15px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(100% / 2 - 20px);
  margin: 10px;
  ${medias.min1220} {
    width: calc(100% / 3 - 20px);
  }

  .display-button {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
  .pict {
    width: 60px;
    ${medias.min768} {
      width: 120px;
    }
  }
  span {
    margin-top: 10px;
    font-weight: bold;
  }
`;
