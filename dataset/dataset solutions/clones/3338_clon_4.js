const primeModulus = 1000000007;

function tallyCombinations(participantCount, objectiveSum, capacities) {
    if (objectiveSum === 0) {
        return 1;
    }

    let currentDistributionCounts = Array(objectiveSum + 1).fill(0);
    currentDistributionCounts[0] = 1; // One way to achieve sum 0 (take nothing)

    for (let currentParticipant = 0; currentParticipant < participantCount; currentParticipant++) {
        const currentCapacity = capacities[currentParticipant];

        const prefixTotals = Array(objectiveSum + 1).fill(0);
        prefixTotals[0] = currentDistributionCounts[0];
        for (let s = 1; s <= objectiveSum; s++) {
            prefixTotals[s] = (prefixTotals[s - 1] + currentDistributionCounts[s]) % primeModulus;
        }

        const nextDistributionCounts = Array(objectiveSum + 1).fill(0);

        for (let s = 0; s <= objectiveSum; s++) {
            let upperIndexValue = prefixTotals[s];
            let lowerIndexValue = (s - 1 - currentCapacity) >= 0 ? prefixTotals[s - 1 - currentCapacity] : 0;
            
            nextDistributionCounts[s] = (upperIndexValue - lowerIndexValue + primeModulus) % primeModulus;
        }
        currentDistributionCounts = nextDistributionCounts;
    }

    return currentDistributionCounts[objectiveSum];
}

function processInputData(rawData) {
    const dataLines = rawData.split("\n");
    const firstLineValues = dataLines[0].split(' ').map(Number);
    const numParticipants = firstLineValues[0];
    const targetSum = firstLineValues[1];
    const participantLimits = dataLines[1].split(' ').map(Number);

    const finalResult = tallyCombinations(numParticipants, targetSum, participantLimits);
    console.log(finalResult);
}

processInputData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));