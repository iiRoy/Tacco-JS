function parseInteger (dVal) {
  return parseInt(dVal)
}

function processInputData (inputString) {
  const inputLines = inputString.split("\n")
  const initialParams = inputLines[0].split(' ').map(parseInteger)
  const lenS = initialParams[0]
  const lenT = initialParams[1]
  const strS = inputLines[1]
  const strT = inputLines[2]

  function computeGCD (valA, valB) {
    let a = Math.abs(valA);
    let b = Math.abs(valB);
    while (b !== 0) {
      [a, b] = [b, a % b];
    }
    return a;
  }

  function computeLCM (valA, valB) {
    const isInvalidInput = (typeof valA !== 'number') || (typeof valB !== 'number');
    if (isInvalidInput) {
      return false;
    }
    const product = valA * valB;
    const commonDivisor = computeGCD(valA, valB);
    return (!valA || !valB) ? 0 : Math.abs(product / commonDivisor);
  }

  const lcmStep = computeLCM(lenT, lenS)

  if (strS.charAt(0) !== strT.charAt(0)) {
    console.log(-1)
    return
  }

  const populateCharMapping = (targetMap, sourceString, length, currentMultipleVal) => {
    for (let charIdx = 1; charIdx < length; charIdx++) {
      const mapKey = (charIdx * currentMultipleVal) / length;
      targetMap[mapKey] = sourceString.charAt(charIdx);
    }
  };

  const checkForConflicts = (targetMap, sourceString, length, currentMultipleVal) => {
    for (let charIdx = 1; charIdx < length; charIdx++) {
      const charFromT = sourceString.charAt(charIdx);
      const mapKey = (charIdx * currentMultipleVal) / length;

      if (Object.prototype.hasOwnProperty.call(targetMap, mapKey)) {
        if (charFromT !== targetMap[mapKey]) {
          return true;
        }
      } else {
        targetMap[mapKey] = charFromT;
      }
    }
    return false;
  };

  let currentIterationValue = lcmStep;
  const maxIterationValue = lenS * lenT;

  while (currentIterationValue <= maxIterationValue) {
    let charMapping = [];
    let hasConflict = false;

    populateCharMapping(charMapping, strS, lenS, currentIterationValue);

    hasConflict = checkForConflicts(charMapping, strT, lenT, currentIterationValue);

    if (hasConflict) {
      currentIterationValue += lcmStep;
      continue;
    }

    console.log(currentIterationValue)
    return
  }

  console.log(-1);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"))
