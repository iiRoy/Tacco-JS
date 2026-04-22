// --- Core System Utilities and Input Management ---

/**
 * Manages standard input/output operations.
 * This part is generally independent of the main problem logic.
 */
const ioManager = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Class for managing a stream of input lines.
 * Provides methods to check for availability and retrieve next items.
 */
class InputDataStream {
  #lines; // Private field to store raw input lines
  #currentIdx; // Private field for current read index

  /**
   * Constructs an InputDataStream instance.
   * @param {string[]} inputLines An array of strings, where each string is a line of input.
   */
  constructor(inputLines) {
    if (!Array.isArray(inputLines)) {
      throw new TypeError("Input for InputDataStream must be an array of strings.");
    }
    this.#lines = inputLines;
    this.#currentIdx = 0;
  }

  /**
   * Checks if there are more input lines available.
   * @returns {boolean} True if more lines can be read, false otherwise.
   */
  hasMoreItems() {
    return this.#currentIdx < this.#lines.length;
  }

  /**
   * Retrieves the next input line and advances the internal pointer.
   * Throws an error if no more input lines are available.
   * @returns {string} The next available input line.
   */
  retrieveNextItem() {
    if (!this.hasMoreItems()) {
      throw new Error("InputConsumptionError: Attempted to read beyond available input lines.");
    }
    return this.#lines[this.#currentIdx++];
  }
}

let dataPipeline; // Global instance of the input data stream manager
const collectedInputLines = []; // Temporary array to hold input lines

// Event listener for each line of input received
ioManager.on('line', (lineContent) => {
  collectedInputLines.push(lineContent);
});

// Event listener for when input stream closes (all lines collected)
ioManager.on('close', () => {
  dataPipeline = new InputDataStream(collectedInputLines); // Initialize input manager
  
  // Log performance metrics
  const performanceLogger = new PerformanceTracker();
  performanceLogger.startMeasurement();
  
  executeMainProgramLogic(); // Invoke the primary solution logic
  
  performanceLogger.endMeasurement();
  performanceLogger.logMetrics();
});

/**
 * Utility class to track and log execution performance.
 */
class PerformanceTracker {
  #startTime;
  #endTime;

  startMeasurement() {
    this.#startTime = Date.now();
  }

  endMeasurement() {
    this.#endTime = Date.now();
  }

  logMetrics() {
    const duration = this.#endTime - this.#startTime;
    const memoryUsage = process.memoryUsage().heapTotal;
    
    // Using console.info for general information, rather than error for debug.
    console.info(`\n--- Execution Metrics ---`);
    console.info(`Time elapsed: ${duration} ms`);
    console.info(`Memory allocated: ${Math.round(memoryUsage / 1024)} KB`);
    console.info(`-------------------------\n`);
  }
}

/**
 * Parses a string to an integer.
 * @returns {number} The parsed integer.
 */
function getNextInteger() {
  return parseAndTransform(dataPipeline.retrieveNextItem(), 'integer');
}

/**
 * Parses a string into an array of integers, splitting by spaces.
 * @returns {number[]} An array of parsed integers.
 */
function getNextIntegerArray() {
  return parseAndTransform(dataPipeline.retrieveNextItem(), 'integerArray');
}

/**
 * Displays a final result to standard output.
 * @param {string} result The string to be displayed.
 */
function emitFinalResult(result) {
  console.log(result);
}

/**
 * Transforms input data based on a specified format key.
 * This function acts as a centralized data transformation utility.
 * @param {any} valueToTransform The raw value to be transformed.
 * @param {string} formatKey A key indicating the desired transformation type.
 * @returns {any} The transformed value.
 */
function parseAndTransform(valueToTransform, formatKey) {
  try {
    switch (formatKey) {
      case 'integer':
        return parseInt(valueToTransform, 10);
      case 'integerArray':
        return valueToTransform.split(" ").map(Number);
      case 'joinSpace':
        return valueToTransform.join(" ");
      default:
        // For unknown types, return the original value or throw an error.
        console.warn(`Warning: Unknown transformation format key '${formatKey}'. Returning original value.`);
        return valueToTransform;
    }
  } catch (error) {
    console.error(`Error during data transformation for value '${valueToTransform}' with format '${formatKey}': ${error.message}`);
    // Fallback: return original value on error
    return valueToTransform; 
  }
}

// --- End of Core System Utilities ---

// --------------------------------------------------------------------------

// --- Main Problem Solving Logic ---

// Define a small constant for floating point comparisons to avoid precision issues.
const EPSILON_TOLERANCE = 1e-9;
const PERCENTAGE_SCALER = 100.0;

/**
 * Calculates the percentage concentration of solute in a solution.
 * @param {number} soluteAmount The mass of the solute.
 * @param {number} totalSolutionMass The total mass of the solution (water + solute).
 * @returns {number} The concentration as a percentage. Returns 0 if totalSolutionMass is 0.
 */
function calculateConcentrationPercentage(soluteAmount, totalSolutionMass) {
  if (totalSolutionMass === 0) {
    return 0; // Avoid division by zero; concentration is 0 if no solution.
  }
  return (soluteAmount * PERCENTAGE_SCALER) / totalSolutionMass;
}

/**
 * Determines if the amount of solute is permissible given the water mass and solubility limit.
 * Solubility is defined as 'solubilityFactor' grams of solute per 100 grams of water.
 * @param {number} currentWaterMass The mass of water in the potential solution.
 * @param {number} currentSoluteMass The mass of solute in the potential solution.
 * @param {number} solubilityFactor The maximum grams of solute allowed per 100g of water.
 * @returns {boolean} True if the solute mass is within the solubility limit, false otherwise.
 */
