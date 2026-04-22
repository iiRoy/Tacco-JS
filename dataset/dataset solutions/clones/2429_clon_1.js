'use strict'; // This directive enforces strict mode, helping to write cleaner and safer JavaScript code.


// Define the main function that will process the input data.
const main = input => {


  // Parse the first element of the input array to determine the number of points (n).
  const n = parseInt(input[0]);


  // Declare and initialize two arrays, 'x' and 'y', to store the coordinates of 'n' points.
  // These arrays will hold the x-coordinates and y-coordinates, respectively.
  let x = new Array(n),
      y = new Array(n); // Using a comma to declare multiple variables on one line.


  // Loop through the input data to populate the 'x' and 'y' coordinate arrays.
  // The loop starts from i=0 and goes up to n-1, processing n points.
  for (let i = 0; i < n; i++) {

    // Each subsequent line in the input (input[i+1]) contains two space-separated integers.
    // These represent the x and y coordinates for the current point.
    let k = input[i + 1]       // Get the current line of input.
                .split(' ')    // Split the string by space to get an array of string numbers.
                .map( val => parseInt(val) ); // Convert each string number to an integer.

    // Assign the first parsed integer to the x-coordinate array.
    x[i] = k[0];

    // Assign the second parsed integer to the y-coordinate array.
    y[i] = k[1];
  }


  /*
   * The following line is a commented-out debug statement from the original code.
   * It would typically log the number of points and the coordinate arrays.
   * console.log(n, x, y);
   */


  // Initialize 'distanceSum' to zero. This variable will accumulate the total distance
  // between all unique pairs of points.
  let distanceSum = 0;


  // Calculate the sum of Euclidean distances between all distinct pairs of points.
  // This involves a nested loop structure to iterate through all combinations.
  for (let i = 0; i < n - 1; i++) { // The outer loop iterates from the first point to the second-to-last.

    for (let j = i; j < n; j++) { // The inner loop iterates from the current outer loop index 'i' to the last point.

      // Calculate the Euclidean distance between point (x[i], y[i]) and point (x[j], y[j]).
      // The formula is: sqrt((x1 - x2)^2 + (y1 - y2)^2).
      distanceSum += Math.sqrt(
        (x[i] - x[j]) * (x[i] - x[j]) + // Square of the difference in x-coordinates.
        (y[i] - y[j]) * (y[i] - y[j])   // Square of the difference in y-coordinates.
      );

    } // End of inner loop (j).
  } // End of outer loop (i).


  /*
   * Another commented-out debug log from the original source.
   * console.log(distanceSum); // This would show the raw sum of distances.
   */


  // Output the final calculated value to the console.
  // The expression `distanceSum / n * 2` suggests a specific problem context,
  // potentially related to average distance or a weighted sum.
  console.log( distanceSum / n * 2 );

}; // End of the main function definition.


// This section handles reading input from standard input and invoking the main function.
main(
  require("fs")                          // Access the Node.js 'fs' (file system) module.
    .readFileSync("/dev/stdin", "utf8")  // Read the entire content of standard input as UTF-8.
    .split('\n')                         // Split the read content into an array of strings, using newline as a delimiter.
); // Call the main function with the processed input array.