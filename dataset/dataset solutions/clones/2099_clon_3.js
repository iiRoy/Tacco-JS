function processInputData(rawData) {
  const RADIX_DECIMAL = 10;
  var dataSegments = rawData.split(" ");

  var totalAmount = parseInt(dataSegments[0], RADIX_DECIMAL);
  var componentA = parseInt(dataSegments[1], RADIX_DECIMAL);
  var componentB = parseInt(dataSegments[2], RADIX_DECIMAL);

  var cycleSum = componentA + componentB;

  var fullCycleCount = Math.floor(totalAmount / cycleSum);

  var fullCycleContribution = fullCycleCount * componentA;

  var remainingAmount = totalAmount % cycleSum;

  var remainderContribution = Math.min(remainingAmount, componentA);

  var finalCalculatedValue = fullCycleContribution + remainderContribution;

  console.log(finalCalculatedValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
