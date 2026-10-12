'use strict';
const outputWriter = s => console.log(s);

function processInput(inputData) {
  const [stringA, stringB, stringN] = inputData[0].split(" ");
  const numericA = Number(stringA);
  const numericB = Number(stringB);
  const numericN = Number(stringN);

  // The original expression `Math.floor(A*i/B) - A * Math.floor(i/B)`
  // can be mathematically simplified.
  // Let i = qB + r, where q = Math.floor(i/B) and r = i % B.
  // Substituting this into the expression:
  // Math.floor(A*(qB+r)/B) - A * Math.floor((qB+r)/B)
  // = Math.floor(Aq + Ar/B) - A * q
  // = Aq + Math.floor(Ar/B) - Aq
  // = Math.floor(Ar/B)
  // So, the expression is equivalent to `Math.floor(numericA * (i % numericB) / numericB)`.

  // To maximize `Math.floor(numericA * (i % numericB) / numericB)` for `1 <= i <= numericN`,
  // we need to maximize the term `(i % numericB)`.
  // The maximum possible value for `(i % numericB)` is `numericB - 1`.
  // This value can be achieved for `i = numericB - 1` (if `numericB - 1 >= 1`),
  // or `i = 2*numericB - 1`, and so on.
  // We need to check if `numericB - 1` is achievable as a remainder for an `i` within `[1, numericN]`.
  // If `numericN` is greater than or equal to `numericB - 1`, then we can pick an `i`
  // (e.g., `i = numericB - 1` itself, or `i = numericB * k - 1` for some k)
  // such that `i % numericB` is `numericB - 1`.
  // If `numericN` is less than `numericB - 1`, then the largest possible remainder `i % numericB`
  // for `i` in `[1, numericN]` is simply `numericN` (when `i = numericN`).
  // Therefore, the optimal remainder value is `Math.min(numericN, numericB - 1)`.

  const optimalRemainderValue = Math.min(numericN, numericB - 1);
  const finalCalculatedValue = Math.floor(numericA * optimalRemainderValue / numericB);

  outputWriter(finalCalculatedValue);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
