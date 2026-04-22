const ioInterface = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputBuffer = []; // Stores raw input lines from stdin
let inputProcessor;   // Object to manage input line fetching

// Event handler for each line received from input
ioInterface.on('line', function(singleLine){
  inputBuffer.push(singleLine);
});

// Event handler for when the input stream is closed
ioInterface.on('close', function(){
  inputProcessor = createInputHandler(inputBuffer);
  // Output a debug message to stderr, indicating input/output direction
  console.error('\n⬆️ Input ⬇️ Output'); 
  initiatePuzzleSolver(); // Call the main problem-solving function
});

/**
 * Utility function to transform a raw string token into various data types or formats.
 * This replaces the original 'myconv' function with more descriptive parameters and types.
 * @param {string} tokenValue - The string token to transform.
 * @param {number} conversionType - Numeric code indicating the desired conversion.
 *   1: Parse as integer.
 *   2: Split by space into a string array.
 *   4: Split by space into a numeric array.
 *   6: Split into a character array.
 *   7: Split into character array and convert each to number.
 *   8: Join array elements with a space.
 *   9: Join array elements with a newline.
 *   0: Join array elements without a separator.
 * @returns {any} The transformed value or original token if conversion fails/is not specified.
 */
function transformToken(tokenValue, conversionType){
  try{
    switch(conversionType){
      case 1: return parseInt(tokenValue, 10);
      case 2: return tokenValue.split(' ');
      case 4: return tokenValue.split(' ').map(Number);
      case 6: return tokenValue.split('');
      case 7: return tokenValue.split('').map(Number);
      case 8: return tokenValue.join(' ');
      case 9: return tokenValue.join('\n');
      case 0: return tokenValue.join('');
      default: return tokenValue;
    }
  }catch(error){
    // If an error occurs during conversion, return the original token value
    return tokenValue;
  }
}

/**
 * Creates an object to handle sequential fetching of input lines.
 * This replaces the original 'init' function.
 * @param {string[]} rawLines - An array of raw input strings.
 * @returns {object} An object with methods to manage input.
 */
function createInputHandler(rawLines){  
  return {
    parsedLines : rawLines,
    currentIndex : 0,
    totalLines : rawLines.length,
    /** Checks if there are more lines available to fetch. */
    hasMoreData : function(){
      return (this.currentIndex < this.totalLines);
    },
    /** Fetches and returns the next line of input. Throws an error if no more lines. */
    fetchNextLine : function(){
      if(this.hasMoreData()){
        return this.parsedLines[this.currentIndex++];
      }else{
        throw new Error('EndOfInputException: Attempted to read past end of input data.');
      }
    }
  };
}

/** Outputs the final solution string to standard output. */
function printSolution(outputString){
  console.log(outputString);
}

/** Logs detailed debug information to standard error. */
function debugLog(debugMessage){
  console.error('DEBUG INFO: ' + require('util').inspect(debugMessage, false, null));
}

// Helper functions for fetching specific input types, using the inputProcessor
const fetchInteger = () => transformToken(inputProcessor.fetchNextLine(), 1);
const fetchCharacterArray = () => transformToken(inputProcessor.fetchNextLine(), 6);

/**
 * Infers the state of an observed animal based on the observer's state and their statement.
 * This is crucial for consistency checks in the circular animal problem.
 * 'S' = Sheep, 'W' = Wolf. 'o' = says same, 'x' = says different.
 * Assumes: observerState makes 'statement' about 'observedAnimalState'.
 * @param {'S'|'W'} observerState - The state of the animal making the statement.
 * @param {'o'|'x'} statement - The statement made by the observer ('o' for same, 'x' for different).
 * @returns {'S'|'W'} The inferred state of the observed animal.
 */
function getInferredObservedState(observerState, statement) {
    if (observerState === 'S') { // Sheep (truthful)
        // If Sheep says 'o' (same), observed must be 'S'. If 'x' (different), observed must be 'W'.
        return (statement === 'o') ? 'S' : 'W';
    } else { // Wolf (liar)
        // If Wolf says 'o' (same), it means observed is *different* from Wolf, so 'S'.
        // If Wolf says 'x' (different), it means observed is *same* as Wolf, so 'W'.
        return (statement === 'o') ? 'W' : 'S'; 
    }
}

/**
 * Calculates the state of the (i+1)-th animal using a specific recurrence relation.
 * This relation propagates states based on the i-th and (i-1)-th animal states
 * and the i-th animal's observation about the (i-1)-th animal.
 * The logic is equivalent to: s_{i+1} = s_i XOR s_{i-1} XOR statement_i
 * where S=0, W=1, o=0, x=1.
 * @param {'S'|'W'} currentAnimalState - State of animal 'i'.
 * @param {'S'|'W'} previousAnimalState - State of animal 'i-1'.
 * @param {'o'|'x'} currentAnimalObservation - Statement of animal 'i' about 'i-1'.
 * @returns {'S'|'W'} The derived state for animal 'i+1'.
 */
