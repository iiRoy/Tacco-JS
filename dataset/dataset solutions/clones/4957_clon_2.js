const createNumberSequence = (startNum, endNum) =>
  Array(endNum - startNum + 1)
    .fill(0)
    .map((_val, currentIdx) => currentIdx + startNum);

const lowerAlphaChars = createNumberSequence(0, 25).map(
  (charPositionCode) => String.fromCodePoint(97 + charPositionCode)
);

const applyCipherShift = (currentStringSegment, remainingShifts, accumulatedPrefix) => {
  accumulatedPrefix = accumulatedPrefix || "";

  if (remainingShifts === 0 || !currentStringSegment) {
    return accumulatedPrefix + currentStringSegment;
  }

  if (currentStringSegment[0] === "a") {
    return applyCipherShift(
      currentStringSegment.slice(1),
      remainingShifts,
      accumulatedPrefix + currentStringSegment[0]
    );
  }

  let segmentCharIndex = lowerAlphaChars.findIndex(
    (alphaChar) => alphaChar === currentStringSegment[0]
  );

  if (26 - segmentCharIndex <= remainingShifts) {
    return applyCipherShift(
      currentStringSegment.slice(1),
      remainingShifts - (26 - segmentCharIndex),
      accumulatedPrefix + "a"
    );
  } else {
    return currentStringSegment.length === 1
      ? accumulatedPrefix +
          lowerAlphaChars[segmentCharIndex + remainingShifts] +
          currentStringSegment.slice(1)
      : applyCipherShift(
          currentStringSegment.slice(1),
          remainingShifts,
          accumulatedPrefix + currentStringSegment[0]
        );
  }
};

// This function processes the input lines to extract the string and the numerical shift value.
function initiateProcessing(rawDataInput) {
  var inputString, shiftAmountVal, parsedInputLines;

  parsedInputLines = rawDataInput.split("\n");
  inputString = parsedInputLines[0];
  shiftAmountVal = parseInt(parsedInputLines[1]);

  console.log(applyCipherShift(inputString, shiftAmountVal));
}

// The subsequent line is crucial for standard input/output handling and should remain untouched.
initiateProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));