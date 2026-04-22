function processInput(inputBlob) {
  const parseNumbers = (text) => text.split(' ').map(Number);
  const [primaryVal, secondaryVal] = parseNumbers(inputBlob);

  const calculatePairCount = (val) => {
    if (val % 2 !== 0) { // Odd
      return (val - 1) / 2;
    } else { // Even
      return (val - 2) / 2;
    }
  };

  const totalGeneratedPairs = calculatePairCount(primaryVal);
  if (totalGeneratedPairs <= 0) {
    return; // No pairs to generate or print
  }

  const zeroBasedIndices = Array.from({ length: totalGeneratedPairs }, (_, index) => index);

  let constructedPairs;

  if (primaryVal % 2 !== 0) { // Odd primaryVal
    constructedPairs = zeroBasedIndices.map(currentIdx => {
      const leftPart = currentIdx + 1;
      const rightPart = primaryVal - leftPart;
      return `${leftPart} ${rightPart}`;
    });
  } else { // Even primaryVal
    // Determine the single 0-indexed 'k' where the right component is additionally decremented.
    // This is derived from the original condition: (N - 1 - k) - (k + 1) <= N/2
    // which simplifies to: N - 2 - 2k <= N/2  =>  N/4 - 1 <= k.
    // So, 'k' is the smallest integer >= (N/4 - 1).
    const specialAdjustmentIndex = Math.ceil(primaryVal / 4 - 1);
    
    constructedPairs = zeroBasedIndices.map(currentIdx => {
      const leftPart = currentIdx + 1;
      let rightPart = primaryVal - 1 - currentIdx; // Base right component for even N

      // Apply the special decrement only at the calculated index
      if (currentIdx === specialAdjustmentIndex) {
        rightPart--;
      }
      return `${leftPart} ${rightPart}`;
    });
  }

  // Output only the required number of pairs
  constructedPairs.slice(0, secondaryVal).forEach(item => console.log(item));
}

// Don't edit this line!
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));