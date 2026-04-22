const retrieveInputData = () => require("fs").readFileSync(0, "utf8").trim();

const transmitResult = (outcome) => console.log(outcome);
const postDiagnostic = (message) => console.error(message);

const processSequence = () => {
    const rawData = retrieveInputData();
    const dataLines = rawData.split('\n');
    const totalLength = parseInt(dataLines[0], 10);
    const numericElements = dataLines[1].split(' ');

    const countsForEvenPositions = new Map();
    const countsForOddPositions = new Map();

    numericElements.forEach((elementString, positionIndex) => {
        const numericValue = parseInt(elementString, 10);
        if (positionIndex % 2 === 0) {
            countsForEvenPositions.set(numericValue, (countsForEvenPositions.get(numericValue) || 0) + 1);
        } else {
            countsForOddPositions.set(numericValue, (countsForOddPositions.get(numericValue) || 0) + 1);
        }
    });

    const generateRankedFrequencies = (frequencyMap) => {
        return Array.from(frequencyMap.entries())
                    .map(([value, count]) => ({ tally: count, item: value }))
                    .sort((a, b) => b.tally - a.tally || a.item - b.item); // Sort by tally descending, then item ascending for tie-break
    };

    const rankedEvenFrequencies = generateRankedFrequencies(countsForEvenPositions);
    const rankedOddFrequencies = generateRankedFrequencies(countsForOddPositions);

    const getFrequencyRank = (rankedList, rank) => rankedList[rank] || { tally: 0, item: null };

    const topEvenRank = getFrequencyRank(rankedEvenFrequencies, 0);
    const secondEvenRank = getFrequencyRank(rankedEvenFrequencies, 1);
    const topOddRank = getFrequencyRank(rankedOddFrequencies, 0);
    const secondOddRank = getFrequencyRank(rankedOddFrequencies, 1);

    let requiredModifications;
    const elementsPerSubsequence = totalLength / 2; // Assuming totalLength is always even

    if (topEvenRank.item !== topOddRank.item) {
        // If the most frequent items for even and odd positions are already distinct
        requiredModifications = (elementsPerSubsequence - topEvenRank.tally) + (elementsPerSubsequence - topOddRank.tally);
    } else {
        // If the most frequent items are identical, one must be changed
        // Scenario A: Keep the top item for even positions, use the second-best for odd positions
        const scenarioA_Modifications = (elementsPerSubsequence - topEvenRank.tally) + (elementsPerSubsequence - secondOddRank.tally);
        // Scenario B: Keep the top item for odd positions, use the second-best for even positions
        const scenarioB_Modifications = (elementsPerSubsequence - secondEvenRank.tally) + (elementsPerSubsequence - topOddRank.tally);
        
        requiredModifications = Math.min(scenarioA_Modifications, scenarioB_Modifications);
    }

    transmitResult(requiredModifications);
};

processSequence();