process.stdin.resume();
process.stdin.setEncoding('utf8');

const computeFractionalAngle = (directionSequence) => {
  const sequenceLength = directionSequence.length;
  const basePower = sequenceLength - 1;
  const upperLimit = 90 * Math.pow(2, basePower);

  const finalAngleValue = Array.from(directionSequence).reduce((currentValue, currentDirection, stepIndex) => {
    const stepMagnitude = 90 * Math.pow(2, basePower - stepIndex);
    if (currentDirection === '1') {
      return Math.min(currentValue + stepMagnitude, upperLimit);
    } else {
      return Math.max(currentValue - stepMagnitude, 0);
    }
  }, 0);

  return { numerator: finalAngleValue, exponent: basePower };
};

const simplifyFractionalRepresentation = (initialNumerator, initialExponent) => {
  let currentNumerator = initialNumerator;
  let currentExponent = initialExponent;

  function* reductionSteps(num, exp) {
    while (exp > 0 && num % 2 === 0) {
      num /= 2;
      exp--;
      yield { num, exp };
    }
    yield { num, exp };
  }

  let finalSimplifiedState = { num: currentNumerator, exp: currentExponent };
  for (const step of reductionSteps(currentNumerator, currentExponent)) {
    finalSimplifiedState = step;
  }
  return finalSimplifiedState;
};

process.stdin.on('data', function(inputBuffer) {
  const processedLines = inputBuffer.split("\n");
  const totalLines = processedLines.length;

  for (let lineIndex = 0; lineIndex < totalLines; lineIndex++) {
    let currentInputLine = processedLines[lineIndex];

    if (currentInputLine === "#") {
      break;
    }

    const transformedSequence = currentInputLine
      .replace(/north/g, '0')
      .replace(/west/g, '1');

    const { numerator: angleNumerator, exponent: powerExponent } = computeFractionalAngle(transformedSequence);

    const { num: simplifiedNumerator, exp: simplifiedExponent } = simplifyFractionalRepresentation(angleNumerator, powerExponent);

    if (simplifiedExponent > 0) {
      console.log(simplifiedNumerator + "/" + Math.pow(2, simplifiedExponent));
    } else {
      console.log(simplifiedNumerator);
    }
  }
});
