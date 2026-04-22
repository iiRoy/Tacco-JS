// Function to compute the minimum cost based on array cycles
function calculateMinimumCost(  dataCollection, itemCount  ) {
  // Initialize the final accumulated cost
  let totalCost = 0;

  // Array to keep track of visited elements within cycles
  const processedItems = [  ];

  // Array to store a sorted version of the input numbers
  const orderedValues = [];

  // A mapping from value to its sorted index
  const positionLookup = [];

  // Determine the smallest value across the entire input collection
  const overallSmallest = Math.min(  ...dataCollection  );

  // Populate the sorted array and initialize visited flags
  for (let idx = 0; idx < itemCount; idx++) {
    orderedValues[idx] = dataCollection[idx];
    processedItems[idx] = false;
  }

  // Sort the values in ascending order
  orderedValues.sort((valA, valB) => valA - valB);

  // Build the lookup table: value -> its index in the sorted array
  for (let idx = 0; idx < itemCount; idx++) {
    positionLookup[orderedValues[idx]] = idx;
  }

  // Iterate through each element to find and process cycles
  for (let currentIdx = 0; currentIdx < itemCount; currentIdx++) {
    // If this element has already been part of a processed cycle, skip it
    if (processedItems[currentIdx]) continue;

    // Initialize variables for the current cycle
    let cycleStartNode = currentIdx;
    let cycleSum = 0;               // Sum of values in the current cycle
    let smallestInCycle = 1000000; // Smallest value in the current cycle (initialized to a large number)
    let nodeCount = 0;              // Number of nodes in the current cycle

    // Traverse the cycle
    while (true) {
      processedItems[cycleStartNode] = true; // Mark the current node as visited
      nodeCount++;                           // Increment node counter
      let nodeValue = dataCollection[cycleStartNode]; // Get the value of the current node
      smallestInCycle = Math.min(smallestInCycle, nodeValue); // Update cycle minimum
      cycleSum += nodeValue;                               // Add value to cycle sum
      cycleStartNode = positionLookup[nodeValue];          // Move to the next node in the cycle

      // If the next node has been visited, the cycle is complete
      if (processedItems[cycleStartNode]) break;
    }

    // Calculate the cost for the current cycle using two possible formulas
    // and add the minimum of the two to the total cost.
    // Formula 1: (sum of cycle) + (nodes in cycle - 2) * (min in cycle)
    // Formula 2: (min in cycle) + (sum of cycle) + (nodes in cycle + 1) * (overall minimum)
    totalCost += Math.min(
      cycleSum + (nodeCount - 2) * smallestInCycle,
      smallestInCycle + cycleSum + (nodeCount + 1) * overallSmallest
    );
  }

  // Return the final calculated total cost
  return totalCost;
}


// Main execution function to handle input and output
function runSolution( rawInputData ) {
  // Split the raw input string into an array of lines
  const inputLines = rawInputData.split('\n');

  // Parse the array length from the first line
  const dataLength = parseInt(  inputLines.shift(), 10  );

  // Parse the sequence of numbers from the second line
  const numberSequence = inputLines
    .shift()
    .split(' ')
    .map(  strElement => parseInt(strElement, 10)  );

  // Call the primary calculation function
  const calculatedResult = calculateMinimumCost(  numberSequence, dataLength  );

  // Output the final result to the console
  console.log(calculatedResult);
}


// Read input from standard input and execute the main solution
runSolution(  require('fs').readFileSync(  '/dev/stdin', 'utf8'  )  );