import Button from "../_main/Button";
import { mint_list } from "../../configs/mint_list";
import { stakingGlobals } from "../../constants/staking";
export const StakingInfos = ({
  NftStaked,
  claim,
  claimableCoins,
}: {
  claim?: CallableFunction;
  NftStaked: string | number;
  claimableCoins: number;
}) => {
  const totalSupply = mint_list.length;

  return (
    <div className="h-[200px] w-full text-center">
      <div className="earning">
        <div className="earnings-title">
          <h4>
            {Math.round(((NftStaked as number) / totalSupply) * 100)}% Staked (
            {NftStaked}/{totalSupply})
          </h4>

          <h4>
            {claimableCoins.toFixed(4)} {stakingGlobals.tokenName} earned
          </h4>
        </div>        
        <Button onClick={claim}>Claim All</Button>
      </div>
    </div>
  );
};


