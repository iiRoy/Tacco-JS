function processInputData(sourceText) {
  const textLength = sourceText.length;
  const isLengthEven = (textLength % 2 === 0);

  if (isLengthEven) {
    console.log("No");
    return;
  }

  let finalOutcome = "Yes";
  const searchPattern = "hi";
  const loopStep = 2;
  let patternDetected = false;

  const doesPatternExistAtOffset = (textSegment, patternToFind, startOffset) => {
    return textSegment.indexOf(patternToFind, startOffset) !== -1;
  };

  for (let currentPosition = 0; currentPosition < textLength; currentPosition += loopStep) {
    if (doesPatternExistAtOffset(sourceText, searchPattern, currentPosition)) {
      patternDetected = true;
      break;
    }
  }

  if (patternDetected) {
    finalOutcome = "No";
  }

  console.log(finalOutcome);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
