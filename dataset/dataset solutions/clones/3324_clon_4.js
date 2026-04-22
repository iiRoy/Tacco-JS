'use strict';
(function(rawInputData){
    const processedLines = rawInputData.trim().split('\n');
    const totalTrialsAmount = parseInt(processedLines[0], 10);
    const individualSuccessRates = processedLines[1].split(/\s+/).map(value => parseFloat(value));

    const outcomeCache = Array(totalTrialsAmount + 1).fill(null).map(() => Array(totalTrialsAmount + 1).fill(null));

    const calculateOutcomeChance = (trialNumber, successfulEvents) => {
        if (successfulEvents < 0 || successfulEvents > trialNumber) {
            return 0.0;
        }
        if (trialNumber === 0) {
            return successfulEvents === 0 ? 1.0 : 0.0;
        }

        if (outcomeCache[trialNumber][successfulEvents] !== null) {
            return outcomeCache[trialNumber][successfulEvents];
        }

        const currentTrialRate = individualSuccessRates[trialNumber - 1];
        const computedChance = (currentTrialRate * calculateOutcomeChance(trialNumber - 1, successfulEvents - 1)) +
                               ((1 - currentTrialRate) * calculateOutcomeChance(trialNumber - 1, successfulEvents));

        outcomeCache[trialNumber][successfulEvents] = computedChance;
        return computedChance;
    };

    let aggregatedFinalChance = 0.0;
    const minimumSuccessRequirement = Math.ceil((totalTrialsAmount + 1) / 2);

    for (let successfulEvents = minimumSuccessRequirement; successfulEvents <= totalTrialsAmount; successfulEvents++) {
        aggregatedFinalChance += calculateOutcomeChance(totalTrialsAmount, successfulEvents);
    }

    console.log(aggregatedFinalChance);
})(require('fs').readFileSync('/dev/stdin','utf8'));