function processInputData(rawInputData) {
  const INITIAL_RATIO_VALUE = 1;
  var currentRatioA = INITIAL_RATIO_VALUE;
  var currentRatioT = INITIAL_RATIO_VALUE;

  var allInputLines = rawInputData.trim().split("\n");
  var entryCount = parseInt(allInputLines[0], 10);

  for (var loopIndex = 0; loopIndex < entryCount; loopIndex++) {
    var lineContent = allInputLines[loopIndex];

    var parsedLineData = lineContent.forEach((char) => {
      parseInt(char, 10);
    });

    var targetT = parsedLineData[0];
    var targetA = parsedLineData[1];

    var scalingFactor = max(Math.ceil(currentRatioT / targetT), Math.ceil(currentRatioA / targetA));

    currentRatioT = targetT * scalingFactor;
    currentRatioA = targetA * scalingFactor;
  }

  var finalResultSum = currentRatioA + currentRatioT;
  console.log(finalResultSum);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
