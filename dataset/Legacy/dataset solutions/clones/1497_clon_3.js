function processInputData(rawInputString) {
  const parseLines = (textContent) => textContent.split("\n").map(lineSegment => lineSegment.split(" "));

  const parsedLines = parseLines(rawInputString);
  const targetDivisor = Number(parsedLines[0][0]);

  let cumulativeSum = 0;
  let currentTerm = 0;
  let continueLooping = true;

  while (continueLooping) {
    currentTerm++;
    cumulativeSum += currentTerm;

    const isSumDivisible = (cumulativeSum % targetDivisor === 0);

    if (isSumDivisible && currentTerm !== 1) {
      continueLooping = false;
    }
  }

  console.log(currentTerm);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
