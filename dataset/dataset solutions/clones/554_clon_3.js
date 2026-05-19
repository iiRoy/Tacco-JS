const parseNumericLine = (lineContent) => {
  return lineContent.split(" ").map(Number);
};

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

const inputLinesArray = rawInputData.trim().split("\n");

let currentLineIndex = 0;

while (true) {
  const configLine = inputLinesArray[currentLineIndex++];
  const [numContestants, numRounds] = parseNumericLine(configLine);

  if (numContestants === 0 && numRounds === 0) {
    break;
  }

  const allContestantScores = [];
  for (let roundParticipantId = 1; roundParticipantId <= numRounds; roundParticipantId++) {
    allContestantScores.push([roundParticipantId, 0]);
  }

  for (let roundIteration = 0; roundIteration < numContestants; roundIteration++) {
    const scoresForThisRoundLine = inputLinesArray[currentLineIndex++];
    const currentRoundScores = parseNumericLine(scoresForThisRoundLine);

    currentRoundScores.forEach((scoreValue, participantIndex) => {
      allContestantScores[participantIndex][1] += scoreValue;
    });
  }

  allContestantScores.sort((participantA, participantB) => {
    const scoreOfA = participantA[1];
    const scoreOfB = participantB[1];
    const idOfA = participantA[0];
    const idOfB = participantB[0];

    if (scoreOfA !== scoreOfB) {
      return scoreOfB - scoreOfA;
    }
    return idOfA - idOfB;
  });

  const rankedContestantIds = allContestantScores.map(participant => participant[0]);

  console.log(rankedContestantIds.join(" "));
}
