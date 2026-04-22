function processMovement(rawInputData) {
  const parsedValues = rawInputData.trim().split(/\s+/).map(Number);

  const initialPoint = parsedValues[0];
  const maxSteps = parsedValues[1];
  const moveIncrement = parsedValues[2];

  const idealOffset = -initialPoint / moveIncrement;

  const offsetFloor = Math.floor(idealOffset);
  const offsetCeil = Math.ceil(idealOffset);

  const requiredParity = Math.abs(maxSteps % 2);

  const adjustForParity = (currentOffset, targetIdeal) => {
    if (Math.abs(currentOffset % 2) === requiredParity) {
      return currentOffset;
    }

    const optionPlusOne = currentOffset + 1;
    const optionMinusOne = currentOffset - 1;

    const validOptions = [];
    if (Math.abs(optionPlusOne % 2) === requiredParity) {
      validOptions.push(optionPlusOne);
    }
    if (Math.abs(optionMinusOne % 2) === requiredParity) {
      validOptions.push(optionMinusOne);
    }

    if (validOptions.length === 2) {
      return (Math.abs(targetIdeal - validOptions[0]) < Math.abs(targetIdeal - validOptions[1])) ? validOptions[0] : validOptions[1];
    } else if (validOptions.length === 1) {
      return validOptions[0];
    }
    return currentOffset;
  };

  const candidateOffsetA = adjustForParity(offsetFloor, idealOffset);
  const candidateOffsetB = adjustForParity(offsetCeil, idealOffset);

  let bestOffset = null;
  let smallestMagnitude = Infinity;

  if (Math.abs(candidateOffsetA) <= maxSteps) {
    const valueA = Math.abs(initialPoint + candidateOffsetA * moveIncrement);
    smallestMagnitude = valueA;
    bestOffset = candidateOffsetA;
  }

  if (Math.abs(candidateOffsetB) <= maxSteps) {
    const valueB = Math.abs(initialPoint + candidateOffsetB * moveIncrement);
    if (valueB < smallestMagnitude) {
      smallestMagnitude = valueB;
      bestOffset = candidateOffsetB;
    }
  }

  if (bestOffset === null) {
    let boundOffsetPositive = maxSteps;
    if (Math.abs(boundOffsetPositive % 2) !== requiredParity) {
      boundOffsetPositive -= 1;
    }
    const valueAtBoundP = Math.abs(initialPoint + boundOffsetPositive * moveIncrement);

    let boundOffsetNegative = -maxSteps;
    if (Math.abs(boundOffsetNegative % 2) !== requiredParity) {
      boundOffsetNegative += 1;
    }
    const valueAtBoundN = Math.abs(initialPoint + boundOffsetNegative * moveIncrement);

    smallestMagnitude = Math.min(valueAtBoundP, valueAtBoundN);
  }

  const finalOutcome = smallestMagnitude;
  return finalOutcome;
}

const executeProgram = (data) => {
  console.log(processMovement(data));
};

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));