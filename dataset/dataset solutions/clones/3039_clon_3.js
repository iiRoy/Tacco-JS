var processInputData = rawInputString => {
  var parsedLines = rawInputString.split('\n');

  var targetLength = parseInt(parsedLines[0], 10);
  var inputString = parsedLines[1];

  var periodCount = 0;
  var hashMarkCount = 0;

  for (var charIndex = 0; charIndex <= targetLength; charIndex++) {
    var currentChar = inputString[charIndex];

    if (currentChar === ".") {
      periodCount++;
    }
    if (currentChar === "#") {
      hashMarkCount++;
    }
  }

  var finalResult;
  if (periodCount > hashMarkCount) {
    finalResult = hashMarkCount;
  } else {
    finalResult = periodCount;
  }
  console.log(finalResult);
};

processInputData(require("fs").readFileSync("/dev/stdin", "UTF-8"));
