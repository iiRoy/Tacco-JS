function processInputData(rawInputString) {
  const BREAK_SENTINEL_VALUE = "\n";
  var inputLineSegments = rawInputString.split('\n');
  var cumulativeSum = 0;

  for (let currentSegmentIndex = 0; currentSegmentIndex < inputLineSegments.length; currentSegmentIndex++) {
    let currentLineContent = inputLineSegments[currentSegmentIndex];

    if (currentLineContent === BREAK_SENTINEL_VALUE) {
      break;
    }

    let parsedNumericValue = parseInt(currentLineContent);
    cumulativeSum += parsedNumericValue;
  }
  console.log(cumulativeSum);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
