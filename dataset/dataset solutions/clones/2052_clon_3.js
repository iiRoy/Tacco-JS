const generateCombinationsStringKey = (firstParam, secondParam) => `${firstParam}C${secondParam}`;

const createCachingDecorator = (originalFunction) => {
  const memoizedStore = new Map(); // Using Map for better key handling than plain object
  return (nVal, kVal) => {
    const uniqueKey = generateCombinationsStringKey(nVal, kVal);
    if (!memoizedStore.has(uniqueKey)) {
      memoizedStore.set(uniqueKey, originalFunction(nVal, kVal));
    }
    return memoizedStore.get(uniqueKey);
  };
};

const computeCombinationsImpl = (totalItems, selectItems) => {
  // Guard clause for invalid inputs
  if (selectItems < 0 || selectItems > totalItems) {
    return 0;
  }
  if (selectItems === 0 || selectItems === totalItems) {
    return 1;
  }
  // Optimization: C(n, k) = C(n, n-k)
  if (selectItems > totalItems / 2) {
    selectItems = totalItems - selectItems;
  }

  let permutationPart = 1; // Represents P(n, k)
  for (let currentFactor = 0; currentFactor < selectItems; ++currentFactor) {
    permutationPart *= (totalItems - currentFactor);
  }

  let divisorFactorial = 1; // Represents k!
  for (let currentFactor = 1; currentFactor <= selectItems; ++currentFactor) {
    divisorFactorial *= currentFactor;
  }

  // Ensure integer result, though JS division handles floats
  return Math.round(permutationPart / divisorFactorial);
};

const cachedCombinationSolver = createCachingDecorator(computeCombinationsImpl);

// Helper function to parse the input sequence of numbers
const parseNumericSequence = (rawNumericLine) => {
  if (!rawNumericLine || rawNumericLine.length === 0) {
    return [];
  }
  return rawNumericLine.split(' ').map(str => {
    const num = parseInt(str, 10);
    if (isNaN(num)) {
      // Basic validation for non-numeric entries
      console.error(`Warning: Non-numeric value found in sequence: ${str}`);
      return null; // Or throw an error, depending on desired robustness
    }
    return num;
  }).filter(num => num !== null); // Filter out any nulls from invalid parsing
};

// Helper function to calculate the sum of C(count, 2) for all counts > 1
const calculateCurrentCombinationsSum = (tallyMap) => {
  let totalCombinations = 0;
  for (const itemFrequency of tallyMap.values()) {
    // Only consider elements that appear more than once
    if (itemFrequency > 1) {
      totalCombinations += cachedCombinationSolver(itemFrequency, 2);
    }
  }
  return totalCombinations;
};

const processDataStream = (rawDataSegment) => {
  // Pre-process the raw input string
  const processedLines = rawDataSegment.trim().split('\n');

  // Guard for insufficient input lines
  if (processedLines.length < 2) {
    console.error("Error: Input data requires at least two lines.");
    return [];
  }

  // Parse the sequence of numbers from the second line
  const targetElements = parseNumericSequence(processedLines[1]);

  // Initial frequency count of each element using a Map
  const elementTallies = new Map();
  for (const elementValue of targetElements) {
    elementTallies.set(elementValue, (elementTallies.get(elementValue) || 0) + 1);
  }

  // Cache for pre-calculated results specific to each element, after temporary removal
  const calculatedOutcomes = new Map();
  const finalResultsArray = []; // Array to store all computed outputs

  // Iterate through the target elements to compute the sum of combinations for each scenario
  for (let iterationIndex = 0; iterationIndex < targetElements.length; ++iterationIndex) {
    const currentElementIdentifier = targetElements[iterationIndex];
    const originalCount = elementTallies.get(currentElementIdentifier);

    // Temporarily decrement the count of the current element to simulate its removal
    elementTallies.set(currentElementIdentifier, originalCount - 1);

    // Check if this specific scenario (with 'currentElementIdentifier' removed) has been computed
    if (!calculatedOutcomes.has(currentElementIdentifier)) {
      // If not cached, calculate the sum of combinations for the modified tallies
      const currentScenarioTotal = calculateCurrentCombinationsSum(elementTallies);
      calculatedOutcomes.set(currentElementIdentifier, currentScenarioTotal);
      finalResultsArray.push(currentScenarioTotal);
    } else {
      // If cached, retrieve the pre-computed value
      finalResultsArray.push(calculatedOutcomes.get(currentElementIdentifier));
    }

    // Restore the original count of the current element for the next iteration
    elementTallies.set(currentElementIdentifier, originalCount);
  }

  return finalResultsArray; // Return the array of results
};

// Main application entry point for execution
const applicationEntry = () => {
  // Determine input source: environment variable for testing or standard input
  const inputSource = process.env.RUN_TESTS_LOCALLY
    ? 'dummy input' // Placeholder for local testing, replace with actual test data if needed
    : require('fs').readFileSync('/dev/stdin', 'utf8');

  // Process the input and retrieve the results
  const computedOutputs = processDataStream(inputSource);

  // Output each result on a new line
  computedOutputs.forEach(output => console.log(output));
};

// Execute the application
applicationEntry();