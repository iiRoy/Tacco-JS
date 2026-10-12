function ProcessInput(rawData) {
  // Divide the incoming string into separate parts based on space characters.
  let tokenizedData = rawData.split(' ');

  // Extract the first numeric value, representing the count of 's' items.
  let sCount = Number(tokenizedData[0]);

  // Extract the second numeric value, representing the count of 'c' items.
  let cCount = Number(tokenizedData[1]);

  // Initialize a variable to keep track of the total number of successful combinations.
  let finalTally = 0;

  // First phase: Prioritize forming combinations that require both 's' and 'c' items.
  // Each such combination consumes one 's' and two 'c' items.
  while (sCount >= 1 && cCount >= 2) {
    sCount -= 1; // Decrement the available 's' items.
    cCount -= 2; // Decrement the available 'c' items.
    finalTally += 1; // Increment the count of completed combinations.
  }

  // Second phase: After exhausting 's' items or 'c' items for the first type of combination,
  // form combinations using only 'c' items. Each such combination requires four 'c' items.
  while (cCount >= 4) {
    cCount -= 4; // Decrement the available 'c' items by four.
    finalTally += 1; // Increment the count of completed combinations.
  }

  // Display the final calculated total number of combinations.
  console.log(finalTally);
}

// The following line is commented out in the original, so it remains commented here.
// ProcessInput("12345 678901");

// Read the input data from standard input using Node.js file system module
// and then pass it to our processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
