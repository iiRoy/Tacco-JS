function processInputData(rawData) {
  const lineSeparator = '\n';
  var dataRows = rawData.split(lineSeparator);

  var totalSum = 0;
  const MAX_LINES_TO_PROCESS = 10;

  for (var currentIdx = 0; currentIdx < MAX_LINES_TO_PROCESS; ++currentIdx) {
    var currentLineContent = dataRows[currentIdx];

    if (currentLineContent === "\n") {
      break;
    }

    var numericValue = parseInt(currentLineContent);
    totalSum += numericValue;
  }
  console.log(totalSum);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
