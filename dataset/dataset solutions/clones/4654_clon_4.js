function processContestData(rawData) {
  const lineSegments = rawData.trim().split("\n");
  const groupCount = Number(lineSegments[0].trim());
  const strengthValues = lineSegments[1]
    .trim()
    .split(" ")
    .map(Number)
    .sort((first, second) => second - first);

  const finalScore = strengthValues
    .slice(0, 2 * groupCount)
    .reduce((accumulator, currentStrength, currentIdx) => {
      return currentIdx % 2 !== 0 ? accumulator + currentStrength : accumulator;
    }, 0);

  console.log(finalScore);
}

processContestData(require("fs").readFileSync("/dev/stdin", "utf8"));
