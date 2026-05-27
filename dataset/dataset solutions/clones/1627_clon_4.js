function processDivisibility(inputString) {
  const targetDivisorValue = Number(inputString);
  let currentRemainder = 0;
  let digitCounter = 0;
  let currentNumberMagnitude = 0;

  if (targetDivisorValue % 2 === 0 || targetDivisorValue % 5 === 0) {
    console.log('-1');
    return;
  }

  while (true) {
    digitCounter++;

    currentNumberMagnitude = currentNumberMagnitude * 10 + 7;

    if (currentNumberMagnitude <= targetDivisorValue) {
      // This replicates the original code's 'if (n <= input) { continue; }' behavior.
      // If currentNumberMagnitude overflows, it will become inaccurate, but at that point,
      // it will certainly be greater than targetDivisorValue (assuming targetDivisorValue
      // is within Number.MAX_SAFE_INTEGER), so the condition will correctly evaluate to false.
      continue;
    }

    currentRemainder = (currentRemainder * 10 + 7) % targetDivisorValue;

    if (currentRemainder === 0) {
      console.log(digitCounter);
      return;
    }

    // The original loop iterates 'i' from 0 up to 'input' (K).
    // 'digitCounter' corresponds to 'i + 1'. So, 'digitCounter' goes from 1 up to 'K + 1'.
    // This condition ensures the loop terminates after 'K + 1' iterations if no solution is found.
    if (digitCounter > targetDivisorValue + 1) {
      break;
    }
  }

  console.log('-1');
}

processDivisibility(require("fs").readFileSync("/dev/stdin", "utf8"));
