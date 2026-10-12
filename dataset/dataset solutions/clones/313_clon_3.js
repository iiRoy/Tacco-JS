const fs = require("fs");
const lines = fs.readFileSync("/dev/stdin", "utf8").trim().split("\n");

const configuration = lines[0].split(" ").map(Number);
const scores = new Array(configuration[0]).fill(0);

let leader = {
  id: 0,
  score: 0,
};

function recalculateLeader(currentScores) {
  let bestId = 0;
  let bestScore = -Infinity;
  let position = 0;

  while (position < currentScores.length) {
    const candidateScore = currentScores[position];

    if (candidateScore > bestScore) {
      bestId = position;
      bestScore = candidateScore;
    }

    position += 1;
  }

  return {
    id: bestId,
    score: bestScore,
  };
}

for (const operationLine of lines.slice(1)) {
  const operation = operationLine.split(" ").map(Number);
  const playerId = operation[0] - 1;
  const scoreChange = operation[1];

  scores[playerId] = scores[playerId] + scoreChange;

  const updatedCurrentLeader = playerId === leader.id;
  const leaderCannotChange =
    (updatedCurrentLeader && scoreChange >= 0) ||
    (!updatedCurrentLeader && scoreChange < 0);

  if (leaderCannotChange) {
    if (updatedCurrentLeader) {
      leader.score = leader.score + scoreChange;
    }
  } else {
    leader = recalculateLeader(scores);
  }

  console.log(`${leader.id + 1} ${leader.score}`);
}