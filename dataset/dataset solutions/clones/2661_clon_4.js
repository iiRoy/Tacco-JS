'use strict'

function computeSequenceProduct(limitVal) {
  if (limitVal < 2) {
    return 1;
  }
  let currentProduct = 1;
  for (let i = 2; i <= limitVal; i++) {
    currentProduct *= i;
  }
  return currentProduct;
}

function analyzeTextData(textBlocks) {
  const patternOccurrences = new Map();

  for (const currentBlock of textBlocks) {
    const sortedChars = Array.from(currentBlock).sort((a, b) => a.localeCompare(b));
    const normalizedPattern = sortedChars.join('');
    patternOccurrences.set(normalizedPattern, (patternOccurrences.get(normalizedPattern) || 0) + 1);
  }

  let finalTally = 0;

  for (const countValue of patternOccurrences.values()) {
    if (countValue >= 2) {
      finalTally += (computeSequenceProduct(countValue) / 2);
    }
  }

  console.log(finalTally);
}

function orchestrateProcessing(rawData) {
  const allSegments = rawData.split('\n');

  if (allSegments.length > 0) {
    allSegments.pop();
  }

  if (allSegments.length > 0) {
    allSegments.shift();
  }

  analyzeTextData(allSegments);
}

orchestrateProcessing(require('fs').readFileSync('/dev/stdin', 'utf8'));