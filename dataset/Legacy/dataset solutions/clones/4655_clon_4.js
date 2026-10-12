function ProcessInput(sourceData) {
  const dataLines = sourceData.split('\n');
  const groupCount = Number(dataLines[0].trim());
  const scoreCollection = dataLines[1].trim().split(' ').map(Number).sort((valA, valB) => valB - valA);

  const cumulativeScore = Array.from({ length: groupCount }, (_, idx) => scoreCollection[2 * (idx + 1)])
                               .reduce((accumulator, currentScore) => accumulator + currentScore, 0);

  console.log(cumulativeScore);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
