const parseInputData = (inputString) => {
  const lines = inputString.trim().split('\n');
  const [numElementsRaw] = lines[0].split(' ').map(val => Number.parseInt(val, 10));
  const dataArrayRaw = lines[1].split(' ').map(val => Number.parseInt(val, 10));
  return { numElements: numElementsRaw, dataArray: dataArrayRaw };
};

const calculateModularProduct = (factorA, factorB, modulusValue) => {
  return (factorA * factorB) % modulusValue;
};

const executeSolution = (inputContent) => {
  const { numElements, dataArray } = parseInputData(inputContent);

  const modulusValue = 1e9 + 7;
  const maxArrayValue = Math.max(...dataArray);

  const primeTracker = Array(maxArrayValue + 1).fill(true);
  const maxPrimeExponents = new Map(); // Stores the maximum exponent for each prime factor across all numbers in dataArray

  // Step 1: Sieve of Eratosthenes to find primes and initialize maxPrimeExponents
  for (let currentPrime = 2; currentPrime <= maxArrayValue; currentPrime++) {
    if (!primeTracker[currentPrime]) continue;
    for (let multipleIndex = currentPrime * 2; multipleIndex <= maxArrayValue; multipleIndex += currentPrime) {
      primeTracker[multipleIndex] = false;
    }
    maxPrimeExponents.set(currentPrime, 0); // Initialize max exponent for this prime to 0
  }

  const elementPrimeFactorizations = []; // Array of Maps, each Map stores prime factors and their counts for dataArray[elementIndex]

  // Step 2: Factorize each number in dataArray and update maxPrimeExponents
  for (let elementIndex = 0; elementIndex < numElements; elementIndex++) {
    let currentNumber = dataArray[elementIndex];
    const currentElementFactors = new Map();
    elementPrimeFactorizations.push(currentElementFactors);

    // Iterate over primes in ascending order (Map iteration order is insertion order)
    for (const [primeFactor, currentMaxExp] of maxPrimeExponents) {
      if (currentNumber === 1) break; // Optimization: if number becomes 1, no more prime factors

      let factorCount = 0;
      while (currentNumber > 0 && currentNumber % primeFactor === 0) {
        currentNumber /= primeFactor;
        factorCount++;
      }
      if (factorCount > 0) {
        currentElementFactors.set(primeFactor, factorCount);
      }
      // Update max exponent for primeFactor if current factorCount is greater
      if (factorCount > currentMaxExp) {
        maxPrimeExponents.set(primeFactor, factorCount);
      }
    }
  }

  let totalSum = 0;

  // Step 3: Calculate B for each element and sum them up
  for (let elementIndex = 0; elementIndex < numElements; elementIndex++) {
    let currentTermB = 1;
    const currentElementFactors = elementPrimeFactorizations[elementIndex];

    for (const [primeFactor, requiredExponent] of maxPrimeExponents) {
      if (requiredExponent === 0) continue; // If max exponent is 0, skip

      const elementFactorCount = currentElementFactors.get(primeFactor) || 0;
      const exponentDifference = requiredExponent - elementFactorCount;

      // Calculate primeFactor ^ exponentDifference
      const primePowerComponent = Math.pow(primeFactor, exponentDifference);
      currentTermB = calculateModularProduct(currentTermB, primePowerComponent, modulusValue);
    }
    totalSum = (totalSum + currentTermB) % modulusValue;
  }

  return totalSum;
};

console.log(executeSolution(require('fs').readFileSync('/dev/stdin', 'utf8')));
