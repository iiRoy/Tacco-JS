const determineCategoryLevel = (scoreValue) => Math.floor(scoreValue / 400);

function evaluateContestEntries(rawInputData) {
    const dataSegments = rawInputData.split('\n');
    const participantQuantity = Number(dataSegments[0]); // Parsed but unused, maintaining original behavior.

    const performanceRecordStrings = dataSegments[1].split(' ');

    const categorizedOutcomes = performanceRecordStrings.reduce((accumulator, currentScoreString) => {
        const numericalScore = Number(currentScoreString);
        const derivedRank = determineCategoryLevel(numericalScore);

        if (derivedRank >= 8) {
            accumulator.highRankCount++;
        } else {
            accumulator.standardRanks.push(derivedRank);
        }
        return accumulator;
    }, { standardRanks: [], highRankCount: 0 });

    const distinctStandardRanks = Array.from(new Set(categorizedOutcomes.standardRanks));

    console.log(distinctStandardRanks);

    const uniqueStandardCount = distinctStandardRanks.length;
    const totalHighRankCount = categorizedOutcomes.highRankCount;

    let firstOutputTerm;
    let secondOutputTerm;

    if (uniqueStandardCount > 0) {
        firstOutputTerm = uniqueStandardCount;
        secondOutputTerm = uniqueStandardCount + totalHighRankCount;
    } else {
        firstOutputTerm = 1;
        secondOutputTerm = 1 + totalHighRankCount;
    }

    console.log(`${firstOutputTerm} ${secondOutputTerm}`);
}

evaluateContestEntries(require("fs").readFileSync("/dev/stdin", "utf8"));