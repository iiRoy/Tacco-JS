function factorization(targetNumber) {
  const INITIAL_DIVISOR = 2;
  let currentCandidate = INITIAL_DIVISOR;
  let currentRemainder = targetNumber;
  const primeFactors = [];

  while (currentRemainder > 1) {
    if (currentRemainder % currentCandidate === 0) {
      currentRemainder /= currentCandidate;
      primeFactors.push(currentCandidate);
    } else {
      currentCandidate += 1;
    }

    const currentDivisorSquared = currentCandidate * currentCandidate;
    if (currentDivisorSquared > currentRemainder) {
      if (currentRemainder > 1) { // Ensure we don't push 1 if it's the remainder
        primeFactors.push(currentRemainder);
      }
      break;
    }
  }
  return primeFactors;
}

function extractNumericValues(lineString) {
  return lineString.split(' ').map(Number);
}

function Main(rawInputString) {
  let processedLines = rawInputString.split("\n");

  const lastLineIdx = processedLines.length - 1;
  if (lastLineIdx >= 0 && processedLines[lastLineIdx] === '') {
    processedLines.splice(lastLineIdx, 1);
  }

  const firstLineValues = extractNumericValues(processedLines[0]);

  const firstNum = firstLineValues[0];
  const secondNum = firstLineValues[1];
  const thirdNum = firstLineValues[2];

  const DEG_PER_RADIAN = 180 / Math.PI;

  const numeratorTerm = firstNum * secondNum * secondNum;
  const denominatorTerm = thirdNum * 2;

  const atanArgument = numeratorTerm / denominatorTerm;
  const angleInRadians = Math.atan(atanArgument);

  const finalCalculatedResult = DEG_PER_RADIAN * angleInRadians;

  console.log(finalCalculatedResult);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
