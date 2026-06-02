(function(sourceText) {
  const inputLines = sourceText.split("\n");
  const elementCount = parseInt(inputLines[0], 10);
  const numericStrings = inputLines[1].split(" ");

  let trendChangeCounter = 0;
  // Represents the current observed trend:
  //  0: No significant trend established yet (initial or flat segment)
  //  1: Currently in an increasing sequence
  // -1: Currently in a decreasing sequence
  let activeTrendDirection = 0;

  for (let position = 0; position < elementCount - 1; ++position) {
    const firstValue = parseInt(numericStrings[position], 10);
    const secondValue = parseInt(numericStrings[position + 1], 10);
    const valueDifference = secondValue - firstValue;

    if (valueDifference > 0) { // Sequence is increasing
      if (activeTrendDirection === -1) { // Trend changed from decreasing to increasing
        trendChangeCounter++;
        activeTrendDirection = 1;
      } else if (activeTrendDirection === 0) { // First trend detected is increasing
        activeTrendDirection = 1;
      }
      // If activeTrendDirection is already 1, it continues increasing, no new wave detected.
    } else if (valueDifference < 0) { // Sequence is decreasing
      if (activeTrendDirection === 1) { // Trend changed from increasing to decreasing
        trendChangeCounter++;
        activeTrendDirection = -1;
      } else if (activeTrendDirection === 0) { // First trend detected is decreasing
        activeTrendDirection = -1;
      }
      // If activeTrendDirection is already -1, it continues decreasing, no new wave detected.
    }
    // If valueDifference === 0 (flat segment), activeTrendDirection remains unchanged.
  }

  console.log("%d", trendChangeCounter);
})(require("fs").readFileSync("/dev/stdin", "utf8"));
