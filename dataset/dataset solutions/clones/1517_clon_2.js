// A helper routine to search for a specific element's first occurrence within a sequence.
const findCycleIndex = (  sequenceArray,  arrayLength,  targetValue  ) => {

  // Iterate through each position in the provided sequence.
  for ( let searchPos = 0;  searchPos < arrayLength;  searchPos++ ) {
    // If the current element matches our target, its index is the result.
    if ( sequenceArray[searchPos] === targetValue ) {
      return searchPos;
    }
  }
  // If the value is not found after checking all elements, return the array's full length.
  return arrayLength;
};


// The primary execution function for processing the input data.
const processCalculation = ( inputString ) => {

    // Parse the numeric parameters from the input string.
    const [ maxSteps, initialValue, moduloDivisor ] = inputString.split(" ").map(val => Number(val));
    
    // Initialize an array to store the computed sequence values.
    // Length is based on the modulus, as values will repeat within this range.
    let computedValues = Array.from({ length: moduloDivisor }).fill(0);
    
    // Initialize an array to record the first index at which each value (0 to M-1) is encountered.
    // A value of 0 indicates it hasn't been seen yet, assuming 0 is not a valid index.
    let valueOccurrences = Array.from({ length: moduloDivisor }).fill(0);
    
    // Set the very first element of our sequence.
    computedValues[0] = initialValue;
    // Record the initial value's position. This is the potentially problematic line from original.
    valueOccurrences[0] = initialValue; 
    
    // console.log(computedValues); // Debugging output for the sequence.
    
    let currentIteration = 1;
    let cycleStartPoint = 0;
    
    // Loop to generate the sequence and detect cycles.
    // Continues until a value repeats or the modulus limit is reached.
    for ( ; currentIteration < moduloDivisor; currentIteration++ ) {
        
        // Calculate the next value in the sequence: square of previous, then modulo.
        computedValues[currentIteration] = Math.pow(computedValues[currentIteration - 1], 2) % moduloDivisor;
        
        // console.log(`computedValues[${currentIteration}]=${computedValues[currentIteration]}`); // Detailed step output.
        
        // Check if this newly computed value has been seen before.
        if ( valueOccurrences[computedValues[currentIteration]] !== 0 ) {
            // A cycle has been detected!
            // console.log(currentIteration); // Indicate the cycle detection point.
            cycleStartPoint = valueOccurrences[computedValues[currentIteration]];
            break; // Exit the loop as the cycle is found.
        } else {
            // If it's a new value, record its first occurrence index.
            valueOccurrences[computedValues[currentIteration]] = currentIteration;
        }
        
        // The original code had a commented-out call to `checkLoop` here:
        // cycleStartPoint = findCycleIndex(computedValues, currentIteration, computedValues[currentIteration]);
        // if ( cycleStartPoint !== currentIteration ) {
        //     break;
        // }
    }
    
    // console.log(computedValues); // Final state of the sequence array.
    
    // Mark the end of the detected cycle (or the end of the M-length sequence if no cycle).
    const cycleEndPoint = currentIteration;
    
    // Calculate how many full repetitions of the cycle fit within the remaining steps.
    const cycleRepetitions = Math.floor(maxSteps / (currentIteration - cycleStartPoint));

    let totalAccumulation = 0; // The final sum we are calculating.
    let currentCycleSum = 0;   // Accumulator for the sum of values within one cycle.
    
    // Sum up the values within a single instance of the detected cycle.
    for ( currentIteration = cycleStartPoint; currentIteration < cycleEndPoint; currentIteration++ ) {
        currentCycleSum += computedValues[currentIteration];
    }
    
    // Add the sum of the full cycle repetitions to the total.
    totalAccumulation += currentCycleSum * cycleRepetitions;

    // Add the values that occur before the cycle begins.
    for ( currentIteration = 0; currentIteration < cycleStartPoint; currentIteration++ ) {
        totalAccumulation += computedValues[currentIteration];
    }

    // Calculate any remaining steps that are part of the cycle but don't form a full repetition.
    const remainingIterations = maxSteps - cycleStartPoint - (cycleEndPoint - cycleStartPoint) * cycleRepetitions;
    
    // console.log(`remainingIterations=${remainingIterations}`); // Debugging remaining steps.
    
    // Add the values for these remaining partial cycle steps.
    for ( currentIteration = cycleStartPoint; currentIteration < cycleStartPoint + remainingIterations; currentIteration++ ) {
        totalAccumulation += computedValues[currentIteration];
    }
    
    // Output the final accumulated sum.
    console.log(totalAccumulation);
};

// Execute the main processing function by reading input from standard input.
processCalculation(require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" }));