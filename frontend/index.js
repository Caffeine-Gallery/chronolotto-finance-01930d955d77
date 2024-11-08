import { backend } from "declarations/backend";

let loadingModal;

document.addEventListener('DOMContentLoaded', async () => {
    loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    
    // Initialize the page
    await updateStats();
    await updateRewardsHistory();

    // Add event listeners
    document.getElementById('stakeBtn').addEventListener('click', handleStake);
});

async function handleStake() {
    const stakeAmount = parseFloat(document.getElementById('stakeAmount').value);
    
    if (isNaN(stakeAmount) || stakeAmount <= 0) {
        alert('Please enter a valid stake amount');
        return;
    }

    try {
        loadingModal.show();
        await backend.stake(stakeAmount);
        document.getElementById('stakeAmount').value = '';
        await updateStats();
        await updateRewardsHistory();
    } catch (error) {
        console.error('Staking error:', error);
        alert('Error while staking. Please try again.');
    } finally {
        loadingModal.hide();
    }
}

async function updateStats() {
    try {
        const totalStaked = await backend.getTotalStaked();
        const totalRewards = await backend.getTotalRewards();
        
        document.getElementById('totalStaked').textContent = `${totalStaked.toFixed(2)} ICP`;
        document.getElementById('totalRewards').textContent = `${totalRewards.toFixed(2)} ICP`;
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

async function updateRewardsHistory() {
    try {
        const history = await backend.getRewardsHistory();
        const historyContainer = document.getElementById('rewardsHistory');
        historyContainer.innerHTML = '';

        history.forEach(reward => {
            const item = document.createElement('div');
            item.className = 'list-group-item';
            const date = new Date(Number(reward.timestamp) / 1_000_000); // Convert nanoseconds to milliseconds
            item.innerHTML = `
                <span>Reward: ${reward.amount.toFixed(2)} ICP</span>
                <small class="text-muted">${date.toLocaleString()}</small>
            `;
            historyContainer.appendChild(item);
        });
    } catch (error) {
        console.error('Error updating rewards history:', error);
    }
}

// Poll for updates every 10 seconds
setInterval(async () => {
    await updateStats();
    await updateRewardsHistory();
}, 10000);
