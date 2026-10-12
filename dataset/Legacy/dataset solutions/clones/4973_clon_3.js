function computePatternSum() {
  const argCount = arguments.length;
  if (argCount === 1) {
    return arguments[0];
  }

  const initialMultiplier = Math.ceil(Math.pow(argCount - 1, 2) / 2);
  let weightFactor = 2;
  let currentSum = 0;

  for (const numVal of arguments) {
    currentSum += weightFactor * numVal;
    weightFactor = weightFactor * 5 + 1;
  }

  return initialMultiplier * currentSum;
}

function getReversedString(originalStr) {
  const charCollector = [];
  for (let idx = originalStr.length - 1; idx >= 0; idx--) {
    charCollector.push(originalStr[idx]);
  }
  return charCollector.join('');
}

function processInputDigits(inputString) {
  const charArray = inputString.split('');
  const parsedNumbers = charArray.map(char => parseInt(char, 10));
  return parsedNumbers;
}

process.stdin.resume();
process.stdin.setEncoding("UTF-8");
process.stdin.on("data", function(receivedInputChunk) {
  const reversedInput = getReversedString(receivedInputChunk);
  const numericValues = processInputDigits(reversedInput);
  const finalCalculatedResult = computePatternSum.apply(null, numericValues);
  process.stdout.write(finalCalculatedResult.toString());
});
