const processInputAndCalculate = (rawData) => {
  let allTokens = [];
  for (const line of rawData.trim().split('\n')) {
    allTokens.push(...line.split(' ').filter(t => t !== ''));
  }
  let tokenPointer = 0;

  const getNextToken = () => {
    if (tokenPointer < allTokens.length) {
      return parseInt(allTokens[tokenPointer++], 10);
    }
    throw new Error("Input data exhausted.");
  };

  // The original o.a() method reads tokens from right-to-left on a line.
  // For an input line like "MODULUS LENGTH" (e.g., "2 10"):
  // The first call to o.a() would get "LENGTH" (10).
  // The second call to o.a() would get "MODULUS" (2).
  // This means the original code's `n` variable effectively stores the input array length,
  // and `k` stores the modulus, if the input is "MODULUS LENGTH".
  // My parser reads left-to-right, so it will read MODULUS then LENGTH.
  const inputModulus = getNextToken(); // Corresponds to `k` in original main()
  const inputLength = getNextToken();  // Corresponds to `n` in original main()

  const dataSeries = []; // Corresponds to `a` in original main()
  for (let i = 0; i < inputLength; i++) {
    dataSeries.push(getNextToken() - 1); // Original has .map(a=>a-1)
  }

  // Prefix sum calculation (corresponds to `b` array)
  const moduloAccumulations = dataSeries.reduce((accumulatorSums, currentElement) => {
    const lastSum = accumulatorSums[accumulatorSums.length - 1];
    const newSum = (lastSum + currentElement) % inputModulus;
    accumulatorSums.push(newSum);
    return accumulatorSums;
  }, [0]); // Initialize with 0 for the empty prefix sum

  let resultCounter = 0; // Corresponds to `ans`
  const remainderFrequencies = new Map([[0, 1]]); // Corresponds to `c`, initialized with b[0]=0 count

  for (let currentPosition = 1; currentPosition <= inputLength; currentPosition++) { // Corresponds to loop `i = 0` to `n` in original, but `b` array is 1 longer
    const currentModuloValue = moduloAccumulations[currentPosition];

    // This block handles the `if(k <= i)c[b[i-k]]--;` part
    // It removes a prefix sum from consideration if its index is 'k' positions behind the current one.
    if (inputModulus <= currentPosition) { // 'k <= i'
      const valueToRemove = moduloAccumulations[currentPosition - inputModulus]; // 'b[i-k]'
      remainderFrequencies.set(valueToRemove, (remainderFrequencies.get(valueToRemove) || 0) - 1);
    }

    // This block handles the `if(c[b[i]])ans += c[b[i]]++; else c[b[i]] = 1;` part
    const existingCount = remainderFrequencies.get(currentModuloValue) || 0;
    resultCounter += existingCount;
    remainderFrequencies.set(currentModuloValue, existingCount + 1);
  }

  return resultCounter;
};