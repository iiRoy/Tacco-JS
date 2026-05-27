const computeMismatchCount = (rawInputContent) => {
  const cleanedInput = rawInputContent.trim();
  const inputLines = cleanedInput.split("\n");

  const firstCharSequence = Array.from(inputLines[0]);
  const secondCharSequence = Array.from(inputLines[1]);

  const sequenceLength = firstCharSequence.length;
  let mismatchCounter = 0;

  for (let currentIndex = 0; currentIndex < sequenceLength; currentIndex++) {
    const charA = firstCharSequence[currentIndex];
    const charB = secondCharSequence[currentIndex];

    if (charA !== charB) {
      mismatchCounter++;
    }
  }

  return mismatchCounter;
};

console.log(computeMismatchCount(require('fs').readFileSync('/dev/stdin', 'utf8')));
