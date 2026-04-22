function processInputAndCompute(inputContent) {
  const rawTokens = inputContent.split(/\s+/).filter(Boolean);
  const numElements = Number(rawTokens[0]);
  const upperLimitValue = BigInt(rawTokens[1]);
  const dataElements = rawTokens.slice(2, 2 + numElements).map(BigInt);

  const bitwiseCounts = new Array(50).fill(0);
  for (const val of dataElements) {
    for (let p = 0; p < 50; ++p) { // p=0 is LSB, p=49 is MSB
      if ((val >> BigInt(p)) & 1n) {
        bitwiseCounts[p]++;
      }
    }
  }

  let currentMaximumScore = 0n;

  // Case 1: Consider X = upperLimitValue (the number K itself)
  let scoreForLimit = 0n;
  for (let p = 0; p < 50; ++p) {
    const bitOfLimit = (upperLimitValue >> BigInt(p)) & 1n;
    if (bitOfLimit === 0n) {
      scoreForLimit += BigInt(bitwiseCounts[p]) * (1n << BigInt(p));
    } else {
      scoreForLimit += BigInt(numElements - bitwiseCounts[p]) * (1n << BigInt(p));
    }
  }
  currentMaximumScore = scoreForLimit;

  // Case 2: Consider X < upperLimitValue (numbers strictly less than K)
  // Iterate from the most significant bit (MSB, index 49) down to the least significant bit (LSB, index 0).
  // For each bit position `q`, if `upperLimitValue` has a '1' at `q`,
  // we can construct a candidate `X` where:
  // - Its prefix (bits 49 down to q+1) matches `upperLimitValue`.
  // - Bit `q` is set to '0' (making `X` strictly less than `upperLimitValue`).
  // - Subsequent bits (q-1 down to 0) are chosen greedily to maximize the score.
  for (let q = 49; q >= 0; --q) {
    const limitBitAtQ = (upperLimitValue >> BigInt(q)) & 1n;

    if (limitBitAtQ === 1n) { // If K has a '1' at this position, we can try setting X's bit here to '0'
      let potentialCandidateScore = 0n;

      // Prefix (bits 49 down to q+1) matches upperLimitValue
      for (let r = 49; r > q; --r) {
        const currentLimitBit = (upperLimitValue >> BigInt(r)) & 1n;
        if (currentLimitBit === 0n) {
          potentialCandidateScore += BigInt(bitwiseCounts[r]) * (1n << BigInt(r));
        } else {
          potentialCandidateScore += BigInt(numElements - bitwiseCounts[r]) * (1n << BigInt(r));
        }
      }

      // Current bit q is 0
      potentialCandidateScore += BigInt(bitwiseCounts[q]) * (1n << BigInt(q));

      // Suffix (bits q-1 down to 0) are chosen greedily without any further constraint from K
      for (let r = q - 1; r >= 0; --r) {
        potentialCandidateScore += BigInt(Math.max(bitwiseCounts[r], numElements - bitwiseCounts[r])) * (1n << BigInt(r));
      }

      currentMaximumScore = BigInt(Math.max(currentMaximumScore, potentialCandidateScore));
    }
  }

  console.log(currentMaximumScore.toString());
}

processInputAndCompute(require("fs").readFileSync("/dev/stdin","utf8"));