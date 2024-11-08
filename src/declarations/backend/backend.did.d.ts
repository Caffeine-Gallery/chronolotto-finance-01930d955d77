import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Reward { 'timestamp' : bigint, 'amount' : number }
export interface _SERVICE {
  'getRewardsHistory' : ActorMethod<[], Array<Reward>>,
  'getTotalRewards' : ActorMethod<[], number>,
  'getTotalStaked' : ActorMethod<[], number>,
  'stake' : ActorMethod<[number], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
