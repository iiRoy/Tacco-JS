function outputToConsole(message) {
  console.log(message);
}

function numericParser(value) {
  return Number(value);
}

function maximumOf(val1, val2) {
  return Math.max(val1, val2);
}


var recordedInputs = [ ];
var inputHandlerModule = require('readline');

var inputProcessor = inputHandlerModule.createInterface({
  input : process.stdin,
  output : process.stdout,
});

inputProcessor.on('line', function (currentText) {
  recordedInputs.push(currentText);
});

inputProcessor.on('close', function () {
  var quantityVal = numericParser(recordedInputs[0].split(" ")[0]);
  var paramAlpha = numericParser(recordedInputs[0].split(" ")[1]);
  var paramBeta = numericParser(recordedInputs[0].split(" ")[2]);
  var paramGamma = numericParser(recordedInputs[0].split(" ")[3]);
  var paramDelta = numericParser(recordedInputs[0].split(" ")[4]);

  var charArray = recordedInputs[1].split("");

  var conditionFulfilled = false;

  for (var loopIndex = 0; loopIndex < charArray.length; loopIndex++) {
    if (
      (charArray[loopIndex] === "#" && charArray[loopIndex + 1] === "#") &&
      paramAlpha <= loopIndex &&
      loopIndex + 1 <= maximumOf(paramGamma, paramDelta)
    ) {
      outputToConsole("No");
      return (0);
    }
    if (
      (charArray[loopIndex] === "." &&
        charArray[loopIndex + 1] === "." &&
        charArray[loopIndex + 2] === ".") &&
      paramBeta <= loopIndex + 1 &&
      loopIndex + 1 <= paramDelta
    ) {
      conditionFulfilled = true;
    }
  }

  if (
    paramDelta < paramGamma &&
    (charArray[paramBeta - 2] === "#" ||
      charArray[paramBeta] === "#" ||
      charArray[paramDelta - 2] === "#" ||
      charArray[paramDelta] === "#") &&
    conditionFulfilled === false
  ) {
    outputToConsole("No");
  } else {
    outputToConsole("Yes");
  }
});