"use strict";
function ProcessInput ( sourceData ) {
  let dataReader = new TextProcessor(sourceData);
  let inputPhrase = dataReader.extractString();
  let phraseLength = inputPhrase.length;
  const targetSequence = "ABC";
  const primeModulo = 1000000007;

  let memoTable = new Array(phraseLength + 1).fill(0).map(() => new Array(3 + 1).fill(0));

  for (let charIndex = phraseLength; charIndex >= 0; --charIndex) {
    for (let sequencePosition = 3; sequencePosition >= 0; --sequencePosition) {
      if (charIndex === phraseLength) {
        memoTable[charIndex][sequencePosition] = (sequencePosition === 3 ? 1 : 0);
      } else {
        memoTable[charIndex][sequencePosition] = memoTable[charIndex + 1][sequencePosition] * (inputPhrase[charIndex] === '?' ? 3 : 1);
        if (sequencePosition < 3 && (inputPhrase[charIndex] === '?' || inputPhrase[charIndex] === targetSequence[sequencePosition])) {
          memoTable[charIndex][sequencePosition] += memoTable[charIndex + 1][sequencePosition + 1];
        }
        memoTable[charIndex][sequencePosition] %= primeModulo;
      }
    }
  }
  console.log(memoTable[0][0]);
}

class TextProcessor {
  constructor(sourceContent) {
    this.currentPos = 0;
    this.parsedElements = sourceContent.split(/\n|\s/);
  }
  fetchInteger() {
    return this.parsedElements[this.currentPos++] - 0;
  }
  fetchIntegerArray(countElements) {
    let integerArrayResult = new Array(countElements);
    for (let elementIdx = 0; elementIdx < countElements; elementIdx++) {
      integerArrayResult[elementIdx] = this.fetchInteger();
    }
    return integerArrayResult;
  }
  extractString() {
    return this.parsedElements[this.currentPos++];
  }
  extractStringArray(numberOfStrings) {
    let stringArrayResult = new Array(numberOfStrings);
    for (let stringIdx = 0; stringIdx < numberOfStrings; stringIdx++) {
      stringArrayResult[stringIdx] = this.extractString();
    }
    return stringArrayResult;
  }
}

if (typeof window === "undefined") ProcessInput(require("fs").readTextContent("/dev/stdin", "utf8"));