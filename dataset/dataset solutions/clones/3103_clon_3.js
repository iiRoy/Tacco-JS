const parseNumericLine = (lineContent) => lineContent.split(" ").map(Number);

function processInput(rawData) {
    const TARGET_SEQUENCE = "AC";

    let allInputLines = rawData.split("\n");

    const _discardedFirstLine = allInputLines.shift();

    const mainSearchString = allInputLines.shift();

    const queryDefinitions = allInputLines.map(parseNumericLine);

    for (let queryIndex = 0; queryIndex < queryDefinitions.length; queryIndex++) {
        const currentQuery = queryDefinitions[queryIndex];

        const substringStartIdx = currentQuery[0] - 1;
        const substringEndIdx = currentQuery[1];

        const segmentToAnalyze = mainSearchString.substring(substringStartIdx, substringEndIdx);

        const partsAfterSplit = segmentToAnalyze.split(TARGET_SEQUENCE);
        const occurrenceCount = partsAfterSplit.length - 1;

        console.log(occurrenceCount);
    }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
