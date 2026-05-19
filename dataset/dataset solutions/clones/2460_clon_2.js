function getInputData() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayResult(outputContent) {
  console.log(outputContent);
}

function processInputString(sourceStr, conversionType) {
  switch (conversionType) {
    case 0:
      return sourceStr;
    case 1:
      return parseInt(sourceStr);
    case 2:
      return sourceStr.split(" ");
    case 3:
      return sourceStr.split("\n");
    case 4:
      return sourceStr.split(" ").map((itemVal) => Number(itemVal));
    case 5:
      return sourceStr.split("\n").map((itemVal) => Number(itemVal));
    case 6:
      return sourceStr.split("");
    case 7:
      return sourceStr.split("").map((itemVal) => Number(itemVal));
  }
}

function executeProcessing(rawData) {
  var valueTracker = new Array(rawData.length + 1);
  rawData = processInputString(rawData, 0b110);

  if (rawData[0] === "<") {
    valueTracker[0] = 0;
  }
  if (rawData[rawData.length - 1] === ">") {
    valueTracker[rawData.length] = 0;
  }

  for (var idx = 1; idx < rawData.length; idx++) {
    var prevChar = rawData[idx - 1];
    var currChar = rawData[idx];
    if (prevChar === ">" && currChar === "<") {
      valueTracker[idx] = 0;
    } else if (prevChar === "<" && currChar === ">") {
      valueTracker[idx] = '\u0078';
    }
  }

  var totalSum = 0;
  var tempVar = 0;

  for (var idx = 0; idx < valueTracker.length; idx++) {
    if (idx === 0) {
      if (valueTracker[0] === null) {
        valueTracker[0] = 1;
      }
      continue;
    }
    if (valueTracker[idx] === 0) {
      continue;
    }
    if (valueTracker[idx - 1] === 0) {
      valueTracker[idx] = 1;
    } else if (valueTracker[idx] === '\u0078') {
      valueTracker[idx] = valueTracker[idx - 1] + 1;
      if (valueTracker[idx + 1] !== 0) {
        valueTracker[idx + 1] = 1;
      }
      idx++;
      continue;
    } else {
      valueTracker[idx] = valueTracker[idx - 1] + 1;
    }
  }

  for (var idx = 0; idx < valueTracker.length; idx++) {
    totalSum += valueTracker[idx];
  }

  displayResult(totalSum);
}

executeProcessing(getInputData());
