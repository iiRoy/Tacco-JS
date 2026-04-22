"use strict"; // Enforce strict parsing and error handling for cleaner code.

/**
 * Constructs a multi-dimensional array dynamically based on provided dimensions.
 * The inner-most arrays are filled with a specified initial value.
 *
 * @param {any} baseElement The value to fill the innermost arrays with.
 * @returns {Array} A new multi-dimensional array.
 */
function buildNesting(baseElement)
{
  // Collect all arguments passed to the function, which represent the dimensions.
  const inputArguments = arguments;
  // Get the total number of dimensions.
  let dimIndex = inputArguments.length;
  // Initialize the string that will be evaluated to create the array structure.
  // This starts with the innermost array.
  let nestedArrayString = `Array(inputArguments[${--dimIndex}]).fill(0).map(x_val => {return ${baseElement};})`;

  // Loop backward through the dimensions to build up the nested structure.
  while (--dimIndex >= 0)
  {
    nestedArrayString = `Array(inputArguments[${dimIndex}]).fill(0).map(x_val => ${nestedArrayString})`;
  }

  // Evaluate the generated string to create and return the multi-dimensional array.
  return eval(nestedArrayString);
}


// Initialize the readline interface for interactive console input/output.
const ioManager = require("readline").createInterface(process.stdin, process.stdout);

/**
 * This is the main asynchronous generator function that orchestrates the
 * interactive problem-solving process. It yields control to await user input.
 */
const interactiveSolver = (function* ()
{

  /**
   * Helper function to asynchronously read a single line of input from the console.
   * It uses `ioManager.once` to ensure only one line is processed per call.
   * @returns {Promise<string>} A promise that resolves with the input line.
   */
  const fetchInput = () => ioManager.once("line", receivedLine => interactiveSolver.next(receivedLine));

  // Step 1: Get the problem size 'N' from the user.
  let problemSize = yield fetchInput();
  problemSize = +problemSize; // Convert the input string to a number.

  // Step 2: Initialize the primary sequence (array 'P') with numbers from 1 to N.
  let primarySequence = [];
  for (let currentIdx = 0; currentIdx < problemSize; currentIdx++)
  {
    primarySequence[currentIdx] = currentIdx + 1;
  }

  // Step 3: Send the first query to the interactive system.
  console.log("?", primarySequence.join(" "));
  // Await the initial response from the system.
  const initialResponse = yield fetchInput();

  // Step 4: Determine the 'pivotIndex' by iteratively modifying the sequence
  // and observing changes in the system's response.
  let pivotIndex = 1;
  while (true)
  {
    // Modify the primary sequence for the next query.
    primarySequence[pivotIndex - 1] = pivotIndex + problemSize;
    // Send the modified sequence as a query.
    console.log("?", primarySequence.join(" "));
    // Await the system's response to this query.
    const currentResponse = yield fetchInput();

    // If the first character of the new response differs from the initial response,
    // we have found our pivot point.
    if (initialResponse[0] !== currentResponse[0])
    {
      break; // Exit the loop.
    }
    pivotIndex++; // Increment pivotIndex for the next iteration.
  }

  // Step 5: Prepare data structures for the final determination.
  let solutionArray = []; // Stores the final 'R' or 'B' answers.
  let alternateConfig = []; // A secondary sequence used for certain queries.
  let trackedValues = new Set(); // A set to keep track of elements in 'primarySequence'.

  // Step 6: Populate parts of 'primarySequence' and 'alternateConfig'
  // based on 'pivotIndex' and 'problemSize'.
  for (let currentIdx = 0; currentIdx < problemSize - 1; currentIdx++)
  {
    primarySequence[currentIdx] = (pivotIndex + currentIdx) % (2 * problemSize) + 1;
    alternateConfig[currentIdx] = (primarySequence[currentIdx] + problemSize) % (2 * problemSize) + 1;
    trackedValues.add(primarySequence[currentIdx]);
  }

  // Step 7: Iterate through all possible values from 1 to 2*N
  // to determine the 'R' or 'B' status for each.
  for (let currentVal = 1; currentVal <= 2 * problemSize; currentVal++)
  {
    if (trackedValues.has(currentVal))
    {
      // If the current value is in our tracked set, use the alternate configuration.
      alternateConfig[problemSize - 1] = currentVal;
      console.log("?", alternateConfig.join(" "));
      const tempState = yield fetchInput();
      if (tempState[0] === "R")
      {
        solutionArray[currentVal - 1] = "R";
      }
      else
      {
        solutionArray[currentVal - 1] = "B";
      }
    }
    else
    {
      // Otherwise, use the primary configuration.
      primarySequence[problemSize - 1] = currentVal;
      console.log("?", primarySequence.join(" "));
      const tempState = yield fetchInput();
      if (tempState[0] === "R")
      {
        solutionArray[currentVal - 1] = "R";
      }
      else
      {
        solutionArray[currentVal - 1] = "B";
      }
    }
  }

  // Step 8: Output the final combined solution.
  console.log("!", solutionArray.join(""));

})(); // End of the generator function definition.

// Start the interactive process by calling the generator's next method.
interactiveSolver.next();