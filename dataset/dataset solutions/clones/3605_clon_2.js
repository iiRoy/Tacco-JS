function printToConsole(messageContent) {
  console.log(messageContent); // Outputs the provided message to the console.
}

// This is the main function responsible for processing the input data.
function ProcessInput(rawData) {
  // First, remove any leading or trailing whitespace from the raw input string,
  // then convert it into an integer.
  let parsedValue = parseInt(rawData.trim());

  // The following lines are commented out as they represent alternative input parsing
  // strategies that are not used in this specific problem's logic.
  // let parsedValue = rawData.trim().split(" ");
  // let parsedValue = rawData.trim().split("\n");
  // let parsedValue = rawData.trim().split(" ").map((val) => Number(val));
  // let parsedValue = rawData.trim().split("\n").map((val) => Number(val));

  // Initialize a counter to keep track of numbers that satisfy the given conditions.
  let totalMatches = 0;

  // Begin an iteration from 1 up to and including the parsed input value.
  for (let outerLoopVar = 1; outerLoopVar <= parsedValue; outerLoopVar++) {
    // Check if the current number in the outer loop is odd.
    if (outerLoopVar % 2 === 1) {
      // If it's an odd number, initialize a counter for its divisors.
      let divisorCount = 0;

      // Start an inner loop to find all positive divisors for the current odd number.
      for (let innerLoopVar = 1; innerLoopVar <= outerLoopVar; innerLoopVar++) {
        // If 'innerLoopVar' divides 'outerLoopVar' without any remainder, it's a divisor.
        if (outerLoopVar % innerLoopVar === 0) {
          divisorCount++; // Increment the divisor counter.
        }
      }

      // After checking all possible divisors, if the odd number has exactly 8 divisors,
      // increment the total matches counter.
      if (divisorCount === 8) {
        totalMatches++;
      }
    }
  }

  // Finally, output the total count of numbers that met the criteria.
  printToConsole(totalMatches);
}

// Read the input from standard input (typically a file or piped data)
// using Node.js's file system module, and then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
