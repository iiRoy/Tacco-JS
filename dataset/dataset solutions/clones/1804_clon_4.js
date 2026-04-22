const processDataStream = (programInput) => {
  const contentSegments = programInput.trim().split('\n');
  const totalCaseCount = Number(contentSegments[0]);

  // Helper to structure all test case data at once
  let currentPointer = 1;
  const allCaseSpecifications = Array.from({ length: totalCaseCount }).map(() => {
    const elementQuantity = Number(contentSegments[currentPointer++]);
    const numberSequence = contentSegments[currentPointer++].split(' ').map(Number);
    const binaryOperationPattern = contentSegments[currentPointer++];
    return { elementQuantity, numberSequence, binaryOperationPattern };
  });

  // Functional approach to generate all possible XOR sums from an array of numbers
  const formAllXorSums = (sourceNumbers) =>
    sourceNumbers.reduce(
      (currentCollection, currentVal) =>
        new Set([
          ...currentCollection,
          ...Array.from(currentCollection).map((existingSum) => existingSum ^ currentVal),
        ]),
      new Set([0])
    );

  // Determine the count of trailing '0's in a binary string using a regex pattern
  const findTrailingZeroes = (patternString) =>
    (patternString.match(/0*$/) || [''])[0].length;

  // Process each test case using a functional map
  const finalOutcomes = allCaseSpecifications.map(
    ({ elementQuantity, numberSequence, binaryOperationPattern }) => {
      const trailingZeroQuantity = findTrailingZeroes(binaryOperationPattern);

      const mandatoryPrefixElements = numberSequence.slice(0, elementQuantity - trailingZeroQuantity);
      const optionalSuffixElements = numberSequence.slice(elementQuantity - trailingZeroQuantity);

      const prefixXorSums = formAllXorSums(mandatoryPrefixElements);
      const suffixXorSums = formAllXorSums(optionalSuffixElements);

      // Check if every sum generated from the prefix elements can be matched (cancelled to 0) by a sum from the suffix elements
      const allCancellable = Array.from(prefixXorSums).every((prefixSumValue) =>
        suffixXorSums.has(prefixSumValue)
      );

      return allCancellable ? '0' : '1';
    }
  );

  console.log(finalOutcomes.join('\n'));
};

// Standard input reading boilerplate, outside the main logic
processDataStream(require('fs').readFileSync('/dev/stdin', 'utf8'));