function formRectangleArea(inputLengths, stock) {
  // Preserve the observable side effect: sort the input array in descending order.
  // This ensures behavioral equivalence with the original function, which modifies 'sticks' in place.
  stock.sort((firstDimension, secondDimension) => secondDimension - firstDimension);

  // Utilize a frequency map to tally occurrences of each stick length.
  // This changes the internal data representation from a sorted array to a count of each unique length.
  const dimensionTallies = stock.reduce((tallyMap, currentDimension) => {
    tallyMap.set(currentDimension, (tallyMap.get(currentDimension) || 0) + 1);
    return tallyMap;
  }, new Map());

  // Aggregate all lengths that can potentially form a side of the rectangle.
  // A length can form a side if it appears at least twice.
  // If a length appears four or more times, it can form two sides of that same length.
  const potentialDimensions = [];
  for (const [dimensionValue, occurrenceCount] of dimensionTallies.entries()) {
    if (occurrenceCount >= 2) {
      potentialDimensions.push(dimensionValue);
      if (occurrenceCount >= 4) {
        // If there are enough sticks for two sides of the same length, add it again.
        potentialDimensions.push(dimensionValue);
      }
    }
  }

  // Sort the potential dimensions in descending order.
  // This allows us to easily pick the two largest available dimensions for the rectangle.
  potentialDimensions.sort((dimA, dimB) => dimB - dimA);

  // Extract the two largest dimensions that can form sides.
  // If fewer than two distinct pairs were found, the corresponding side defaults to 0.
  const firstRectSide = potentialDimensions[0] || 0;
  const secondRectSide = potentialDimensions[1] || 0;

  // Calculate and return the area of the rectangle.
  // If either side is 0 (due to insufficient pairs), the result will correctly be 0.
  return firstRectSide * secondRectSide;
}
