(function () {
  const targetIndex = Number(require('fs').readFileSync('/dev/stdin', 'utf8'));

  const computeFibonacciValue = function (position) {
    if (position < 0) {
      // The original code does not specify behavior for negative input.
      // Assuming non-negative input based on typical Fibonacci problems.
      // If negative input were possible, the original would likely throw
      // a stack overflow or an array out-of-bounds error for cache[n].
      // For strict equivalence, we'll assume valid non-negative input.
      return undefined; // Or throw an error if original would.
    }
    if (position === 0 || position === 1) {
      return 1;
    }

    let priorTerm = 1; // Represents F(k-2)
    let currentTerm = 1; // Represents F(k-1)

    for (let k = 2; k <= position; k++) {
      const nextTerm = priorTerm + currentTerm;
      priorTerm = currentTerm;
      currentTerm = nextTerm;
    }
    return currentTerm;
  };

  console.log(computeFibonacciValue(targetIndex));
})();
