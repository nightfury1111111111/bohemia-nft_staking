import { FunctionComponent, useEffect, useState } from "react";
import styled from "styled-components";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { SignerWalletAdapter } from "@solana/wallet-adapter-base";
import { PublicKey } from "@solana/web3.js";
import { StakingInfos } from "./StakingInfo";
import {
  computeClaimableCoins,
  fetchFarm,
  fetchFarmer,
  fetchVaultNFTs,
  getEarningsPerDay,
  initGemFarm,
} from "../../lib/staking/util";

import { stakingGlobals } from "../../constants/staking";

import { getTokens } from "../../lib/utils/getTokens";
import { stakeNft } from "../../lib/staking/stakeNft";
import { unstakeNft } from "../../lib/staking/unstakeNft";
import { claim } from "../../lib/staking/claim";
import ContentNFT from "./ContentNFT";

const StakingContent: FunctionComponent = () => {
  const { connection } = useConnection();
  const { publicKey, wallet, sendTransaction } = useWallet();

  const [availableNFTs, setAvailableNFTs] = useState(new Array<any>());
  const [loadingNft, setLoadingNFT] = useState(false);
  const [loadingInfos, setLoadingInfos] = useState(false);
  const [farm, setFarm]: [any, any] = useState(null);
  const [claimableCoins, setClaimableCoins] = useState(0);

  /**
   * Get all the information after the user connects the wallet
   */
  useEffect(() => {
    if (!publicKey) {
      setAvailableNFTs([]);
      return;
    }

    setLoadingNFT(true);
    setLoadingInfos(true);

    getStakingInfos(stakingGlobals.farmId).then(() => setLoadingInfos(false));
    fetchAllNFTs(stakingGlobals.farmId).then(() => setLoadingNFT(false));
    // eslint-disable-next-line
  }, [publicKey]);

  /**
   * Refreshes all the information about the connected wallet
   */
  const refreshStakingData = (farmId: PublicKey) => {
    setTimeout(() => {
      getStakingInfos(farmId).then(() => setLoadingInfos(false));
      fetchAllNFTs(farmId).then(() => setLoadingNFT(false));
    }, 3000);
  };

  const fetchAllNFTs = async (farmId: PublicKey) => {
    if (!publicKey) return;

    const { result: currentNft }: any = await getTokens(
      connection,
      publicKey?.toString()
    );

    const currentStakingNft = await fetchVaultNFTs(
      connection,
      wallet!.adapter as SignerWalletAdapter,
      publicKey,
      farmId
    );

    const stakingNFTs = currentStakingNft?.map((e: any) => {
      return {
        name: e.externalMetadata.name,
        pubkey: e.pubkey,
        mint: e.mint,
        image: e.externalMetadata.image,
        isStaked: true,
        farmer: e.farmer,
      };
    });

    const walletNFTs = currentNft.map((e: any) => {
      return {
        name: e.name,
        pubkey: e.pubkey,
        mint: new PublicKey(e.mint),
        image: e.image,
        isStaked: false,
        creator: new PublicKey(e.data.creators[0].address),
      };
    });

    setAvailableNFTs(walletNFTs.concat(stakingNFTs));
  };

  /**
   * Fetches the information about the farm
   *
   * @param farmId - PublicKey of the farm
   */
  const getStakingInfos = async (farmId: PublicKey) => {
    if (!publicKey) return;

    const farm = await fetchFarm(
      connection,
      wallet!.adapter as SignerWalletAdapter,
      farmId
    );

    setFarm(farm);

    const farmer = await fetchFarmer(
      connection,
      wallet!.adapter as SignerWalletAdapter,
      farmId,
      publicKey!
    );
    setClaimableCoins(
      computeClaimableCoins(
        farmer.account,
        getEarningsPerDay(farmer.account, null)
      )
    );
  };

  const handleStakeNFT = async (
    farmId: PublicKey,
    mint: PublicKey,
    source: PublicKey,
    creator: PublicKey
  ) => {
    setLoadingNFT(true);

    await stakeNft(
      connection,
      wallet!.adapter as SignerWalletAdapter,
      sendTransaction,
      farmId,
      publicKey!,
      mint,
      source,
      creator,
      (e) => {
        console.error(e);
        setLoadingNFT(false);
      },
      () => {
        refreshStakingData(farmId);
      }
    );
  };

  const handleUnstakeNFT = async (farmId: PublicKey, mint: PublicKey) => {
    setLoadingNFT(true);

    await unstakeNft(
      connection,
      wallet!.adapter as SignerWalletAdapter,
      sendTransaction,
      farmId,
      publicKey!,
      mint,
      availableNFTs.filter((x) => x.isStaked === true).length,
      (e) => {
        console.error(e);
        setLoadingNFT(false);
      },
      () => {
        refreshStakingData(farmId);
      }
    );
  };

  const handleClaim = (farmId: PublicKey) => {
    setLoadingInfos(true);

    claim(
      connection,
      wallet!.adapter as SignerWalletAdapter,
      sendTransaction,
      farmId,
      publicKey!,
      (e) => {
        console.error(e);
        setLoadingInfos(false);
      },
      () => {
        refreshStakingData(farmId);
      }
    );
  };

  return (
    <StakingContentStyled>
      <StakingInfos
        NftStaked={farm !== null ? farm?.gemsStaked.toNumber() : "N/A"}
        claimableCoins={claimableCoins}
        claim={async () => {
          await handleClaim(stakingGlobals.farmId);
        }}
      />

      {(loadingInfos || loadingNft) && (
        <div className="loading">Loading...</div>
      )}

      <div className="content-card">
        <div className="list-items">
          <ContentNFT
            loading={loadingNft}
            title={"Unstaked"}
            NFTs={availableNFTs.filter((x) => !x.isStaked)}
            callback={handleStakeNFT}
            isStaking={false}
            getStakingInfo={getStakingInfos}
          />
          <div className="sep" />
          <ContentNFT
            loading={loadingNft}
            title={"Staked"}
            NFTs={availableNFTs.filter((x) => x.isStaked)}
            callback={handleUnstakeNFT}
            isStaking={true}
            getStakingInfo={getStakingInfos}
          />
        </div>
      </div>
    </StakingContentStyled>
  );
};

const StakingContentStyled = styled.div`
  .loading {
    width: 80%;
    margin: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

export default StakingContent;