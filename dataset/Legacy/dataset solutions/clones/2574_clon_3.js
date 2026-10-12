function processInput(rawData) {
  const rawDataLines = rawData.split("\n");

  const parseNumArray = (lineString) => lineString.split(" ").map(Number);

  const numIterations = parseInt(rawDataLines[0], 10);

  const activityIndices = parseNumArray(rawDataLines[1]);

  const baseScores = parseNumArray(rawDataLines[2]);

  const bonusScores = parseNumArray(rawDataLines[3]);

  let totalScore = 0;

  for (let currentIndex = 0; currentIndex < numIterations; currentIndex++) {
    const currentActivityValue = activityIndices[currentIndex];
    const currentActivityZeroBasedIndex = currentActivityValue - 1;

    totalScore += baseScores[currentActivityZeroBasedIndex];

    if (currentIndex > 0) {
      const previousActivityValue = activityIndices[currentIndex - 1];
      if (currentActivityValue === previousActivityValue + 1) {
        const previousActivityZeroBasedIndex = previousActivityValue - 1;
        totalScore += bonusScores[previousActivityZeroBasedIndex];
      }
    }
  }

  console.log(totalScore);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