function calculateNextAnimalState(currentAnimalState, previousAnimalState, currentAnimalObservation) {
    // Convert states and observations to binary (0 for S/o, 1 for W/x) for XOR logic
    const sCurrBinary = (currentAnimalState === 'S') ? 0 : 1;
    const sPrevBinary = (previousAnimalState === 'S') ? 0 : 1;
    const obsBinary = (currentAnimalObservation === 'o') ? 0 : 1;

    // Apply the XOR recurrence relation
    const sNextBinary = sCurrBinary ^ sPrevBinary ^ obsBinary;
    
    // Convert the binary result back to 'S' or 'W'
    return (sNextBinary === 0) ? 'S' : 'W';
}

/**
 * Attempts to construct a full sequence of animal states given initial states for animal 0 and animal 1.
 * It then performs circular consistency checks.
 * @param {number} totalAnimals - The total number of animals (N).
 * @param {('o'|'x')[]} statementsArray - Array of statements, where statementsArray[i] is animal i's statement about animal i-1.
 * @param {'S'|'W'} initialS0 - The assumed state for animal 0.
 * @param {'S'|'W'} initialS1 - The assumed state for animal 1.
 * @returns {string[]|null} An array of animal states ('S' or 'W') if a consistent solution is found, otherwise null.
 */
function evaluateSolutionAttempt(totalAnimals, statementsArray, initialS0, initialS1) {
    // Guard clause for invalid animal count
    if (totalAnimals <= 0) {
        return null; 
    }

    // Array to store derived animal states, up to N (where N should logically be S0)
    const derivedStates = new Array(totalAnimals + 1); 
    derivedStates[0] = initialS0;
    derivedStates[1] = initialS1;

    // Special handling for the N=1 case: animal 0 observes itself
    if (totalAnimals === 1) {
        // Check if animal 0's statement about itself is consistent with its assumed state
        if (getInferredObservedState(derivedStates[0], statementsArray[0]) === derivedStates[0]) {
            return [derivedStates[0]]; // Solution found for N=1
        }
        return null; // No consistent solution for N=1
    }

    // Propagate states for N > 1 using the recurrence relation
    // Loop from currentIdx = 1 to N-1 to calculate derivedStates[2] through derivedStates[N]
    for (let currentIdx = 1; currentIdx < totalAnimals; currentIdx++) {
        derivedStates[currentIdx + 1] = calculateNextAnimalState(
            derivedStates[currentIdx],         // State of animal 'currentIdx'
            derivedStates[currentIdx - 1],     // State of animal 'currentIdx - 1'
            statementsArray[currentIdx]        // Statement of animal 'currentIdx' about 'currentIdx - 1'
        );
    }

    // Perform circular consistency checks at the "ends" of the circle:
    // 1. Check if the derived state for animal N matches the initial state of animal 0.
    //    This is because animal N is logically animal 0 in a circle.
    if (derivedStates[totalAnimals] !== derivedStates[0]) {
        return null; // Inconsistent: s_N does not match s_0
    }

    // 2. Check animal 0's statement about animal N-1.
    //    Animal 0 (state derivedStates[0]) makes statement statementsArray[0] about Animal N-1 (state derivedStates[totalAnimals - 1]).
    const inferredS_N_minus_1 = getInferredObservedState(derivedStates[0], statementsArray[0]);
    if (inferredS_N_minus_1 !== derivedStates[totalAnimals - 1]) {
        return null; // Inconsistent
    }

    // 3. Check animal N-1's statement about animal N-2.
    //    Animal N-1 (state derivedStates[totalAnimals - 1]) makes statement statementsArray[totalAnimals - 1] about Animal N-2 (state derivedStates[totalAnimals - 2]).
    const inferredS_N_minus_2 = getInferredObservedState(derivedStates[totalAnimals - 1], statementsArray[totalAnimals - 1]);
    if (inferredS_N_minus_2 !== derivedStates[totalAnimals - 2]) {
        return null; // Inconsistent
    }
    
    // If all checks pass, a valid sequence has been found.
    // Return the sequence from s_0 to s_{N-1}, excluding the extra s_N element.
    return derivedStates.slice(0, totalAnimals);
}

/**
 * Orchestrates the solution process for the circular animal puzzle.
 * This is the main function, renamed from 'Main'.
 */
function initiatePuzzleSolver(){
  const totalAnimals = fetchInteger(); // Read N (number of animals)
  const animalStatements = fetchCharacterArray(); // Read list (statements)

  // Define all 4 possible initial configurations for (animal_0, animal_1)
  const initialConfigurationAttempts = [
    ['S', 'S'], // Animal 0 is Sheep, Animal 1 is Sheep
    ['S', 'W'], // Animal 0 is Sheep, Animal 1 is Wolf
    ['W', 'S'], // Animal 0 is Wolf, Animal 1 is Sheep
    ['W', 'W']  // Animal 0 is Wolf, Animal 1 is Wolf
  ];

  let finalConsistentSolution = null;

  // Iterate through each initial configuration attempt
  for (const [firstAnimalState, secondAnimalState] of initialConfigurationAttempts) {
    const currentSolutionCandidate = evaluateSolutionAttempt(totalAnimals, animalStatements, firstAnimalState, secondAnimalState);
    if (currentSolutionCandidate !== null) {
      // If a consistent solution is found, store it and stop searching
      finalConsistentSolution = currentSolutionCandidate;
      break; 
    }
  }

  // Output the result: either the joined sequence of states or -1 if no solution
  if (finalConsistentSolution !== null) {
    printSolution(finalConsistentSolution.join(""));
  } else {
    printSolution("-1"); // No consistent assignment found
  }
}