(function () {
  'use strict'; // Enforce stricter parsing and error handling for cleaner code.

  let inputRecords = []; // An array to store all incoming lines from standard input.

  // Configure the interface for reading input line by line.
  require('readline').createInterface(
    {
      input: process.stdin,  // Use standard input stream.
      output: process.stdout // Use standard output stream (though not directly used for prompting here).
    }
  )
    .on(
      'line',
      function (inputLine) { // Event listener for each line received.
        inputRecords.push(inputLine); // Add the current line to our collection.
      }
    );

  process.stdin.on('end', function () { // Triggered when the entire input stream has been read.
    // Previous debugging output for individual lines is now removed.
    // inputRecords.forEach(function(entry) {
    //   let numericalTokens = entry.split(' ').map(Number);
    //   console.log(numericalTokens[0] + ' ' + numericalTokens[1]);
    // });
    ; // A null statement to maintain original structure.

    // Core business logic begins here for calculating optimal profit.
    let objectCount = parseInt(inputRecords[0].split(" ")[0]); // Determine the total number of objects from the first line.
    let featurePatterns = []; // Initialize an array to store feature configurations for each object.
    let profitValues = []; // Initialize an array to store profit matrices for each object.

    // Populate the featurePatterns array.
    for (let loopCounter = 1; loopCounter <= objectCount; loopCounter++) {
      featurePatterns[loopCounter] = inputRecords[loopCounter].split(" ");
    }

    // Populate the profitValues array.
    for (let loopCounter = 1; loopCounter <= objectCount; loopCounter++) {
      profitValues[loopCounter] = (inputRecords[loopCounter + objectCount]).split(" ");
    }

    let maximumProfit = -Infinity; // Initialize the highest profit found so far to a very low number.

    // Iterate through all possible combinations of 10 binary choices (0 to 2^10 - 1).
    for (let comboIndex = 1; comboIndex < Math.pow(2, 10); comboIndex++) {
      let currentBitmask = createBitString(comboIndex); // Generate a 10-bit binary string representing the current plan.
      let currentProfit = 0; // Accumulator for profit in the current combination.

      // Calculate profit for the current combination across all objects.
      for (let objectIndex = 1; objectIndex < objectCount + 1; objectIndex++) {
        // Add the profit corresponding to the number of matching '1's between the plan and object features.
        currentProfit += parseInt(profitValues[objectIndex][countCommonOnes(currentBitmask, featurePatterns[objectIndex])]);
      }

      // Update the maximum profit if the current plan yields a better result.
      if (currentProfit > maximumProfit) {
        maximumProfit = currentProfit;
        // Debugging lines for logging plans and profits are now absent.
        // console.log("Current Configuration: " + currentBitmask);
        // console.log("Achieved Profit: " + maximumProfit);
      }
    }

    console.log(maximumProfit); // Output the final determined maximum profit.

    // Another commented-out debugging line, now removed.
    // console.log( Math.pow(parseInt(inputRecords[0]),2) - parseInt(inputRecords[1]) );
    // End of core logic.
  });


})(); // Immediately Invoked Function Expression concludes.

// Helper function to convert an integer into a 10-character binary string.
function createBitString(inputNumber) {
  let tempBitString = ""; // Stores the binary representation.
  while (inputNumber) {
    tempBitString = (inputNumber & 1) + tempBitString; // Prepend the least significant bit.
    inputNumber >>>= 1; // Unsigned right shift to process the next bit.
  }
  // Pad with leading zeros to ensure a 10-character string and take the last 10 characters.
  return ('0000000000' + tempBitString).slice(-10);
}

// Helper function to count the number of positions where both bitmasks have a '1'.
function countCommonOnes(maskOne, maskTwo) {
  const maskBitLength = 10; // The fixed length of the bitmasks.
  let matchedOnes = 0; // Counter for matching '1's.

  // Iterate through each bit position.
  for (let bitPosition = 0; bitPosition < maskBitLength; bitPosition++) {
    // If both masks have a '1' at the current position, increment the counter.
    if (maskOne[bitPosition] === maskTwo[bitPosition] && maskOne[bitPosition] === "1") {
      matchedOnes++;
    }
  }
  return matchedOnes; // Return the total count of common '1's.
}