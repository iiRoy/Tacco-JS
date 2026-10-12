const fileSystem = require('fs');

const processGameSegments = (allLines, startIndex = 0) => {
    if (startIndex >= allLines.length) {
        return []; // Base case: no more lines to process
    }

    const segmentLengthIndicator = allLines[startIndex];
    const segmentLength = Number(segmentLengthIndicator);

    if (segmentLength === 0) {
        return []; // Base case: termination signal (0) encountered
    }

    const gameDataLines = allLines.slice(startIndex + 1, startIndex + 1 + segmentLength);

    const { firstPlayerAccumulatedScore, secondPlayerAccumulatedScore } = gameDataLines.reduce((accumulator, scorePairString) => {
        const [playerOneValue, playerTwoValue] = scorePairString.split(' ').map(Number);

        let currentRoundPlayerOnePoints = 0;
        let currentRoundPlayerTwoPoints = 0;

        if (playerOneValue > playerTwoValue) {
            currentRoundPlayerOnePoints = playerOneValue + playerTwoValue;
        } else if (playerOneValue < playerTwoValue) {
            currentRoundPlayerTwoPoints = playerOneValue + playerTwoValue;
        } else { // playerOneValue === playerTwoValue
            currentRoundPlayerOnePoints = playerOneValue;
            currentRoundPlayerTwoPoints = playerTwoValue;
        }

        return {
            firstPlayerAccumulatedScore: accumulator.firstPlayerAccumulatedScore + currentRoundPlayerOnePoints,
            secondPlayerAccumulatedScore: accumulator.secondPlayerAccumulatedScore + currentRoundPlayerTwoPoints
        };
    }, { firstPlayerAccumulatedScore: 0, secondPlayerAccumulatedScore: 0 });

    const currentSegmentOutput = `${firstPlayerAccumulatedScore} ${secondPlayerAccumulatedScore}`;

    // Recursively process the next segment of games
    const remainingSegmentOutputs = processGameSegments(allLines, startIndex + 1 + segmentLength);

    return [currentSegmentOutput, ...remainingSegmentOutputs];
};

const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const allInputLines = rawInputContent.trim().split('\n');

const finalOutputs = processGameSegments(allInputLines);

finalOutputs.forEach(outputLine => console.log(outputLine));
