function processInput(rawData) {
  const inputLines = rawData.split("\n");
  const charSequence = inputLines[0].split("");
  const multiplierValue = Number(inputLines[1]);

  const adjacentMatchCount = Array.from({ length: Math.max(0, charSequence.length - 1) }, (_, index) => index)
    .reduce((accumulator, currentPosition) => {
      return accumulator + (charSequence[currentPosition] === charSequence[currentPosition + 1] ? 1 : 0);
    }, 0);

  let finalTally = adjacentMatchCount * multiplierValue;

  if (charSequence[0] === charSequence[charSequence.length]) {
    finalTally += multiplierValue - 1;
  }

  console.log(finalTally);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
