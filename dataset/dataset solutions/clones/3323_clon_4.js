'use strict';

function calculateOutcomeProbability(totalTrials, trialProbabilities) {
    // Initialize the probability distribution for 0 trials.
    // At this point, there's a 100% chance of 0 successes.
    // The array index represents the number of successes, and the value is its probability.
    // E.g., [1.0] means P(0 successes) = 1.0.
    const initialDistribution = [1.0];

    // Iteratively update the probability distribution for each trial using a functional reducer.
    // 'currentDistribution' is the array of probabilities after 'trialIndex' trials.
    // 'currentTrialProb' is the success probability for the (trialIndex + 1)-th trial.
    // 'trialIndex' is the 0-based index of the current trial (from 0 to totalTrials - 1).
    const finalDistribution = trialProbabilities.reduce((currentDistribution, currentTrialProb, trialIndex) => {
        const failureProb = 1.0 - currentTrialProb;
        
        // For 'trialIndex + 1' trials, there can be from 0 to 'trialIndex + 1' successes.
        // So, the next distribution array will have 'trialIndex + 2' elements.
        const nextDistribution = new Array(trialIndex + 2).fill(0.0);

        // Populate the next distribution based on the current one.
        // 'successCount' represents the number of successes after 'trialIndex + 1' trials.
        for (let successCount = 0; successCount <= trialIndex + 1; successCount++) {
            // Contribution from achieving 'successCount' successes by:
            // (successCount - 1) successes in previous trials AND the current trial being a success.
            if (successCount > 0) {
                nextDistribution[successCount] += currentDistribution[successCount - 1] * currentTrialProb;
            }
            
            // Contribution from achieving 'successCount' successes by:
            // 'successCount' successes in previous trials AND the current trial being a failure.
            // 'currentDistribution' has 'trialIndex + 1' elements (indices from 0 to trialIndex).
            if (successCount <= trialIndex) {
                nextDistribution[successCount] += currentDistribution[successCount] * failureProb;
            }
        }
        return nextDistribution;
    }, initialDistribution);

    // Sum probabilities for outcomes where the number of successes is greater than totalTrials / 2.
    const minimumSuccesses = Math.floor(totalTrials / 2) + 1;
    let cumulativeProbability = 0.0;
    for (let sIdx = minimumSuccesses; sIdx <= totalTrials; sIdx++) {
        cumulativeProbability += finalDistribution[sIdx];
    }

    return cumulativeProbability;
}

function processInput(inputData) {
    const dataLines = inputData.split("\n");
    const numTrials = parseInt(dataLines[0]);
    const successProbs = dataLines[1].split(' ').map(val => parseFloat(val));
    const finalAnswer = calculateOutcomeProbability(numTrials, successProbs);
    console.log(finalAnswer);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
