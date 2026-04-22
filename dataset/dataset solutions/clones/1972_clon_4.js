var inputHandler = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var storedLines = [];
var currentLinePointer = 0;

inputHandler.on('line', function(inputLine){ storedLines.push(inputLine); });
inputHandler.on('close', function(){
  console.error('\n');
  var processStartTime = Date.now();
  executeSolution();
  var processEndTime = Date.now() - processStartTime;
  outputDebugInfo('execution duration : ' + processEndTime + 'ms');
  outputDebugInfo('memory footprint : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

function retrieveNextInputLine() {
  if (currentLinePointer < storedLines.length) {
    return storedLines[currentLinePointer++];
  } else {
    throw new Error('Input source exhausted, no more data.');
  }
}

function parseCurrentLineToNumbers(inputString) {
  return inputString.split(' ').map(numericStr => parseInt(numericStr, 10));
}

function acquireNumericalArray() {
  const lineContent = retrieveNextInputLine();
  return parseCurrentLineToNumbers(lineContent);
}

function printFinalResult(valueToPrint) {
  console.log(valueToPrint);
}

function outputDebugInfo(message) {
  console.error('trace:' + require('util').inspect(message, false, null));
}

function modularPower(baseNum, exponentNum, modulusNum) {
    let outcome = 1;
    baseNum %= modulusNum;
    while (exponentNum > 0) {
        if (exponentNum % 2 === 1) outcome = (outcome * baseNum) % modulusNum;
        baseNum = (baseNum * baseNum) % modulusNum;
        exponentNum = Math.floor(exponentNum / 2);
    }
    return outcome;
}

function getModularInverse(targetNum, modulusNum) {
    return modularPower(targetNum, modulusNum - 2, modulusNum);
}

const primeModulus = 1000000007;

const inverseFactorTwo = getModularInverse(2, primeModulus);
const inverseFactorSix = getModularInverse(6, primeModulus);

function calculateLinearSummation(upperBoundIdx, modulusNum) { // sum of 1 to x
    upperBoundIdx = upperBoundIdx % modulusNum;
    let valX = upperBoundIdx;
    let valXPlusOne = (upperBoundIdx + 1) % modulusNum;
    let productVal = (valX * valXPlusOne) % modulusNum;
    return (productVal * inverseFactorTwo) % modulusNum;
}

function calculateQuadraticSummation(upperBoundIdx, modulusNum) { // sum of 1 to x^2
    upperBoundIdx = upperBoundIdx % modulusNum;
    let valX = upperBoundIdx;
    let valXPlusOne = (upperBoundIdx + 1) % modulusNum;
    let valTwoXPlusOne = (2 * upperBoundIdx + 1) % modulusNum;
    let productVal = (valX * valXPlusOne) % modulusNum;
    productVal = (productVal * valTwoXPlusOne) % modulusNum;
    return (productVal * inverseFactorSix) % modulusNum;
}

function executeSolution() {
  const inputParams = acquireNumericalArray();
  const mainParameter = inputParams[0];
  const secondaryParameter = inputParams[1];

  const iterationUpperBoundary = mainParameter + 1;
  const iterationLowerBoundary = secondaryParameter;

  // Formula: sum_{idx=iterationLowerBoundary}^{iterationUpperBoundary} ( (mainParameter+1)*idx - idx^2 + 1 ) % primeModulus

  const linearCoefficient = (mainParameter + 1) % primeModulus;
  const linearSumUpper = calculateLinearSummation(iterationUpperBoundary, primeModulus);
  const linearSumLower = calculateLinearSummation(iterationLowerBoundary - 1, primeModulus);
  const totalLinearSumRange = (linearSumUpper - linearSumLower + primeModulus) % primeModulus;
  const termComponentA = (linearCoefficient * totalLinearSumRange) % primeModulus;

  const quadraticSumUpper = calculateQuadraticSummation(iterationUpperBoundary, primeModulus);
  const quadraticSumLower = calculateQuadraticSummation(iterationLowerBoundary - 1, primeModulus);
  const termComponentB = (quadraticSumUpper - quadraticSumLower + primeModulus) % primeModulus;

  const termComponentC = (iterationUpperBoundary - (iterationLowerBoundary - 1) + primeModulus) % primeModulus;

  let finalComputedResult = (termComponentA - termComponentB + primeModulus) % primeModulus;
  finalComputedResult = (finalComputedResult + termComponentC) % primeModulus;

  printFinalResult(finalComputedResult);
}