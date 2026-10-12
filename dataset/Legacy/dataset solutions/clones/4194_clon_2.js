'use strict';

/**
 * Processes the raw input data to determine the maximum achievable profit
 * by selecting an optimal combination of operating days across all stores.
 *
 * @param {string} rawInputData - The complete input string, typically read from stdin.
 *                                It contains the number of shops, their operating schedules,
 *                                and corresponding profit matrices.
 */
function calculateMaxProfit(rawInputData) {
  // Divide the entire input string into an array of separate lines.
  const inputLinesArray = rawInputData.split('\n');

  // Extract the total count of shops from the very first line of input.
  const numberOfShops = parseInt(inputLinesArray.shift(), 10);

  // Initialize an array to hold the operating schedules for each individual shop.
  // Each schedule is represented as an array of 0s and 1s, indicating open/closed days.
  const shopOperatingSchedules = [];
  for (let shopIndex = 0; shopIndex < numberOfShops; shopIndex++) {
    shopOperatingSchedules.push(
      inputLinesArray[shopIndex].split(' ').map(val => parseInt(val, 10))
    );
  }

  // Initialize an array to store the profit lookup tables for each shop.
  // `profitLookupTable[s][c]` gives the profit for shop `s` when `c` days overlap.
  const profitLookupTable = [];
  for (let shopIndex = 0; shopIndex < numberOfShops; shopIndex++) {
    profitLookupTable.push(
      inputLinesArray[shopIndex + numberOfShops].split(' ').map(val => parseInt(val, 10))
    );
  }

  // Initialize the variable that will store the highest profit found across all day combinations.
  // It's set to negative infinity to ensure any calculated profit will be greater.
  let overallMaxProfit = -Infinity;

  // Iterate through all possible combinations of operating days.
  // There are 10 possible days, so 2^10 = 1024 combinations (from 0 to 1023).
  // We start from 1 to exclude the case where no days are open (which would yield 0 profit).
  for (let dayCombinationMask = 1; dayCombinationMask < 1024; dayCombinationMask++) {
    let currentCombinationProfit = 0; // Accumulator for profit for the current day combination.

    // For the current global day combination, calculate the total profit by summing profits from all shops.
    for (let shopIndex = 0; shopIndex < numberOfShops; shopIndex++) {
      const currentShopSchedule = shopOperatingSchedules[shopIndex];

      // 1. Convert the shop's schedule array (e.g., [0,1,0,1]) into a binary string ("0101").
      // 2. Parse this binary string into an integer, representing the shop's active days.
      // 3. Perform a bitwise AND operation with the `dayCombinationMask`. This yields a new bitmask
      //    where bits are set only for days when *both* the shop is open AND the current global
      //    day combination is active.
      // 4. Convert this resulting bitmask back into a binary string.
      // 5. Split the binary string into an array of characters (e.g., ['1', '0', '1']).
      // 6. Map these character digits to actual numbers (e.g., [1, 0, 1]).
      // 7. Sum these numbers to get the total count of common operating days.
      const commonOperatingDaysCount = (
        parseInt(currentShopSchedule.join(''), 2) & dayCombinationMask
      ).toString(2).split('').map(digitChar => Number(digitChar)).reduce((accumulator, currentValue) => accumulator + currentValue, 0);

      // Add the profit for the current shop, retrieved from its profit lookup table
      // using the calculated number of common operating days.
      currentCombinationProfit += profitLookupTable[shopIndex][commonOperatingDaysCount];
    }

    // After calculating the total profit for the current day combination,
    // update the overall maximum profit if this combination yielded a higher value.
    if (currentCombinationProfit > overallMaxProfit) {
      overallMaxProfit = currentCombinationProfit;
    }
  }

  // Output the final maximum profit found to the console.
  console.log(overallMaxProfit);
}

// Read the entire content of standard input as a UTF-8 string
// and then pass it to the main profit calculation function.
calculateMaxProfit(require('fs').readFileSync('/dev/stdin', 'utf8'));
