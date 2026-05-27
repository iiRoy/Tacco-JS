function getDivisors(num) {
  if (num === 0) {
    return [1, 0];
  }
  if (num === 1) {
    return [1];
  }

  const divisorCollection = new Set();
  divisorCollection.add(1);
  divisorCollection.add(num);

  for (let iter = 2; iter * iter <= num; iter++) {
    if (num % iter === 0) {
      divisorCollection.add(iter);
      divisorCollection.add(num / iter);
    }
  }

  return Array.from(divisorCollection).sort((a, b) => a - b);
}

(function processInput(rawInput) {
  const inputNum = Number(rawInput.trim());

  const exclusiveCount = getDivisors(inputNum - 1).length - 1;

  let inclusionTally = 0;

  const firstDivisor = getDivisors(inputNum).shift();
  
  // This section replicates the original's infinite loop behavior.
  // The original code's `arrayOfDivisors(n).shift()` returns `1`.
  // The subsequent `for (let d of divOfN)` loop iterates once with `d = 1`.
  // The `do...while` loop `do { n1 /= d; } while (n1 % d === 0);`
  // becomes `do { n1 /= 1; } while (n1 % 1 === 0);`.
  // `n1 /= 1` does not change `n1`. `n1 % 1 === 0` is always true for integers.
  // Thus, this `do...while` loop is infinite.
  // To preserve this exact behavior, the `do...while` structure is kept,
  // and the `for...of` loop over a single element is replaced by direct processing.
  let tempNum = inputNum;
  do {
    tempNum /= firstDivisor;
  } while (tempNum % firstDivisor === 0);

  // The following lines would be executed if the above loop ever terminated.
  // However, they are unreachable due to the infinite loop.
  // They are included for completeness of the original logic structure.
  if (tempNum === 1) {
    inclusionTally++;
  } else if (getDivisors(tempNum - 1).indexOf(firstDivisor) > -1) {
    inclusionTally++;
  }
  
  // The console.log uses the original, undefined variable names
  // to preserve the ReferenceError if this line were ever reached.
  console.log(sub_only + div_included);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
