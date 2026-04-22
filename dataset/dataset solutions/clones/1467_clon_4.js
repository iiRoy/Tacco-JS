const contestReader = require('readline');

let allMatchData = [];
let competitionInterface = contestReader.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

competitionInterface.on('line', (individualRecord) => {
    allMatchData.push(individualRecord);
});

competitionInterface.on('close', () => {
    const relevantRecords = allMatchData.slice(1); // Discard the initial line

    const scoreCalculator = (firstEntry, secondEntry) => {
        if (firstEntry === secondEntry) {
            return [1, 1]; // Both competitors get 1 point for a tie
        } else if (firstEntry > secondEntry) { // First competitor wins (string comparison)
            return [3, 0]; // First competitor gets 3 points
        } else { // Second competitor wins (string comparison)
            return [0, 3]; // Second competitor gets 3 points
        }
    };

    const finalStandings = relevantRecords.reduce((currentOverallScores, matchString) => {
        const individualGameEntries = matchString.split(" ");
        const pointsForThisMatch = scoreCalculator(
            individualGameEntries[0],
            individualGameEntries[1]
        );
        return [
            currentOverallScores[0] + pointsForThisMatch[0],
            currentOverallScores[1] + pointsForThisMatch[1]
        ];
    }, [0, 0]); // Initialize scores for two competitors

    console.log(finalStandings[0], finalStandings[1]);
});