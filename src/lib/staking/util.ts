import { Connection, PublicKey } from "@solana/web3.js";
import { SignerWalletAdapter } from "@solana/wallet-adapter-base";
import { IDL as bankIdl } from "./sdk/types/gem_bank";
import { IDL as farmIdl } from "./sdk/types/gem_farm";
import { stakingGlobals } from "../../constants/staking";
import { BN, Wallet } from "@project-serum/anchor";
import moment from "moment";
import { mint_list } from "../../configs/mint_list";
import { findFarmerPDA, GemBankClient, GemFarmClient } from "./sdk";
import { getNFTMetadataForMany, INFT } from "../utils/INFT";

export const initGemBank = (conn: Connection, wallet: SignerWalletAdapter) => {
  return new GemBankClient(
    conn,
    wallet as unknown as Wallet,
    bankIdl as any,
    stakingGlobals.gemBankProgramId
  );
};

export const initGemFarm = (conn: Connection, wallet: SignerWalletAdapter) => {
  return new GemFarmClient(
    conn,
    wallet as unknown as Wallet,
    farmIdl as any,
    stakingGlobals.gemFarmProgramId,
    bankIdl as any,
    stakingGlobals.gemBankProgramId
  );
};

export const fetchFarm = async (
  connection: Connection,
  walletAdapter: SignerWalletAdapter,
  farmId: PublicKey
): Promise<any> => {
  const gf = await initGemFarm(connection, walletAdapter);
  return await gf!.fetchFarmAcc(farmId);
};

/**
 * Fetches the farmer with `identity` from the farm `farm_id`
 *
 * @param connection - Connection to the solana network
 * @param wallet     - Wallet adapter from the identity
 * @param farmId     - PublicKey of the farm id
 * @param identity   - PublicKey of the farmer identity, usually the wallet address
 */
export const fetchFarmer = async (
  connection: Connection,
  wallet: SignerWalletAdapter,
  farmId: PublicKey,
  identity: PublicKey
): Promise<any> => {
  const gf = await initGemFarm(connection, wallet);

  const [farmerPDA] = await findFarmerPDA(farmId, identity);

  try {
    const account = await gf!.fetchFarmerAcc(farmerPDA);
    const state = gf!.parseFarmerState(account);

    return { identity: identity.toBase58(), account, state };
  } catch (e) {
    return null;
  }
};

export const fetchVaultNFTs = async (
  connection: Connection,
  walletAdapter: SignerWalletAdapter,
  identity: PublicKey,
  farm: PublicKey
): Promise<INFT[]> => {
  const gb = await initGemBank(connection, walletAdapter);
  const farmer = await fetchFarmer(connection, walletAdapter, farm, identity);

  if (farmer === null) {
    return [];
  }

  const account = farmer.account;
  const foundGDRs = await gb!.fetchAllGdrPDAs(account.vault);

  if (foundGDRs && foundGDRs.length) {
    const mints = foundGDRs.map((gdr: any) => {
      return { mint: gdr.account.gemMint };
    });

    const nftList = await getNFTMetadataForMany(mints, connection);
    nftList.forEach((x) => {
      x.farmer = account;
    });

    return nftList;
  }

  return [];
};

export const getEarningsPerDay = (
  farmer: any,
  mint: PublicKey | null
): number => {
  if (farmer === null || farmer === undefined) return 0;

  const t1 = farmer.rewardA.fixedRate.promisedSchedule.tier1;
  const t2 = farmer.rewardA.fixedRate.promisedSchedule.tier2;
  const t3 = farmer.rewardA.fixedRate.promisedSchedule.tier3;

  let rarity = 1;
  if (mint !== null) {
    rarity = mint_list.find((x) => x.mint === mint.toBase58())?.reward ?? 1;
  }

  const beginStakingDate = moment(
    new Date(farmer.rewardA.fixedRate.beginStakingTs * 1000)
  );
  const requiredDateForT1 = beginStakingDate
    .clone()
    .add(t1?.requiredTenure.toNumber() ?? 0, "seconds");
  const requiredDateForT2 = beginStakingDate
    .clone()
    .add(t2?.requiredTenure.toNumber() ?? 0, "seconds");
  const requiredDateForT3 = beginStakingDate
    .clone()
    .add(t3?.requiredTenure.toNumber() ?? 0, "seconds");

  const now = moment(Date.now());
  let multiplier = 86400 * rarity;

  if (now <= requiredDateForT1) {
    return (
      (farmer.rewardA.fixedRate.promisedSchedule.baseRate.toNumber() *
        multiplier) /
      Math.pow(10, stakingGlobals.tokenDecimals)
    );
  } else if (
    t1 !== null &&
    now > requiredDateForT1 &&
    now <= requiredDateForT2
  ) {
    return (
      (farmer.rewardA.fixedRate.promisedSchedule.tier1?.rewardRate.toNumber() *
        multiplier) /
      Math.pow(10, stakingGlobals.tokenDecimals)
    );
  } else if (
    t2 !== null &&
    now > requiredDateForT2 &&
    now <= requiredDateForT3
  ) {
    return (
      (farmer.rewardA.fixedRate.promisedSchedule.tier2?.rewardRate.toNumber() *
        multiplier) /
      Math.pow(10, stakingGlobals.tokenDecimals)
    );
  } else if (t3 !== null && now > requiredDateForT3) {
    return (
      (farmer.rewardA.fixedRate.promisedSchedule.tier3?.rewardRate.toNumber() *
        multiplier) /
      Math.pow(10, stakingGlobals.tokenDecimals)
    );
  } else return 0;
};

export const computeClaimableCoins = (farmer: any, earningsPerDay: number) => {
  if (farmer === null || farmer === undefined) return 0;

  const lastUpdatedTs = moment(
    new Date(farmer.rewardA.fixedRate.lastUpdatedTs.toNumber() * 1000)
  );
  const now = moment();
  const diffInSec = now.diff(lastUpdatedTs, "seconds");
  const diffInCoins = diffInSec * (earningsPerDay / 86400);

  return (
    (farmer.rewardA.accruedReward.toNumber() -
      farmer.rewardA.paidOutReward.toNumber()) /
      Math.pow(10, stakingGlobals.tokenDecimals) +
      diffInCoins ?? 0
  );
};
