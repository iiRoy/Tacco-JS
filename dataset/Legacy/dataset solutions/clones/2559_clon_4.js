function processContestData(rawInput) {
  const lines = rawInput.split('\n');

  const [totalParticipants, defeatThreshold, totalContests] = lines[0].split(' ').map(Number);

  const participantScores = new Array(totalParticipants).fill(0);

  lines.slice(1, totalContests + 1).forEach(roundWinnerIdStr => {
    const winningParticipantId = parseInt(roundWinnerIdStr);
    participantScores[winningParticipantId - 1]++;
  });

  participantScores.forEach(victories => {
    const defeats = totalContests - victories;
    console.log(defeats >= defeatThreshold ? 'No' : 'Yes');
  });
}

processContestData(require("fs").readFileSync("/dev/stdin", "utf8"));
