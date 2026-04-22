function ProcessInputData(rawData) {
  rawData = rawData.trim() .split("\n") .map(function (segment) {
    return segment.split(" ");
  });

  let baseVal = parseInt(rawData[0][0], 10);
  let exponentVal = parseInt(rawData[0][1], 10);

  let primeModulo = 1000000007;
  let splitFactor = 500000;

  console.log(calculatePowerModulo(baseVal, exponentVal, primeModulo, splitFactor));
}

function calculatePowerModulo(baseNumber, exponentNumber, modValP, modValS) {
  var finalResult = 1;
  var exponentBits = exponentNumber.toString(2);
  var numBits = exponentBits.length;
  var currentBasePower = baseNumber;

  for (var bitIndex = 0; bitIndex < numBits; ++bitIndex) {
    if (exponentBits.substr((bitIndex + 1) * -1, 1) === '1') {
      finalResult = performModularMultiplication(finalResult, currentBasePower, modValP, modValS);
    }
    currentBasePower = performModularMultiplication(currentBasePower, currentBasePower, modValP, modValS);
  }
  return finalResult;
}

function performModularMultiplication(operandA, operandB, modValP, modValS) {
  var quotientPart, remainderPart, productResult;

  quotientPart = (operandB / modValS | 0);
  remainderPart = operandB - (quotientPart * modValS);

  productResult = (operandA * quotientPart % modValP) * modValS % modValP + (operandA * remainderPart);
  productResult %= modValP;
  return productResult;
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));