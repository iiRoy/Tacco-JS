/*
 * This module is designed to compute a time-related difference
 * based on several numerical inputs provided as a string.
 */
function calculateTimeDelta( rawInputBuffer ) {
  // Extract numerical components from the input string.
  // The input is expected to be a single line with space-separated numbers.
  const numericValues = rawInputBuffer[  0  ] .split(   ' '   ) .map(   stringComponent => parseInt(stringComponent,    10   )   );

  // Calculate the difference in hours, converted to minutes.
  // This step takes the first and third numeric values to determine an hour-based offset.
  const totalHoursInMinutes = ( numericValues[0] - numericValues[2] ) * 60;

  // Calculate the difference in minutes.
  // This uses the fourth and second numeric values for a direct minute adjustment.
  const remainingMinutesOffset = numericValues[3] - numericValues[1];

  // Combine the hour difference, minute difference, and subtract the last component.
  // The final numeric value is subtracted from the combined time difference.
  const finalTimeResult = totalHoursInMinutes + remainingMinutesOffset - numericValues[4];

  // Display the final computed result to the console.
  console.log(   finalTimeResult   )   ;
}

// Read data from standard input and pass it to the main processing function.
// The 'fs' module is used to synchronously read the entire content of '/dev/stdin' as UTF-8.
calculateTimeDelta( require('fs') .readFileSync( '/dev/stdin', 'utf8' ) );