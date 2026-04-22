const { createInterface: makeReader } = require("readline");

const interactionEngine = makeReader({
  input: process.stdin,
  output: process.stdout,
});

const acquireLine = () => {
  return new Promise((resolver) => {
    interactionEngine.once("line", resolver);
  });
};

async function processChallenge() {
  let totalCount = parseInt(await acquireLine(), 10);

  let sequenceOne = Array.from({ length: totalCount }, (_, pos) => pos + 1);

  process.stdout.write("? " + sequenceOne.join(" ") + "\n");

  let initialOracleResponse = await acquireLine();

  let divergencePoint = 1;

  for (;;) {
    sequenceOne[divergencePoint - 1] = divergencePoint + totalCount;
    process.stdout.write("? " + sequenceOne.join(" ") + "\n");

    let currentOracleResponse = await acquireLine();

    if (initialOracleResponse[0] !== currentOracleResponse[0]) {
      break;
    }
    divergencePoint++;
  }

  let finalCharacterSequence = new Array(2 * totalCount);
  let sequenceTwo = new Array(totalCount);
  let markerMap = {};

  for (let iter = 0; iter < totalCount - 1; iter++) {
    const valP = divergencePoint + iter;
    sequenceOne[iter] = valP;
    sequenceTwo[iter] = (valP + totalCount) % (2 * totalCount);
    markerMap[valP] = true;
  }

  for (let currentVal = 1; currentVal <= 2 * totalCount; currentVal++) {
    let queryArray;
    if (markerMap[currentVal]) {
      sequenceTwo[totalCount - 1] = currentVal;
      queryArray = sequenceTwo;
    } else {
      sequenceOne[totalCount - 1] = currentVal;
      queryArray = sequenceOne;
    }

    process.stdout.write("? " + queryArray.join(" ") + "\n");
    let responseForQuery = await acquireLine();

    finalCharacterSequence[currentVal - 1] = (responseForQuery[0] === "R") ? "R" : "B";
  }

  process.stdout.write("! " + finalCharacterSequence.join("") + "\n");

  interactionEngine.close();
}

processChallenge();