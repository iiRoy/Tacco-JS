const processSequence = (sourceText) => {
  const characterArray = sourceText.trim().split('');

  const { firstPatternMismatches, secondPatternMismatches } = characterArray.reduce(
    (currentCounts, charValue, currentIdx) => {
      const digit = Number(charValue);

      // For a target pattern starting with 0 (e.g., 010101...)
      // The expected digit at an even index is 0, and at an odd index is 1.
      // This is equivalent to (currentIdx % 2).
      if (digit !== (currentIdx % 2)) {
        currentCounts.firstPatternMismatches++;
      }

      // For a target pattern starting with 1 (e.g., 101010...)
      // The expected digit at an even index is 1, and at an odd index is 0.
      // This is equivalent to ((currentIdx + 1) % 2).
      if (digit !== ((currentIdx + 1) % 2)) {
        currentCounts.secondPatternMismatches++;
      }

      return currentCounts;
    },
    { firstPatternMismatches: 0, secondPatternMismatches: 0 }
  );

  console.log(Math.min(firstPatternMismatches, secondPatternMismatches));
};

processSequence(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
