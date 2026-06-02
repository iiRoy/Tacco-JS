(function() {
    'use strict';

    // Array to store each line read from standard input.
    var inputLines = [];

    // Set up readline interface to process input line by line.
    require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    }).on('line', function(currentInputLine) {
      inputLines.push(currentInputLine); // Add the line to our collection.
    });

    // Event listener for when all input has been received.
    process.stdin.on('end', function() {
      // The main processing logic begins here.

      // Parse the number of stores from the first line of input.
      var numStores = parseInt(inputLines[0].split(" "));

      // Initialize arrays to hold store operating hours and profit data.
      var storeOperatingHours = []; // F in original
      var profitMatrix = [];        // P in original

      // Populate the store operating hours array.
      // Each store's operating hours are on a separate line, starting from line 1.
      for (var storeIndexPopulateF = 1; storeIndexPopulateF <= numStores; storeIndexPopulateF++) {
          storeOperatingHours[storeIndexPopulateF] = inputLines[storeIndexPopulateF].split(" ");
      }

      // Populate the profit matrix.
      // Profit data for each store follows the operating hours, starting from line N+1.
      for (var storeIndexPopulateP = 1; storeIndexPopulateP <= numStores; storeIndexPopulateP++) {
          profitMatrix[storeIndexPopulateP] = (inputLines[storeIndexPopulateP + numStores]).split(" ");
      }

      // Initialize the variable to track the maximum profit found.
      // Using a very small negative number to ensure any valid profit is greater.
      var maximumCalculatedProfit = -9999999999999;

      // Iterate through all possible operating plans for the 10 time slots.
      // There are 2^10 possible plans (0 to 1023).
      for (var planIterationValue = 1; planIterationValue < Math.pow(2, 10); planIterationValue++) {
          // Convert the current iteration number into a 10-bit binary string representing the plan.
          var currentOperatingPlan = convertIntegerToBinaryString(planIterationValue);
          var currentTotalProfit = 0; // Initialize profit for the current plan.

          // Calculate the total profit for this specific operating plan across all stores.
          for (var storeIterator = 1; storeIterator < numStores + 1; storeIterator++) {
            // For each store, determine how many operating hours match the current plan.
            // Use this count to index into the profit matrix for that store.
            var matchingHoursCount = calculateMatchingHours(currentOperatingPlan, storeOperatingHours[storeIterator]);
            currentTotalProfit += parseInt(profitMatrix[storeIterator][matchingHoursCount]);
          }

          // If the profit from the current plan is greater than the maximum found so far, update it.
          if (currentTotalProfit > maximumCalculatedProfit) {
              maximumCalculatedProfit = currentTotalProfit;
          }
      }

      // Output the final maximum profit to the console.
      console.log(maximumCalculatedProfit);

    }); // End of process.stdin.on('end')

})(); // End of IIFE

/**
 * Converts an integer to a 10-character binary string.
 * For example, 1 becomes "0000000001", 1023 becomes "1111111111".
 * @param {number} inputInteger - The integer to convert.
 * @returns {string} A 10-character binary string representation.
 */
function convertIntegerToBinaryString(inputInteger) {
    var binaryResultString = "";
    // Loop while the number is not zero.
    while (inputInteger) {
        // Prepend the least significant bit (inputInteger & 1) to the string.
        binaryResultString = (inputInteger & 1) + binaryResultString;
        // Right shift the number by 1 (equivalent to integer division by 2).
        inputInteger >>>= 1;
    }
    // Pad with leading zeros to ensure a length of 10 characters.
    return ('0000000000' + binaryResultString).slice(-10);
}

/**
 * Compares two 10-character binary strings (representing schedules)
 * and counts how many positions have '1' in both strings.
 * @param {string} planSchedule - The binary string representing the operating plan.
 * @param {string} storeSchedule - The binary string representing a store's operating hours.
 * @returns {number} The count of matching '1's.
 */
function calculateMatchingHours(planSchedule, storeSchedule) {
    var scheduleLength = 10; // The fixed length of the schedule strings.
    var matchCount = 0;      // Counter for matching '1's.

    // Iterate through each position (hour) in the schedules.
    for (var hourPosition = 0; hourPosition < scheduleLength; hourPosition++) {
        // If both the plan and the store schedule have a '1' at this position, increment the count.
        if (planSchedule[hourPosition] === storeSchedule[hourPosition] && planSchedule[hourPosition] === "1") {
            matchCount++;
        }
    }
    return matchCount;
}
