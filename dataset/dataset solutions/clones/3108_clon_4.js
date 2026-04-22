const CHARACTER_A = 0;
const CHARACTER_C = 1;
const CHARACTER_G = 2;
const CHARACTER_T = 3;
const CHARACTER_PLACEHOLDER = 4;
const TOTAL_CHARACTER_TYPES = 4;
const TOTAL_DP_STATE_INDICES = TOTAL_CHARACTER_TYPES + 1;

const MODULO_CONSTANT = 1000000007;

function checkThreeCharForbidden(ch1, ch2, ch3) {
  if (ch1 === CHARACTER_PLACEHOLDER || ch2 === CHARACTER_PLACEHOLDER || ch3 === CHARACTER_PLACEHOLDER) {
    return false;
  }
  return (
    (ch1 === CHARACTER_A && ch2 === CHARACTER_G && ch3 === CHARACTER_C) ||
    (ch1 === CHARACTER_A && ch2 === CHARACTER_C && ch3 === CHARACTER_G) ||
    (ch1 === CHARACTER_G && ch2 === CHARACTER_A && ch3 === CHARACTER_C)
  );
}

function checkFourCharForbidden(ch0, ch1, ch2, ch3) {
  if (ch0 === CHARACTER_PLACEHOLDER || ch1 === CHARACTER_PLACEHOLDER || ch2 === CHARACTER_PLACEHOLDER || ch3 === CHARACTER_PLACEHOLDER) {
    return false;
  }
  return (
    (ch0 === CHARACTER_A && ch1 === CHARACTER_G && ch3 === CHARACTER_C) ||
    (ch0 === CHARACTER_A && ch2 === CHARACTER_G && ch3 === CHARACTER_C)
  );
}

const computeSequenceCount = (inputValue) => {
  const desiredLength = Number(inputValue);

  const dynamicProgramTable = Array(desiredLength + 1)
    .fill(0)
    .map(() =>
      Array(TOTAL_DP_STATE_INDICES)
        .fill(0)
        .map(() =>
          Array(TOTAL_DP_STATE_INDICES)
            .fill(0)
            .map(() =>
              Array(TOTAL_DP_STATE_INDICES).fill(0).map(() => Array(TOTAL_DP_STATE_INDICES).fill(0))
            )
        )
    );

  dynamicProgramTable[0][CHARACTER_PLACEHOLDER][CHARACTER_PLACEHOLDER][CHARACTER_PLACEHOLDER][CHARACTER_PLACEHOLDER] = 1;

  for (let currentSequenceLength = 0; currentSequenceLength < desiredLength; ++currentSequenceLength) {
    for (let prevC0 = 0; prevC0 < TOTAL_DP_STATE_INDICES; ++prevC0) {
      for (let prevC1 = 0; prevC1 < TOTAL_DP_STATE_INDICES; ++prevC1) {
        for (let prevC2 = 0; prevC2 < TOTAL_DP_STATE_INDICES; ++prevC2) {
          for (let prevC3 = 0; prevC3 < TOTAL_DP_STATE_INDICES; ++prevC3) {
            const currentAccumulatedCount = dynamicProgramTable[currentSequenceLength][prevC0][prevC1][prevC2][prevC3];
            if (currentAccumulatedCount === 0) {
              continue;
            }

            for (let appendedCharIndex = 0; appendedCharIndex < TOTAL_CHARACTER_TYPES; ++appendedCharIndex) {
              let nextC0, nextC1, nextC2, nextC3;

              nextC0 = (currentSequenceLength < 3) ? CHARACTER_PLACEHOLDER : prevC1;
              nextC1 = (currentSequenceLength < 2) ? CHARACTER_PLACEHOLDER : prevC2;
              nextC2 = (currentSequenceLength < 1) ? CHARACTER_PLACEHOLDER : prevC3;
              nextC3 = appendedCharIndex;

              let isPermissibleExtension = true;

              if (checkThreeCharForbidden(nextC1, nextC2, nextC3)) {
                isPermissibleExtension = false;
              }

              if (isPermissibleExtension && checkFourCharForbidden(nextC0, nextC1, nextC2, nextC3)) {
                isPermissibleExtension = false;
              }
              
              if (isPermissibleExtension) {
                dynamicProgramTable[currentSequenceLength + 1][nextC0][nextC1][nextC2][nextC3] =
                  (dynamicProgramTable[currentSequenceLength + 1][nextC0][nextC1][nextC2][nextC3] + currentAccumulatedCount) % MODULO_CONSTANT;
              }
            }
          }
        }
      }
    }
  }

  let finalCount = 0;
  for (let c0 = 0; c0 < TOTAL_DP_STATE_INDICES; ++c0) {
    for (let c1 = 0; c1 < TOTAL_DP_STATE_INDICES; ++c1) {
      for (let c2 = 0; c2 < TOTAL_DP_STATE_INDICES; ++c2) {
        for (let c3 = 0; c3 < TOTAL_DP_STATE_INDICES; ++c3) {
          finalCount = (finalCount + dynamicProgramTable[desiredLength][c0][c1][c2][c3]) % MODULO_CONSTANT;
        }
      }
    }
  }

  console.log(finalCount);
};

computeSequenceCount(require('fs').readFileSync('/dev/stdin', 'UTF-8'));