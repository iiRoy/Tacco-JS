const inputRouter = require('readline');
const dataStream = process.stdin;
const outputChannel = process.stdout;

const scoreTally = (gameSequence) => {
    const roundCount = Number(gameSequence[0]);
    const gameRounds = gameSequence.slice(1, 1 + roundCount);

    const initialTally = [0, 0];

    const finalTally = gameRounds.reduce((accumulatedTally, roundInfo) => {
        const contestants = roundInfo.split(/\s+/);
        const playerOneMark = contestants[0];
        const playerTwoMark = contestants[1];

        const outcomeKey = (playerOneMark === playerTwoMark) ? 0 : (playerOneMark > playerTwoMark) ? 1 : -1;
        const roundPoints = {
            '0': [1, 1],
            '1': [3, 0],
            '-1': [0, 3]
        }[outcomeKey];

        accumulatedTally[0] += roundPoints[0];
        accumulatedTally[1] += roundPoints[1];
        return accumulatedTally;
    }, initialTally);

    outputChannel.write(`${finalTally[0]} ${finalTally[1]}\n`);
};

const collectedSegments = [];

const readerInstance = inputRouter.createInterface({
    input: dataStream,
    output: outputChannel,
    terminal: false
});

readerInstance.on('line', (lineContent) => {
    collectedSegments.push(lineContent);
});

readerInstance.on('close', () => {
    scoreTally(collectedSegments);
});