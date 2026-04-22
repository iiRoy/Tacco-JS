// This function is designed to process an input string,
// interpret it as a numerical count, and then generate
// a sequence of numbers based on specific rules.
function processInputData(
  // The raw string content received for processing.
  rawTextContent
) {
  // Convert the textual input into an integer representing
  // the desired number of elements in the final collection.
  let targetCount = parseInt(rawTextContent);

  // Initialize a mutable array to store the computed numerical sequence.
  // Using 'let' because the array reference itself might be reassigned.
  let outputCollection = [];

  // Conditional logic for handling a specific predefined scenario
  // when the target count is exactly three.
  if (targetCount === 3) {
    // For the special case of three, assign a fixed set of values.
    outputCollection = [2, 3, 25];
  } else {
    // This branch executes for all other target count values,
    // involving a more complex generation algorithm.

    // A nested loop structure is used to populate the collection.
    // The outer loop iterates a fixed number of times (30000 / 12 = 2500 iterations).
    for (
      let primaryCounter = 0; // Initialize primary loop counter
      primaryCounter < 2500; // Loop until primaryCounter reaches 2500
      primaryCounter++ // Increment primaryCounter in each step
    ) {
      // The inner loop iterates through a static array of predefined factors.
      for (
        const currentFactor of [
          // These are the specific multiplier values.
          2,
          4,
          3,
          9,
          8,
          10,
          6,
          12,
        ]
      ) {
        // Calculate a new value by multiplying the outer loop counter by twelve,
        // and then adding the current factor from the inner loop.
        // This calculated value is then appended to the output collection.
        outputCollection.push(primaryCounter * 12 + currentFactor);
      }
    }

    // After initial generation, the collection is trimmed.
    // Elements are removed starting from 'targetCount' index,
    // effectively truncating the array to the desired length.
    outputCollection.splice(
      targetCount,
      outputCollection.length - targetCount
    );

    // A final adjustment: if the target count is an odd number,
    // the very last element of the collection is set to a large sentinel value.
    if (targetCount % 2 === 1) {
      // The element at the (targetCount - 1) index (which is the last element)
      // is updated to 30000.
      outputCollection[targetCount - 1] = 30000;
    }
  }

  // Output the final collection elements, joined together by spaces,
  // to the standard output.
  console.log(outputCollection.join(" "));
}

// Invoke the main processing function.
// It reads the entire content of '/dev/stdin' as a UTF-8 string
// using Node.js's file system module.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));