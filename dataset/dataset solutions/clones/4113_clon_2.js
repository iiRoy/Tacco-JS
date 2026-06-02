'use strict'; // Enforce strict mode for cleaner code execution

/**
 * Calculates the total hours remaining until the next day, given a starting hour.
 * This function assumes a 24-hour cycle.
 * @param {string} inputString - The input string representing the current hour.
 */
function calculateTime(inputString) {
  // Convert the input string to a numerical value, representing the current hour.
  const currentHour = Number(inputString);

  // Calculate the hours remaining in the current day (24 - currentHour),
  // then add another 24 hours to represent the full next day.
  // This effectively calculates the time until the same hour on the day after tomorrow.
  const totalHoursRemaining = (24 - currentHour) + 24;

  // Output the calculated total hours to the console.
  console.log(totalHoursRemaining);
}

// Read the input from standard input, decode it as UTF-8, and pass it to the main calculation function.
calculateTime(require("fs").readFileSync("/dev/stdin", "utf8"));
