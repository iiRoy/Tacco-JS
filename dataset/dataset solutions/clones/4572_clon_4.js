function computeOptimalPartition() {
  const retrieveDimensions = () => {
    // This function conceptually replaces `nextIntArray()` from the original boilerplate.
    // It is assumed that an external mechanism (outside this generated code)
    // maps `retrieveDimensions` to the actual input reader, e.g., `const retrieveDimensions = nextIntArray;`.
    // For standalone execution, it would need a mock or direct input.
    // For this clone, we rely on the environment providing it.
    // It should return an array of two numbers [H, W].
    // Placeholder for actual input mechanism.
    // In the context of the problem, this would invoke the boilerplate's input reader.
    return (typeof nextIntArray === 'function') ? nextIntArray() : [parseInt(process.argv[2]), parseInt(process.argv[3])];
  };

  const displayFinalValue = (value) => {
    // This function conceptually replaces `myout()` from the original boilerplate.
    // It is assumed that an external mechanism maps `displayFinalValue` to the output writer,
    // e.g., `const displayFinalValue = myout;`.
    // Placeholder for actual output mechanism.
    (typeof myout === 'function') ? myout(value) : console.log(value);
  };

  const calculateMinimalDisparity = (dimensionPrimary, dimensionSecondary, initialComparisonValue) => {
    if (dimensionPrimary < 3) {
      return initialComparisonValue; // Cannot be cut into three pieces along this dimension
    }

    // Iterate through possible lengths for the first piece, from 1 to dimensionPrimary - 2
    // This replaces the imperative 'for' loop with a functional reduction.
    return Array.from({ length: dimensionPrimary - 2 }, (_, index) => index + 1)
      .reduce((currentLowestDisparity, currentSliceLength) => {
        const remainingPrimaryLength = dimensionPrimary - currentSliceLength;

        // Cutting Strategy A: Divide `dimensionPrimary` into three segments.
        // One segment of length `currentSliceLength`, and the remaining `remainingPrimaryLength`
        // split as evenly as possible into two segments. All three segments span `dimensionSecondary`.
        const verticalPieceA = currentSliceLength * dimensionSecondary;
        const verticalPieceB = Math.floor(remainingPrimaryLength / 2) * dimensionSecondary;
        const verticalPieceC = Math.ceil(remainingPrimaryLength / 2) * dimensionSecondary;
        const disparityFromVerticalCut = Math.max(verticalPieceA, verticalPieceB, verticalPieceC) - Math.min(verticalPieceA, verticalPieceB, verticalPieceC);

        // Cutting Strategy B: Divide `dimensionPrimary` into two segments.
        // One segment of `currentSliceLength` spanning `dimensionSecondary`.
        // The other segment of `remainingPrimaryLength` is then divided along `dimensionSecondary`
        // into two pieces, splitting `dimensionSecondary` as evenly as possible.
        const mixedPieceA = currentSliceLength * dimensionSecondary;
        const mixedPieceB = remainingPrimaryLength * Math.floor(dimensionSecondary / 2);
        const mixedPieceC = remainingPrimaryLength * Math.ceil(dimensionSecondary / 2);
        const disparityFromMixedCut = Math.max(mixedPieceA, mixedPieceB, mixedPieceC) - Math.min(mixedPieceA, mixedPieceB, mixedPieceC);

        return Math.min(currentLowestDisparity, disparityFromVerticalCut, disparityFromMixedCut);
      }, initialComparisonValue);
  };

  const initialShapeMetrics = retrieveDimensions();
  const majorExtent = initialShapeMetrics[0];
  const minorExtent = initialShapeMetrics[1];

  const initialHighValue = 100000000000; 
  let finalDisparity = initialHighValue;

  // Evaluate cuts with current orientation (e.g., H x W)
  finalDisparity = Math.min(finalDisparity, calculateMinimalDisparity(majorExtent, minorExtent, initialHighValue));

  // Evaluate cuts with swapped orientation (e.g., W x H)
  finalDisparity = Math.min(finalDisparity, calculateMinimalDisparity(minorExtent, majorExtent, initialHighValue));

  displayFinalValue(finalDisparity);
}