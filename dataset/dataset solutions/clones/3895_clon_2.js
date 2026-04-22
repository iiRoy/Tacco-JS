const processInputData = sourceContent => {
  const parsedLines = sourceContent.  trim()
                                .split('\n');

  const [
    maxBoundary,
    markerQuantity,
    initialPosition
  ] = parsedLines[0].split(' ')
                     .map(valueStr => parseInt(valueStr, 10));

  const levelIndicators = Array(maxBoundary + 1);

  const markedLocations = parsedLines[1].split(' ')
                                        .map(valStr => parseInt(valStr, 10));

  let backwardExpenses = 0;
  for (  let currentLevelBackward = initialPosition - 1;
         currentLevelBackward > 0;
         currentLevelBackward--
  ) {
    if (markedLocations.includes(currentLevelBackward)) {
      backwardExpenses++;
    }
  }

  let forwardCharges = 0;
  for ( let currentLevelForward = initialPosition;
        currentLevelForward < maxBoundary;
        currentLevelForward++
  ) {
    if (markedLocations.includes(currentLevelForward)) {
      forwardCharges++;
    }
  }

  console.log(Math.min(backwardExpenses, forwardCharges));
};


// Acquire input from the standard stream
processInputData(require("node:fs").readFileSync("/proc/self/fd/0", "utf8"));