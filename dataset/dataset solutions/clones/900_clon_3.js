process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(dataBlock) {
  const NORTH_DIRECTION_CODE = '0';
  const WEST_DIRECTION_CODE = '1';
  const BASE_ANGULAR_UNIT = 90;
  const TERMINATION_SYMBOL = "#";

  let allInputSegments = dataBlock.split("\n");
  let totalSegmentCount = allInputSegments.length;

  const sanitizeAndNormalizeDirections = (rawSegment) => {
    let interimSegment = rawSegment.replace(/north/g, NORTH_DIRECTION_CODE);
    interimSegment = interimSegment.replace(/west/g, WEST_DIRECTION_CODE);
    return interimSegment;
  };

  for (let segmentIterator = 0; segmentIterator < totalSegmentCount; segmentIterator++) {
    let currentDataSegment = allInputSegments[segmentIterator];

    if (currentDataSegment.trim() === TERMINATION_SYMBOL) {
      break;
    }

    // Skip processing for empty or whitespace-only lines
    if (currentDataSegment.trim().length === 0) {
      continue;
    }

    let processedDirectionString = sanitizeAndNormalizeDirections(currentDataSegment);

    let calculatedAngularValue = 0;

    let stringLengthIndicator = processedDirectionString.length;
    let currentReductionPower = stringLengthIndicator - 1;
    let angularUpperBoundary = BASE_ANGULAR_UNIT * (1 << currentReductionPower); // 1 << N is equivalent to Math.pow(2, N)

    // The loop iterates from stringLengthIndicator down to 0,
    // which means the first iteration will access an undefined character (index == length).
    // This behavior is preserved from the original code.
    for (let exponentIndex = stringLengthIndicator; exponentIndex >= 0; exponentIndex--) {
      const termWeight = BASE_ANGULAR_UNIT * (1 << exponentIndex);

      // parseInt(char, 10) returns 1 for '1', 0 for '0', and NaN for undefined.
      // NaN and 0 are falsy, 1 is truthy.
      if (parseInt(processedDirectionString[exponentIndex], 10)) {
        // Condition for adding the term
        if (calculatedAngularValue < angularUpperBoundary) {
          calculatedAngularValue += termWeight;
        }
      } else {
        // Condition for subtracting the term
        if (calculatedAngularValue > 0) {
          calculatedAngularValue -= termWeight;
        }
      }
    }

    // Reduce the fraction by dividing both numerator (angle) and denominator (2^power) by 2
    // as long as the angle is even and the power is positive.
    while (currentReductionPower > 0 && !(calculatedAngularValue & 1)) { // !(value & 1) is a bitwise check for evenness
      calculatedAngularValue >>= 1; // Equivalent to calculatedAngularValue = calculatedAngularValue / 2
      currentReductionPower--;
    }

    // Output the final result, either as a fraction or a whole number.
    if (currentReductionPower > 0) {
      console.log(`${calculatedAngularValue}/${(1 << currentReductionPower)}`);
    } else {
      console.log(calculatedAngularValue);
    }
  }
});