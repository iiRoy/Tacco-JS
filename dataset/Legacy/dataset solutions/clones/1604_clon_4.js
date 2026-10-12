function processCoordinateMovement(inputDataString) {
  const cleanedInput = inputDataString.trim();
  const valueStrings = cleanedInput.split(" ");

  const currentX = parseInt(valueStrings[0]);
  const totalK = parseInt(valueStrings[1]);
  const stepD = parseInt(valueStrings[2]);

  const stepsTowardsZeroOrBeyond = Math.floor(currentX / stepD);
  const remainingSteps = totalK - stepsTowardsZeroOrBeyond;

  const effectiveSteps = (stepsTowardsZeroOrBeyond > totalK)
    ? totalK
    : (remainingSteps % 2 === 0 ? stepsTowardsZeroOrBeyond : stepsTowardsZeroOrBeyond + 1);

  const finalAbsoluteResult = Math.abs(currentX - stepD * effectiveSteps);
  console.log(finalAbsoluteResult);
}

processCoordinateMovement(require("fs").readFileSync("/dev/stdin", "utf8"));