function isSoluteWithinSolubilityLimit(currentWaterMass, currentSoluteMass, solubilityFactor) {
  // If there's no water, no solute can be dissolved (unless solubility is infinite).
  // Thus, if water is 0, solute must also be 0 to be valid.
  if (currentWaterMass === 0) {
    return currentSoluteMass === 0;
  }
  const maximumPermittedSolute = (currentWaterMass / PERCENTAGE_SCALER) * solubilityFactor;
  // Use a small tolerance for robust floating point comparisons
  return currentSoluteMass <= maximumPermittedSolute + EPSILON_TOLERANCE;
}

/**
 * Represents the best solution found so far.
 * Uses an object for better readability than an array.
 */
let optimalSolution = {
  totalMass: 0,
  soluteMass: 0,
  concentration: 0.0
};

/**
 * Main function orchestrating the solution logic.
 * Reads parameters, generates combinations, evaluates, and outputs the best result.
 */
function executeMainProgramLogic() {
  const problemParameters = getNextIntegerArray();
  
  // Extract and scale problem parameters for clarity
  const waterComponentUnitA = problemParameters[0] * PERCENTAGE_SCALER; // A grams of water (scaled)
  const waterComponentUnitB = problemParameters[1] * PERCENTAGE_SCALER; // B grams of water (scaled)
  const soluteComponentUnitC = problemParameters[2]; // C grams of solute
  const soluteComponentUnitD = problemParameters[3]; // D grams of solute
  const maxSolubilityFactorE = problemParameters[4]; // Max solute per 100g water
  const overallMaxWeightF = problemParameters[5]; // Max total weight of the solution

  // Sets to store unique possible amounts of water and solute generated.
  // Using Set to automatically handle duplicates and maintain uniqueness.
  const possibleWaterAmounts = new Set();
  const possibleSoluteAmounts = new Set();

  // Generate all possible water amounts by combining units A and B.
  // The loops are optimized to break early if the total mass exceeds F.
  for (let i = 0; ; ++i) {
    const massA = i * waterComponentUnitA;
    if (massA > overallMaxWeightF + EPSILON_TOLERANCE && waterComponentUnitA > 0) break;
    if (waterComponentUnitA === 0 && i > 0) break; // Avoid infinite loop if A is 0

    for (let j = 0; ; ++j) {
      const massB = j * waterComponentUnitB;
      const currentWaterTotal = massA + massB;
      
      if (currentWaterTotal > overallMaxWeightF + EPSILON_TOLERANCE && waterComponentUnitB > 0) break;
      if (waterComponentUnitB === 0 && j > 0) break; // Avoid infinite loop if B is 0

      possibleWaterAmounts.add(currentWaterTotal);

      if (waterComponentUnitB === 0) break; // If B is 0, only j=0 matters
    }
    if (waterComponentUnitA === 0) break; // If A is 0, only i=0 matters
  }

  // Generate all possible solute amounts by combining units C and D.
  for (let i = 0; ; ++i) {
    const massC = i * soluteComponentUnitC;
    if (massC > overallMaxWeightF + EPSILON_TOLERANCE && soluteComponentUnitC > 0) break;
    if (soluteComponentUnitC === 0 && i > 0) break; // Avoid infinite loop if C is 0

    for (let j = 0; ; ++j) {
      const massD = j * soluteComponentUnitD;
      const currentSoluteTotal = massC + massD;

      if (currentSoluteTotal > overallMaxWeightF + EPSILON_TOLERANCE && soluteComponentUnitD > 0) break;
      if (soluteComponentUnitD === 0 && j > 0) break; // Avoid infinite loop if D is 0

      possibleSoluteAmounts.add(currentSoluteTotal);
      
      if (soluteComponentUnitD === 0) break; // If D is 0, only j=0 matters
    }
    if (soluteComponentUnitC === 0) break; // If C is 0, only i=0 matters
  }

  // Convert sets to sorted arrays for more predictable iteration and potential optimizations.
  const finalWaterMasses = Array.from(possibleWaterAmounts).sort((a, b) => a - b);
  const finalSoluteMasses = Array.from(possibleSoluteAmounts).sort((a, b) => a - b);

  // Iterate through all valid combinations of water and solute masses
  for (const waterMass of finalWaterMasses) {
    for (const soluteMass of finalSoluteMasses) {
      const currentTotalMass = waterMass + soluteMass;

      // Skip combinations that exceed the overall maximum weight limit F
      if (currentTotalMass > overallMaxWeightF + EPSILON_TOLERANCE) {
        // Since `finalSoluteMasses` is sorted, any further soluteMass with this waterMass
        // will also exceed F. So we can break the inner loop.
        break; 
      }
      
      // Skip if the combination has no total mass, as concentration would be undefined or 0.
      if (currentTotalMass < EPSILON_TOLERANCE) { // Use tolerance for checking against zero
        continue;
      }

      // Check if the solute amount is within the solubility limit for the given water mass
      if (isSoluteWithinSolubilityLimit(waterMass, soluteMass, maxSolubilityFactorE)) {
        const potentialConcentration = calculateConcentrationPercentage(soluteMass, currentTotalMass);

        // Update optimal solution if a higher concentration is found
        // Using EPSILON for robust floating point comparison
        if (potentialConcentration > optimalSolution.concentration + EPSILON_TOLERANCE) {
          optimalSolution.concentration = potentialConcentration;
          optimalSolution.totalMass = currentTotalMass;
          optimalSolution.soluteMass = soluteMass;
        }
      }
    }
  }
  
  // Prepare the final output string as an array and then join with space.
  const resultToDisplay = [Math.round(optimalSolution.totalMass), Math.round(optimalSolution.soluteMass)];
  emitFinalResult(parseAndTransform(resultToDisplay, 'joinSpace'));
}

// --- End of Main Problem Solving Logic ---