function processGameData(rawData) {
    const lines = rawData.trim().split('\n');

    const parseNumericLine = (lineContent) => lineContent.split(' ').map(Number);

    const gameParameters = parseNumericLine(lines[0]);
    const movePointValues = parseNumericLine(lines[1]);
    const opponentHandSequence = [...lines[2]];

    const blockDistance = gameParameters[1];

    const winningMoveScores = new Map([
        ['r', movePointValues[2]], // Player plays paper (P) to beat rock
        ['s', movePointValues[0]], // Player plays rock (R) to beat scissors
        ['p', movePointValues[1]]  // Player plays scissors (S) to beat paper
    ]);

    const initialMoveScores = opponentHandSequence.map(char => winningMoveScores.get(char));

    const finalScoresAccumulator = [...initialMoveScores];

    for (let sequenceOffset = 0; sequenceOffset < blockDistance; sequenceOffset++) {
        for (let currentPosition = sequenceOffset; currentPosition < finalScoresAccumulator.length - blockDistance; currentPosition += blockDistance) {
            if (finalScoresAccumulator[currentPosition] === finalScoresAccumulator[currentPosition + blockDistance]) {
                finalScoresAccumulator[currentPosition + blockDistance] = 0;
            }
        }
    }

    const totalGameScore = finalScoresAccumulator.reduce((sum, value) => sum + value, 0);

    console.log(totalGameScore);
}

processGameData(require("fs").readFileSync("/dev/stdin", "utf8"));
