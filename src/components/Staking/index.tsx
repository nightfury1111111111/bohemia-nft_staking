import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { FunctionComponent } from "react";
import styled from "styled-components";
import StakingContent from "./StakingContent";
import { medias } from "../../constants/theme";

const Staking: FunctionComponent = () => {
  const { connected } = useWallet();

  return (
    <StakingStyled>
      {connected ? (
        <StakingContent />
      ) : (
        <div className="flex">
          <div className="error">You need to connect your Wallet</div>
          <WalletMultiButton className="wallet" />
        </div>
      )}
    </StakingStyled>
  );
};

const StakingStyled = styled.div`
  color: black;
  .list-items {
    margin-top: 30px;
    display: flex;
    justify-content: center;
    flex-direction: column;
    ${medias.min768} {
      flex-direction: row;
    }
    height: 100%;
    .sep {
      width: 2px;
      background-color: white;
    }
  }
  .content-button {
    display: flex;
    justify-content: center;
    margin: 50px 0;
  }
`;

export default Staking;
