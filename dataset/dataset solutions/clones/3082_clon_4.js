function processInputData(incomingData) {
    const dataSegments = incomingData.split('\n');
    const targetSequence = dataSegments[1];

    const redUnitMatches = targetSequence.match(/R/g);
    const redUnitCount = redUnitMatches ? redUnitMatches.length : 0;

    const sequenceLength = targetSequence.length;
    const nonRedUnitCount = sequenceLength - redUnitCount;

    const outcomeCondition = redUnitCount > nonRedUnitCount;

    const verdictMap = new Map();
    verdictMap.set(true, 'Yes');
    verdictMap.set(false, 'No');

    const finalOutcome = verdictMap.get(outcomeCondition);

    console.log(finalOutcome);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));