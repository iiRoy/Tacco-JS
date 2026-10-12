'use strict';

function main(inputLines) {
  const [inputString] = inputLines;

  const MODULO_CONSTANT = 10**9 + 7;
  const MAX_STRING_LENGTH = inputString.length;
  const REMAINDER_MODULUS = 13;

  const memoizationTable = Array.from({ length: MAX_STRING_LENGTH + 1 }, () => Array(REMAINDER_MODULUS).fill(undefined));

  function calculateValidWays(currentLength, targetRemainder) {
    if (currentLength === 0) {
      return targetRemainder === 0 ? 1 : 0;
    }

    if (memoizationTable[currentLength][targetRemainder] !== undefined) {
      return memoizationTable[currentLength][targetRemainder];
    }

    const charAtCurrentPosition = inputString[currentLength - 1];
    let accumulatedWays = 0;

    const sumWaysForSpecificDigit = (digitValue) => {
        let currentDigitContribution = 0;
        for (let previousRemainderCandidate = 0; previousRemainderCandidate < REMAINDER_MODULUS; previousRemainderCandidate++) {
            if ((previousRemainderCandidate * 10 + digitValue) % REMAINDER_MODULUS === targetRemainder) {
                currentDigitContribution = (currentDigitContribution + calculateValidWays(currentLength - 1, previousRemainderCandidate)) % MODULO_CONSTANT;
            }
        }
        return currentDigitContribution;
    };

    if (charAtCurrentPosition === '?') {
      for (let digitOption = 0; digitOption <= 9; digitOption++) {
        accumulatedWays = (accumulatedWays + sumWaysForSpecificDigit(digitOption)) % MODULO_CONSTANT;
      }
    } else {
      const fixedDigitValue = Number(charAtCurrentPosition);
      accumulatedWays = sumWaysForSpecificDigit(fixedDigitValue);
    }

    return memoizationTable[currentLength][targetRemainder] = accumulatedWays;
  }

  console.log(calculateValidWays(MAX_STRING_LENGTH, 5));
}

function setupStdinProcessing() {
  let receivedInput = "";
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (inputChunk) => {
    receivedInput += inputChunk;
  });
  process.stdin.on("end", () => {
    main(receivedInput.split("\n"));
  });
}

setupStdinProcessing();
