function processInputData(rawInputString) {
  const SPACE_DELIMITER = ' ';
  const stringParts = rawInputString.split(SPACE_DELIMITER);
  const numericValues = stringParts.map(strNum => Number(strNum));

  const referencePoint = numericValues[0];
  const pointAlpha = numericValues[1];
  const pointBeta = numericValues[2];

  const distanceToAlpha = Math.abs(referencePoint - pointAlpha);
  const distanceToBeta = Math.abs(referencePoint - pointBeta);

  if (distanceToAlpha > distanceToBeta) {
    console.log('B');
  } else {
    console.log('A');
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
