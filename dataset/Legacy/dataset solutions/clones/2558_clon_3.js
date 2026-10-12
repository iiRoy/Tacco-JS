const processInputData = (rawDataLines) => {
  const firstLineParts = rawDataLines[0].split(" ");
  var totalParticipants = parseInt(firstLineParts[0], 10);
  var winningThreshold = parseInt(firstLineParts[1], 10);
  var totalQueries = parseInt(firstLineParts[2], 10);

  var participantScores = {};
  const queryStartIdx = 1;
  for (var queryCounter = 0; queryCounter < totalQueries; queryCounter++) {
    var currentParticipantId = rawDataLines[queryStartIdx + queryCounter];
    participantScores[currentParticipantId] = (participantScores[currentParticipantId] || 0) + 1;
  }

  const initialScore = 0;
  for (var participantIndex = 1; participantIndex <= totalParticipants; participantIndex++) {
    const currentParticipantScore = participantScores[participantIndex] || initialScore;
    const scoreDifference = totalQueries - currentParticipantScore;
    const hasWon = scoreDifference < winningThreshold;
    console.log(hasWon ? "Yes" : "No");
  }
}

const readStandardInput = () => {
    return require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n");
};

processInputData(readStandardInput());
