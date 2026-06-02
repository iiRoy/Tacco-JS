function processInputData(rawData) {
  const inputLines = rawData.split("\n");

  const totalElementsStr = inputLines[0];
  const rabbitConnectionsString = inputLines[1];

  const connectionTargets = rabbitConnectionsString.split(" ").map(item => Number(item));

  let detectedPairCount = 0;

  const isReciprocalPair = (sourceIndex, targetValue, connectionsList) => {
    const potentialReciprocalIndex = targetValue - 1;
    const expectedReciprocalValue = sourceIndex + 1;

    if (potentialReciprocalIndex >= 0 && potentialReciprocalIndex < connectionsList.length) {
      return connectionsList[potentialReciprocalIndex] === expectedReciprocalValue;
    }
    return false;
  };

  for (let currentIdx = 0; currentIdx < connectionTargets.length; currentIdx++) {
    const currentRabbitTarget = connectionTargets[currentIdx];

    if (isReciprocalPair(currentIdx, currentRabbitTarget, connectionTargets)) {
      detectedPairCount++;
    }
  }

  console.log(detectedPairCount / 2);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
