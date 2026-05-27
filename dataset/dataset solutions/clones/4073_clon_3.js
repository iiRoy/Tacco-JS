function processTravelSequence(rawInputData) {
    const inputLines = rawInputData.split("\n");

    const totalEntries = parseInt(inputLines[0], 10);
    const sequenceRecords = inputLines.slice(1, totalEntries + 1);

    let anySegmentValid = false;

    for (let segmentIndex = 0; segmentIndex < totalEntries - 1; segmentIndex++) {
        const prevEntryData = parseTravelEntry(sequenceRecords[segmentIndex]);
        const currEntryData = parseTravelEntry(sequenceRecords[segmentIndex + 1]);

        const prevTime = prevEntryData.time;
        const prevX = prevEntryData.x;
        const prevY = prevEntryData.y;

        const currTime = currEntryData.time;
        const currX = currEntryData.x;
        const currY = currEntryData.y;

        const timeElapsed = currTime - prevTime;

        const prevCoordSum = prevX + prevY;
        const currCoordSum = currX + currY;
        const manhattanDistance = Math.abs(currCoordSum - prevCoordSum);

        const isDistancePossible = manhattanDistance <= timeElapsed;
        const hasConsistentParity = (manhattanDistance % 2) === (timeElapsed % 2);

        if (isDistancePossible && hasConsistentParity) {
            anySegmentValid = true;
        }
    }

    const outcomeMessage = anySegmentValid ? "YES" : "NO";
    console.log(outcomeMessage);
}

function parseTravelEntry(entryString) {
    const entryParts = entryString.split(" ");
    const parsedTime = parseInt(entryParts[0], 10);
    const parsedX = parseInt(entryParts[1], 10);
    const parsedY = parseInt(entryParts[2], 10);
    return { time: parsedTime, x: parsedX, y: parsedY };
}

processTravelSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
