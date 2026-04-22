'use strict';
(function(inputSource) {
  // A service to construct a visual representation from dimensions
  const constructVisual = (dimensions) => {
    const [verticalSpan, horizontalSpan] = dimensions;

    // Helper to compose a single horizontal strip
    const composeStrip = (rowPosition) =>
      Array.from({ length: horizontalSpan }, (_, columnPosition) =>
        ((rowPosition + columnPosition) % 2 === 0) ? '#' : '.'
      ).join('');

    // Generate all strips and combine them with line breaks
    return Array.from({ length: verticalSpan }, (_, rowPosition) => composeStrip(rowPosition)).join('\n');
  };

  // A recursive utility to extract numerical pairs from a text block
  const gatherNumericPairs = (remainingText, collectedItems = []) => {
    const nextBreak = remainingText.indexOf('\n');
    const activeLine = nextBreak === -1 ? remainingText : remainingText.substring(0, nextBreak);

    if (activeLine.trim() === '0 0' || activeLine.trim() === '') {
      return collectedItems;
    }

    const numbersFound = activeLine.split(' ').map(Number);
    const subsequentText = nextBreak === -1 ? '' : remainingText.substring(nextBreak + 1);

    return gatherNumericPairs(subsequentText, [...collectedItems, numbersFound]);
  };

  // Entry point for processing
  const sourceContent = inputSource.toString().trim();
  const allDimensionSets = gatherNumericPairs(sourceContent);

  const processedVisuals = allDimensionSets.map(constructVisual);
  const finalRender = processedVisuals.join('\n\n');

  console.log(finalRender);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));