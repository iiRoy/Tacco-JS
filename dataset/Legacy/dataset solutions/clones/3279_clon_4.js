function processDimensions(rawInput) {
  const numericValues = rawInput.match(/\d+/g).map(val => Number(val));

  const boardDimension = numericValues[0];
  const verticalExclusion = numericValues[1];
  const horizontalExclusion = numericValues[2];

  const adjustedDimension = boardDimension + 1;
  const termOne = adjustedDimension * adjustedDimension;
  const termTwo = adjustedDimension * horizontalExclusion;
  const termThree = verticalExclusion * adjustedDimension;
  const termFour = verticalExclusion * horizontalExclusion;

  const finalResult = termOne - termTwo - termThree + termFour;

  console.log(finalResult);
}

processDimensions(require("fs").readFileSync("/dev/stdin", "utf8"));
