console.log((inputData => {
  const [_, sourceString] = inputData.trim().split('\n');
  const primeModulus = 1000000007;

  const modProduct = (val1, val2) => (val1 * val2) % primeModulus;

  const charIndices = Array.from(sourceString, c => c.charCodeAt(0) - 97);

  const rawFrequencies = charIndices.reduce((accumulator, currentIdx) => {
    accumulator[currentIdx]++;
    return accumulator;
  }, Array(26).fill(0));

  const termFactors = rawFrequencies.map(count => count + 1);

  const calculateRecursiveProduct = (factorsCollection, currentPosition = 0, currentAccumulator = 1) => {
    if (currentPosition === factorsCollection.length) {
      return currentAccumulator;
    }
    const nextAccumulator = modProduct(currentAccumulator, factorsCollection[currentPosition]);
    return calculateRecursiveProduct(factorsCollection, currentPosition + 1, nextAccumulator);
  };

  const finalProduct = calculateRecursiveProduct(termFactors);

  const resultValue = finalProduct - 1;

  return `${resultValue}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
