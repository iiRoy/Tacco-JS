'use strict';

const MOD_CONSTANT = 1000000007;
const TARGET_REMAINDER = 5;
const MODULUS_VALUE = 13;

function calculateModuloCounts(inputLine) {
  const contentString = inputLine;
  const stringLength = contentString.length;

  let possibilityMatrix = Array.from({ length: stringLength + 1 }, () =>
    Array(MODULUS_VALUE).fill(0)
  );

  possibilityMatrix[0][0] = 1;

  for (let currentIdx = 0; currentIdx < stringLength; currentIdx++) {
    const charAtCurrentIdx = contentString[currentIdx];

    for (let prevRemainder = 0; prevRemainder < MODULUS_VALUE; prevRemainder++) {
      if (possibilityMatrix[currentIdx][prevRemainder] === 0) {
        continue;
      }

      if (charAtCurrentIdx === '?') {
        for (let potentialDigit = 0; potentialDigit <= 9; potentialDigit++) {
          const nextRemainder = (prevRemainder * 10 + potentialDigit) % MODULUS_VALUE;
          possibilityMatrix[currentIdx + 1][nextRemainder] =
            (possibilityMatrix[currentIdx + 1][nextRemainder] + possibilityMatrix[currentIdx][prevRemainder]) % MOD_CONSTANT;
        }
      } else {
        const fixedDigit = Number(charAtCurrentIdx);
        const nextRemainder = (prevRemainder * 10 + fixedDigit) % MODULUS_VALUE;
        possibilityMatrix[currentIdx + 1][nextRemainder] =
          (possibilityMatrix[currentIdx + 1][nextRemainder] + possibilityMatrix[currentIdx][prevRemainder]) % MOD_CONSTANT;
      }
    }
  }

  return possibilityMatrix[stringLength][TARGET_REMAINDER];
}

function orchestrateInputProcessing() {
  let accumulatedInput = "";
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    accumulatedInput += chunk;
  });
  process.stdin.on("end", () => {
    const inputLines = accumulatedInput.split("\n");
    const result = calculateModuloCounts(inputLines[0]);
    console.log(result);
  });
}

orchestrateInputProcessing();