const inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let collectedLines = [];
inputReader.on('line', (dataLine) => {
    collectedLines.push(dataLine);
});

inputReader.on('close', () => {
    processCompositionData(collectedLines);
});

function processCompositionData(sourceLines) {
    let currentLinePointer = 0;

    const getNextLine = () => sourceLines[currentLinePointer++].trim();
    const getNextInteger = () => parseInt(getNextLine(), 10);
    const getNextIntegerArray = () => getNextLine().split(' ').map(Number);

    const segmentCount = getNextInteger();
    const compositionSegments = [];
    for (let i = 0; i < segmentCount; i++) {
        const [minDuration, maxDuration, pointsValue] = getNextIntegerArray();
        compositionSegments.push({ minDuration: minDuration, maxDuration: maxDuration, value: pointsValue });
    }

    const queryCount = getNextInteger();
    const desiredTotalLengths = [];
    for (let i = 0; i < queryCount; i++) {
        desiredTotalLengths.push(getNextInteger());
    }

    const MAX_POSSIBLE_LENGTH = 393; 
    let currentMaxScores = new Array(MAX_POSSIBLE_LENGTH + 1).fill(0);

    for (const segment of compositionSegments) {
        let segmentMinLen = segment.minDuration;
        let segmentMaxLen = segment.maxDuration;
        let segmentScore = segment.value;

        let scoresAfterSegmentConsideration = [...currentMaxScores];

        for (let targetLen = 0; targetLen <= MAX_POSSIBLE_LENGTH; targetLen++) {
            // Option 1: Do not include the current segment. The score remains as it was from previous segments.
            // scoresAfterSegmentConsideration[targetLen] already holds currentMaxScores[targetLen]

            // Option 2: Include the current segment.
            // If this segment is included, it forms a piece of length X, where segmentMinLen <= X <= segmentMaxLen.
            // If the total targetLen is achieved, and this segment ends at targetLen,
            // then the previous portion ended at (targetLen - X).
            // So, (targetLen - segmentMaxLen) <= previousEnd <= (targetLen - segmentMinLen).

            let bestPrecedingScore = 0;
            const previousEndLowerBound = Math.max(0, targetLen - segmentMaxLen);
            const previousEndUpperBound = targetLen - segmentMinLen;

            // Only proceed if there's a valid range for the preceding segment
            if (previousEndUpperBound >= previousEndLowerBound) {
                for (let prevEnd = previousEndLowerBound; prevEnd <= previousEndUpperBound; prevEnd++) {
                    // This is the crucial part: the original code uses dp[i+1][k]
                    // This implies that the 'previous' portion (up to prevEnd)
                    // can itself include the CURRENT segment multiple times.
                    bestPrecedingScore = Math.max(bestPrecedingScore, scoresAfterSegmentConsideration[prevEnd]);
                }
                
                // If the target length is at least the minimum length of the current segment,
                // then we can potentially add this segment.
                if (targetLen >= segmentMinLen) {
                    scoresAfterSegmentConsideration[targetLen] = Math.max(
                        scoresAfterSegmentConsideration[targetLen],
                        bestPrecedingScore + segmentScore
                    );
                }
            }
        }
        currentMaxScores = scoresAfterSegmentConsideration;
    }

    let computationResults = [];
    let allQueriesSuccessful = true;
    for (const queryLength of desiredTotalLengths) {
        if (currentMaxScores[queryLength] === 0) {
            allQueriesSuccessful = false;
            break;
        }
        computationResults.push(currentMaxScores[queryLength]);
    }

    if (!allQueriesSuccessful) {
        console.log(-1);
    } else {
        computationResults.forEach(value => console.log(value));
    }
}