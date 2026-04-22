function ProcessData(inputStr) {
  var numArr = inputStr.split(" ").map(val => +val);
  var upperBound = numArr[0];
  var coeffA = numArr[1];
  var coeffB = numArr[2];
  var targetValue = numArr[3];
  var finalResult = 0;

  for (var iterA = 0; iterA <= upperBound; iterA++) {
    var remValue = targetValue - iterA * coeffA;
    if (remValue < 0)
      break;
    if (remValue % coeffB === 0 && remValue / coeffB <= upperBound) {
      var term1 = nCrModulo(upperBound, iterA);
      var term2 = nCrModulo(upperBound, remValue / coeffB);
      finalResult = (finalResult + multiplyMod(term1, term2)) % primeModulus;
    }
  }
  console.log(finalResult);
}

function multiplyMod() {
  var currentProduct = arguments[0];
  for (var loopCounter = 1; loopCounter < arguments.length; loopCounter++) {
    currentProduct = (currentProduct >>> 16) * arguments[loopCounter] % primeModulus * 0x10000 + (currentProduct & 0xFFFF) * arguments[loopCounter];
    currentProduct %= primeModulus;
  }
  return currentProduct;
}

function powerMod(baseNum, exponentNum) {
  var accumulatedProduct = 1;
  while (exponentNum) {
    if (exponentNum & 1)
      accumulatedProduct = multiplyMod(baseNum, accumulatedProduct);
    baseNum = multiplyMod(baseNum, baseNum);
    exponentNum >>>= 1;
  }
  return accumulatedProduct;
}

var primeModulus = 998244353;
var factorialValues = [1, 1];
var inverseFactorials = [1, 1];

function computeFactorialCache(maxIdx) {
  for (var indexIter = factorialValues.length; indexIter <= maxIdx; indexIter++) {
    factorialValues[indexIter] = multiplyMod(factorialValues[indexIter - 1], indexIter);
  }
  return factorialValues[maxIdx];
}

function computeInverseFactorialCache(targetIdx) {
  if (!factorialValues[targetIdx])
    computeFactorialCache(targetIdx);
  inverseFactorials[targetIdx] = powerMod(factorialValues[targetIdx], primeModulus - 2);
  while (!inverseFactorials[targetIdx - 1]) {
    inverseFactorials[targetIdx - 1] = multiplyMod(inverseFactorials[targetIdx], targetIdx--);
  }
}

function nCrModulo(totalItems, selectItems) {
  if (!inverseFactorials[totalItems])
    computeInverseFactorialCache(totalItems);
  return multiplyMod(factorialValues[totalItems], inverseFactorials[selectItems], inverseFactorials[totalItems - selectItems]);
}

ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));