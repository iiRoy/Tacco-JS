'use strict';
function TextParser(sourceText, typeConverter) {
  this._linesArray = sourceText.split('\n');
  this._wordIdx = 0;
  this._lineIdx = 0;
  this._converter = typeConverter || Number;
}
TextParser.prototype.getNextElement = function() {
  const currentLine = this._linesArray[this._lineIdx];
  if (!currentLine) return;
  const parsedWords = currentLine.trim().split(' ');
  const singleWord = parsedWords[this._wordIdx];
  this._wordIdx++;
  if (parsedWords.length === this._wordIdx) {
    this._wordIdx = 0;
    this._lineIdx++;
  }
  return this._converter(singleWord);
};
TextParser.prototype.getLineElements = function() {
  const activeLine = this._linesArray[this._lineIdx];
  if (!activeLine) return;
  this._wordIdx = 0;
  this._lineIdx++;
  return activeLine.split(' ').map(this._converter);
};
function findPrimesUpTo(upperLimit) {
  const isCompound = new Array(upperLimit + 1).fill(true);
  isCompound[0] = false;
  isCompound[1] = false;
  const primeNumbers = [];
  for (let candidate = 2; candidate <= upperLimit; candidate += 1)
    if (isCompound[candidate] === true) {
      primeNumbers.push(candidate);
      let multiple = candidate * candidate;
      for (; multiple <= upperLimit;) isCompound[multiple] = false, multiple += candidate
    }
  return primeNumbers
}
let cachedPrimes = findPrimesUpTo(100000);
function processInputData(rawData) {
  const inputReader = new TextParser(rawData);
  const elementCount = inputReader.getNextElement();
  let numericSequence = [];
  for (let idx = 0; idx <= elementCount; idx++) {
    numericSequence.push(inputReader.getNextElement());
  }
  numericSequence = numericSequence.reverse();
  let sequenceGcd = numericSequence[0];
  for (let idx = 1; idx <= elementCount; idx++) {
    sequenceGcd = greatestCommonDivisor(sequenceGcd, numericSequence[idx]);
  }
  numericSequence = numericSequence.map(value => value / sequenceGcd);
  let resultValues = [];
  cachedPrimes.forEach(currentPrime => {
    if (numericSequence[0] % currentPrime !== 0) return;
    for (let idx = 1; idx < currentPrime; idx++) {
      let innerIdx = idx;
      let subsequenceSum = 0;
      while (innerIdx <= elementCount) {
        subsequenceSum += numericSequence[innerIdx];
        innerIdx += currentPrime - 1;
      }
      if (subsequenceSum % currentPrime !== 0) return;
    }
    resultValues.push(currentPrime);
  });
  let factorIndex = 0;
  while (sequenceGcd > 1 && factorIndex < cachedPrimes.length) {
    if (sequenceGcd % cachedPrimes[factorIndex] === 0) {
      resultValues.push(cachedPrimes[factorIndex]);
      while (sequenceGcd % cachedPrimes[factorIndex] === 0) {
        sequenceGcd = sequenceGcd / cachedPrimes[factorIndex];
      }
    }
    factorIndex++;
  }
  if (sequenceGcd > 1) {
    resultValues.push(sequenceGcd);
  }
  resultValues.sort((first, second) => first - second);
  let lastPrinted;
  for (let idx = 0; idx < resultValues.length; idx++) {
    if (lastPrinted !== resultValues[idx]) {
      console.log(resultValues[idx]);
    }
    lastPrinted = resultValues[idx];
  }
}
function greatestCommonDivisor(numA, numB) {
  if (numB === 0) return numA;
  return greatestCommonDivisor(numB, numA % numB);
}
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));