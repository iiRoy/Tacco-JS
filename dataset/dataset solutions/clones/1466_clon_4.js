function ComputeGameTally(gameInputText) {
    const allNumbers = gameInputText.trim().match(/\d+/g).map(Number);
    const numberOfContests = allNumbers[0];
    const contestCards = allNumbers.slice(1);

    let scoreAccumulator = { playerOne: 0, playerTwo: 0 };

    const scoringRules = new Map([
        [0, [1, 1]],
        [-1, [0, 3]],
        [1, [3, 0]]
    ]);

    let offsetPosition = 0;
    while (offsetPosition < numberOfContests * 2) {
        const p1Card = contestCards[offsetPosition];
        const p2Card = contestCards[offsetPosition + 1];

        const outcomeKey = Math.sign(p1Card - p2Card);
        const [pointsP1, pointsP2] = scoringRules.get(outcomeKey);

        scoreAccumulator.playerOne += pointsP1;
        scoreAccumulator.playerTwo += pointsP2;

        offsetPosition += 2;
    }

    console.log(scoreAccumulator.playerOne + " " + scoreAccumulator.playerTwo);
}

const systemInputSource = require("fs");
const filePathIdentifier = "/dev/stdin";
const encodingFormat = "utf8";
const rawDataPayload = systemInputSource.readFileSync(filePathIdentifier, encodingFormat);

ComputeGameTally(rawDataPayload);