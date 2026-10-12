function processData(rawInputContent) {
  const inputLines = rawInputContent.split("\n");
  const dataPointsStr = inputLines[1].split(" ");

  let sequencePatternCount = 0;

  // The original loop iterates from i=0 to row.length-2.
  // However, for i=0, row[i-1] (row[-1]) is undefined.
  // In JavaScript, comparisons like `undefined < value` or `undefined > value`
  // evaluate to `false`. Therefore, the condition `if(...)` is never met for i=0.
  // The effective range where the condition can be true is from i=1 to row.length-2.
  // We explicitly set the loop bounds to reflect this effective range,
  // making the logic clearer without altering observable behavior.
  const lastValidIndexForMiddleElement = dataPointsStr.length - 2;

  for (let currentIndex = 1; currentIndex <= lastValidIndexForMiddleElement; currentIndex++) {
    const previousElement = dataPointsStr[currentIndex - 1];
    const currentElement = dataPointsStr[currentIndex];
    const nextElement = dataPointsStr[currentIndex + 1];

    // Check if the current element forms an increasing sequence (a "valley" peak)
    const isAscendingTrend = (previousElement < currentElement) && (currentElement < nextElement);

    // Check if the current element forms a decreasing sequence (a "mountain" peak)
    const isDescendingTrend = (previousElement > currentElement) && (currentElement > nextElement);

    // If the current element is part of either an ascending or descending trend, increment the counter.
    // Note: String comparisons are used here, matching the original behavior.
    if (isAscendingTrend || isDescendingTrend) {
      sequencePatternCount++;
    }
  }

  console.log(sequencePatternCount);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
