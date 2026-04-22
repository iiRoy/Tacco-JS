const fetchData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const rawDataLines = fetchData.split("\n");

function determineFinalSlot(activeSlotIndex, globalFund, slotLevelCounters, totalSlots, desiredValue) {
    if (slotLevelCounters[activeSlotIndex] === desiredValue) {
        return activeSlotIndex;
    }

    if (globalFund > 0) {
        let nextSlotLevelCounters = [...slotLevelCounters];
        let potentialWinningSlot = -1;
        let minimumGlobalStepsToWin = Infinity;

        for (let k = 0; k < totalSlots; k++) {
            let currentCandidateSlot = (activeSlotIndex + k) % totalSlots;
            let incrementsNeeded = desiredValue - nextSlotLevelCounters[currentCandidateSlot];

            if (incrementsNeeded > 0) {
                // Calculate the total number of global increments (steps) required
                // for this specific slot to reach the desired value.
                // The k-th slot in sequence (starting from activeSlotIndex) gets its first increment at step k.
                // It needs `incrementsNeeded` total increments.
                // After the first, it needs `incrementsNeeded - 1` more, each taking `totalSlots` global steps.
                let totalStepsForCandidate = k + (incrementsNeeded - 1) * totalSlots;
                if (totalStepsForCandidate < minimumGlobalStepsToWin) {
                    minimumGlobalStepsToWin = totalStepsForCandidate;
                    potentialWinningSlot = currentCandidateSlot;
                }
            }
        }

        if (potentialWinningSlot !== -1 && minimumGlobalStepsToWin < globalFund) {
            // A slot reaches the desired value before the current globalFund is exhausted.
            return potentialWinningSlot;
        } else {
            // The globalFund will run out before any slot reaches the desired value,
            // or no slot currently needs increments.
            // Distribute all `globalFund` increments.
            let completeRounds = Math.floor(globalFund / totalSlots);
            let remainingSingleIncrements = globalFund % totalSlots;

            for (let i = 0; i < totalSlots; i++) {
                nextSlotLevelCounters[i] += completeRounds;
            }
            for (let i = 0; i < remainingSingleIncrements; i++) {
                nextSlotLevelCounters[(activeSlotIndex + i) % totalSlots]++;
            }

            let nextActiveSlotIndex = (activeSlotIndex + globalFund) % totalSlots;
            let nextGlobalFund = 0; // Fund is exhausted
            return determineFinalSlot(nextActiveSlotIndex, nextGlobalFund, nextSlotLevelCounters, totalSlots, desiredValue);
        }
    } else {
        // globalFund is 0: replenish fund from the current slot.
        let fundFromCurrentSlot = slotLevelCounters[activeSlotIndex];
        let newSlotLevelCounters = [...slotLevelCounters];
        newSlotLevelCounters[activeSlotIndex] = 0; // Reset slot level after taking its fund

        let nextActiveSlotIndex = (activeSlotIndex + 1) % totalSlots;
        let nextGlobalFund = fundFromCurrentSlot;
        return determineFinalSlot(nextActiveSlotIndex, nextGlobalFund, newSlotLevelCounters, totalSlots, desiredValue);
    }
}

while (rawDataLines.length > 1) {
    const [numSlots, targetValue] = rawDataLines.shift().trim().split(" ").map(Number);
    
    // Initialize slot levels to 0.
    const initialSlotLevels = new Array(numSlots).fill(0);
    
    // Start the recursive process.
    const finalResultSlot = determineFinalSlot(0, targetValue, initialSlotLevels, numSlots, targetValue);
    
    console.log(finalResultSlot);
}