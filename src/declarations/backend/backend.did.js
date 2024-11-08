export const idlFactory = ({ IDL }) => {
  const Reward = IDL.Record({ 'timestamp' : IDL.Int, 'amount' : IDL.Float64 });
  return IDL.Service({
    'getRewardsHistory' : IDL.Func([], [IDL.Vec(Reward)], ['query']),
    'getTotalRewards' : IDL.Func([], [IDL.Float64], ['query']),
    'getTotalStaked' : IDL.Func([], [IDL.Float64], ['query']),
    'stake' : IDL.Func([IDL.Float64], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
