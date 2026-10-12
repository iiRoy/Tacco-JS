let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Acquire raw input data from standard input

const lineSegments = (rawData.trim()).split('\n'); // Process raw data by trimming whitespace and splitting into an array of lines

for (let outerIndex = 0; outerIndex < lineSegments.length; outerIndex++) { // Iterate through main data blocks, each starting with a target value
   const targetValue = lineSegments[outerIndex] - 0x0; // Parse the target value for the current block, converting string to number

   if (targetValue === 0) { // If the target value is zero, it signifies the end of input, so terminate processing
     break;
   }

   let currentBalance = 0.0; // Initialize cumulative balance for the current year's calculations
   let monthCounter; // Declare month counter outside the loop to retain its final value

   for (monthCounter = 1; monthCounter <= 0xC; monthCounter++) { // Loop through 12 months to calculate balance changes
      const monthlyData = lineSegments[outerIndex + monthCounter].split(' ').map(Number); // Get monthly financial data, split by space, and convert to numbers
      currentBalance += monthlyData[0] - monthlyData[1]; // Update balance with monthly income minus expense

      if (currentBalance >= targetValue) { // Check if the target balance has been reached or exceeded
        break; // If target met, exit the monthly loop
      }
   }
   // After the monthly loop, determine the output based on whether the target was met
   (currentBalance >= targetValue) ? console.log(monthCounter) : console.log('NA'); // Output the month number if target met, otherwise 'NA'

   outerIndex = outerIndex + 0xC; // Advance the outer index to skip the 12 lines of monthly data that were just processed
}
