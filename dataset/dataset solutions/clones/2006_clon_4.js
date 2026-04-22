const processInput = inputRaw => {
  const parsedNumbers = inputRaw.split(' ').map(v => BigInt(v));
  const initialA = parsedNumbers[0];
  const initialB = parsedNumbers[1];

  // Helper for absolute value for BigInt operands
  const obtainAbsolute = quantity => {
    return quantity < 0n ? -quantity : quantity;
  };

  const computeOptimalResidual = (currentFocus, modulusFactor) => {
    // Handles the case where the initial value is 0, which results in 0
    // (e.g., N=0, K=5 -> abs(0-5)=5, then 5===K, result=0)
    if (currentFocus === 0n) {
      return 0n;
    }

    // Mimics the `x = x_prev - K; x = abs(x);` step
    const intermediateStep = obtainAbsolute(currentFocus - modulusFactor);

    // Mimics the `if(x === K) { result = 0; break; }` condition
    if (intermediateStep === modulusFactor) {
      return 0n;
    }

    // Mimics the `if(x < K) { if(x < K / 2n) { result = x; break; } }` condition
    if (intermediateStep < modulusFactor && intermediateStep < modulusFactor / 2n) {
        return intermediateStep;
    }
    
    // If none of the termination conditions are met, the original loop continues.
    // In a recursive approach, this means calling the function again with the new value.
    // This covers both:
    // 1. `x < K` but `x >= K / 2n`
    // 2. `x > K`
    return computeOptimalResidual(intermediateStep, modulusFactor);
  };

  const finalAnswer = computeOptimalResidual(initialA, initialB);

  console.log(Number(finalAnswer));
};

processInput(require('node:fs').readFileSync('/dev/stdin', 'utf8'));