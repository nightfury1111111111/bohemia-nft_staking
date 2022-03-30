import styled from "styled-components";
import Button, { ButtonStyled } from "../_main/Button";
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
    <StakingInfosStyled>
      <div className="earning">
        <div className="earnings-title">
          <h4>
            {Math.round(((NftStaked as number) / totalSupply) * 100)}% Staked ({NftStaked}/{totalSupply})
          </h4>

          <h4>
            {nftClaimableCoins.toFixed(4)} {stakingGlobals.tokenName} earned
          </h4>
        </div>
        <Button onClick={claim}>Claim</Button>
      </div>
    </StakingInfosStyled>
  );
};

const StakingInfosStyled = styled.div`
  margin: auto;
  width: 60%;
  display: flex;
  border-radius: 3px;
  border-color: black;
  justify-content: start;
  flex-direction: column;
  .earning {
    margin-top: 20px;
    .earnings-title {
      display: flex;
      justify-content: space-between;
    }
  }
  .button {
    ${ButtonStyled} {
      margin: 15px auto;
      color: white;
      width: fit-content;
    }
  }
`;
