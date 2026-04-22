/*
 * This JavaScript module calculates the straight-line distance between the tips of two clock hands.
 * It takes as input the lengths of the two hands and the current time in hours and minutes.
 * The calculation relies on the Law of Cosines, using the angle between the two hands.
 */

"use strict"; // Enable strict mode for the entire script, enforcing cleaner code practices.


/**
 * The main function responsible for processing input, performing calculations,
 * and outputting the final result.
 * @param {string} input - The raw input string, typically from standard input.
 */
const main = ( input ) => {

  // Split the input string by newline characters to get an array of lines.
  // For this problem, we typically only expect one line of relevant input.
  const spi = input.split( '\n' ); // 'spi' could stand for 'split input'.


  // Parse the first line of the input.
  // It contains four space-separated values:
  // a (length of the first hand), b (length of the second hand),
  // h (hour), m (minute).
  const [ a, b, h, m ] = spi[0]
                         .split( ' ' )           // Split the first line by spaces.
                         .map( e => parseInt( e ) ); // Convert each resulting string part to an integer.


  // Calculate the angle of the hour hand (short hand) from the 12 o'clock position, in degrees.
  // The hour hand moves 30 degrees per hour (360/12).
  // It also moves 0.5 degrees per minute (30/60).
  const sho = h * 30 + m * 0.5; // 'sho' likely refers to the "short hand angle".


  // Calculate the angle of the minute hand (long hand) from the 12 o'clock position, in degrees.
  // The minute hand moves 6 degrees per minute (360/60).
  const lon = 6 * m; // 'lon' likely refers to the "long hand angle".


  // Calculate the raw difference in angles between the two hands.
  // This value can be positive or negative, and might be greater than 180 or 360.
  // The Law of Cosines works correctly with this raw difference, as cos(theta) = cos(-theta)
  // and cos(theta) = cos(theta + 360*n).
  const kakudo = sho - lon; // 'kakudo' is Japanese for "angle".


  // Apply the Law of Cosines to find the square of the distance between the tips of the hands.
  // Formula: d^2 = a^2 + b^2 - 2ab * cos(theta)
  // Note: Math.cos expects radians, so we convert degrees to radians: (degrees * Math.PI / 180).
  const ans = a * a + b * b - 2 * a * b * Math.cos( Math.PI / 180 * kakudo ); // 'ans' holds the squared distance.


  // Output the square root of the calculated value, which is the final distance.
  console.log( Math.sqrt( ans ) );

}; // End of the main function.


// This line reads the input from standard input (e.g., from a pipe or redirected file)
// and passes it to the main function for processing.
// 'require("fs")' is used to access the Node.js file system module.
// 'readFileSync' reads the entire file synchronously.
// '/dev/stdin' is the conventional path for standard input on Unix-like systems.
// 'utf8' specifies the encoding for the input.
main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );