import Nat "mo:base/Nat";

import Timer "mo:base/Timer";
import Random "mo:base/Random";
import Time "mo:base/Time";
import Float "mo:base/Float";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import Int "mo:base/Int";
import Nat64 "mo:base/Nat64";
import Iter "mo:base/Iter";
import Nat8 "mo:base/Nat8";

actor {
    // Types
    type Reward = {
        amount: Float;
        timestamp: Int;
    };

    // Stable variables for persistence
    stable var totalStaked: Float = 0.0;
    stable var totalRewards: Float = 0.0;
    stable var rewardsHistory: [Reward] = [];
    stable var lastDistributionTime: Int = 0;

    // Buffer for managing rewards history
    let rewardsBuffer = Buffer.Buffer<Reward>(0);

    // Initialize the rewards buffer with stable data
    do {
        for (reward in rewardsHistory.vals()) {
            rewardsBuffer.add(reward);
        };
    };

    // Timer configuration
    let rewardInterval = 300_000_000_000; // 5 minutes in nanoseconds

    // Helper function to generate random reward between 0.1% and 1% of staked amount
    private func generateRandomReward(): async Float {
        let seed = await Random.blob();
        let randomBytes = seed.vals();
        var randomValue: Nat8 = 0;
        
        switch (randomBytes.next()) {
            case (?val) { randomValue := val; };
            case (null) { randomValue := 0; };
        };

        let percentage = (Float.fromInt(Nat8.toNat(randomValue)) / 255.0) * 0.009 + 0.001;
        return totalStaked * percentage;
    };

    // Heartbeat function to handle periodic rewards
    system func heartbeat() : async () {
        let currentTime = Time.now();
        
        if (currentTime >= lastDistributionTime + rewardInterval) {
            if (totalStaked > 0) {
                let reward = await generateRandomReward();
                totalRewards += reward;

                let newReward: Reward = {
                    amount = reward;
                    timestamp = currentTime;
                };

                rewardsBuffer.add(newReward);
                
                // Keep only the last 50 rewards
                if (rewardsBuffer.size() > 50) {
                    let temp = Buffer.Buffer<Reward>(50);
                    let start = rewardsBuffer.size() - 50;
                    for (i in Iter.range(start, rewardsBuffer.size() - 1)) {
                        temp.add(rewardsBuffer.get(i));
                    };
                    rewardsBuffer.clear();
                    for (reward in temp.vals()) {
                        rewardsBuffer.add(reward);
                    };
                };
            };
            lastDistributionTime := currentTime;
        };
    };

    // Public functions
    public shared func stake(amount: Float): async () {
        assert(amount > 0);
        totalStaked += amount;
    };

    public query func getTotalStaked(): async Float {
        totalStaked
    };

    public query func getTotalRewards(): async Float {
        totalRewards
    };

    public query func getRewardsHistory(): async [Reward] {
        Buffer.toArray(rewardsBuffer)
    };

    // System functions for upgrade persistence
    system func preupgrade() {
        rewardsHistory := Buffer.toArray(rewardsBuffer);
    };

    system func postupgrade() {
        lastDistributionTime := Time.now();
    };
}
