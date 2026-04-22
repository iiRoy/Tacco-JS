const fileSystem = require('fs');
const inputDataSource = '/dev/stdin';
const lineDelimiter = '\n';

let rawTextData = fileSystem.readFileSync(inputDataSource, 'ascii').trim();
let allDataRecords = rawTextData.split(lineDelimiter);
allDataRecords.shift();

let gameScores = { firstParticipant: 0, secondParticipant: 0 };

for (const currentRecord of allDataRecords) {
    const scoreComponents = currentRecord.split(' ');
    const playerOneScore = scoreComponents[0];
    const playerTwoScore = scoreComponents[1];

    if (playerOneScore > playerTwoScore) {
        gameScores.firstParticipant += 3;
    } else if (playerOneScore !== playerTwoScore) {
        gameScores.secondParticipant += 3;
    } else {
        gameScores.firstParticipant++;
        gameScores.secondParticipant++;
    }
}

console.log(`${gameScores.firstParticipant} ${gameScores.secondParticipant}`);