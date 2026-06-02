const processInputData = (rawData) => {
  const trimmedInputContent = rawData.trim();
  const inputLines = trimmedInputContent.split('\n');
  const targetString = inputLines[1];
  const charSequence = Array.from(targetString);

  let whiteCharCount = 0;
  let redCharCount = 0;

  for (const currentElement of charSequence) {
    if (currentElement === 'W') {
      whiteCharCount++;
    } else {
      redCharCount++;
    }
  }

  let requiredSwaps = 0;
  let leftScanIndex = 0;
  let rightBoundaryIndex = charSequence.length - 1;

  while (leftScanIndex < rightBoundaryIndex) {
    if (charSequence[leftScanIndex] === 'W') {
      // Move rightBoundaryIndex inwards until an 'R' is found or pointers cross
      while (rightBoundaryIndex >= 0 && charSequence[rightBoundaryIndex] === 'W') {
        rightBoundaryIndex--;
      }

      // If the pointers have crossed or met, no more valid swaps can be performed
      if (leftScanIndex >= rightBoundaryIndex) {
        break;
      }

      // Perform the conceptual swap: 'W' at left becomes 'R', 'R' at right becomes 'W'
      charSequence[leftScanIndex] = 'R';
      charSequence[rightBoundaryIndex] = 'W';

      requiredSwaps++;
      rightBoundaryIndex--; // The 'R' at this position has been "used"
    }
    leftScanIndex++; // Always advance the left pointer
  }

  const totalWhiteOrRedMinimum = Math.min(whiteCharCount, redCharCount);
  const finalOutputValue = Math.min(requiredSwaps, totalWhiteOrRedMinimum);
  console.log(finalOutputValue);
};

process.env.MYTEST ? test() : processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
