const fs = require("fs");

const source = fs.readFileSync("/dev/stdin", "utf8");
const entries = source.trim().split("\n");
const TURN_LIMIT = 1000000;

function addStonesInBlock(owned, firstPlayer, stones, players) {
  const fullRounds = Math.floor(stones / players);
  const extra = stones % players;

  if (fullRounds > 0) {
    for (let k = 0; k < players; k++) {
      owned[k] += fullRounds;
    }
  }

  for (let k = 0; k < extra; k++) {
    owned[(firstPlayer + k) % players]++;
  }

  return (firstPlayer + stones - 1) % players;
}

function solveCase(line) {
  const values = line.split(" ").map(Number);
  const players = values[0];
  let bowl = values[1];
  const originalStoneCount = bowl;

  const owned = Array(players).fill(0);
  let cursor = 0;
  let consumedTurns = 0;

  while (consumedTurns < TURN_LIMIT) {
    if (bowl > 0) {
      const remainingTurns = TURN_LIMIT - consumedTurns;

      if (bowl > remainingTurns) {
        addStonesInBlock(owned, cursor, remainingTurns, players);
        consumedTurns = TURN_LIMIT;
        break;
      }

      const lastReceiver = addStonesInBlock(owned, cursor, bowl, players);
      consumedTurns += bowl;
      cursor = (cursor + bowl) % players;
      bowl = 0;

      if (owned[lastReceiver] === originalStoneCount) {
        return String(lastReceiver);
      }
    } else {
      bowl = owned[cursor];
      owned[cursor] = 0;
      cursor = (cursor + 1) % players;
      consumedTurns++;
    }
  }

  return null;
}

let output = [];

for (let idx = 0; idx < entries.length; idx++) {
  const line = entries[idx];

  if (line === "0 0") {
    break;
  }

  const answer = solveCase(line);

  if (answer !== null) {
    output.push(answer);
  }
}

if (output.length > 0) {
  console.log(output.join("\n"));
}