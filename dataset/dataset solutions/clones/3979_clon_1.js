console.log(
  (
    args => { /* This is an Immediately Invoked Function Expression (IIFE) */

      // The following destructuring parses the input string into N and the temporary array 'tmp'.
      const [
        [N], // N represents the total number of red and blue points.
        ...tmp // 'tmp' holds all coordinate pairs from the input.
      ] = args
        .trim() // First, remove any leading or trailing whitespace from the input.
        .split('\n') // Then, split the input string into an array of lines.
        .map(
          r => r.split(' ') // For each line, split it into an array of strings by space.
            .map(
              v => v | 0 // Convert each string value to an integer using bitwise OR 0.
            ) // This ensures coordinate values are numbers.
        );

      // Initialize two empty arrays to store red points (rp) and blue points (bp).
      const rp = [],
        bp = [];

      // Populate 'rp' and 'bp' arrays based on the value of N.
      // The first N entries in 'tmp' are red points, the next N are blue points.
      for (
        let i = 0; // Loop counter initialization.
        i < N; // Loop N times to process all points.
        i++ // Increment loop counter after each iteration.
      ) {
        rp.push(tmp[i]); // Add the i-th entry from 'tmp' to 'rp' (red points).
        bp.push(tmp[N + i]); // Add the (N+i)-th entry from 'tmp' to 'bp' (blue points).
      }

      // Sort the red points (rp) array.
      // The sorting is done in descending order based on the x-coordinate (the first element of each pair).
      rp.sort(
        ([a], [b]) => b - a // Comparison function for descending sort by x-coordinate.
      );

      // Sort the blue points (bp) array.
      // Similar to red points, sort in descending order based on the x-coordinate.
      bp.sort(
        ([a], [b]) => b - a // Comparison function for descending sort by x-coordinate.
      );

      // Initialize a counter for the number of successfully matched red and blue pairs.
      let count = 0;

      // Iterate through each blue point to find a suitable red point match.
      for (
        let i = 0; // Loop counter for iterating through blue points.
        i < N; // The loop runs N times, once for each blue point.
        i++ // Increment the counter.
      ) {
        // Destructure the current blue point's coordinates.
        const [
          bx, // x-coordinate of the current blue point.
          by // y-coordinate of the current blue point.
        ] = bp[i];

        // Initialize 'max' to keep track of the best matching red point found for the current blue point.
        // 'max' stores [index_of_red_point_in_rp, y_coordinate_of_red_point].
        // Initial value [-1, -1] indicates no suitable red point has been found yet.
        let max = [-1, -1];

        // Iterate through all currently available red points to find a match.
        for (
          let j = 0; // Loop counter for iterating through red points.
          j < rp.length; // The loop continues as long as there are red points to check.
          j++ // Increment the counter.
        ) {
          // Destructure the current red point's coordinates.
          const [
            rx, // x-coordinate of the current red point.
            ry // y-coordinate of the current red point.
          ] = rp[j];

          // Condition 1: The blue point's x-coordinate must be greater than the red point's x-coordinate.
          // If this condition is not met, this red point cannot be matched with the current blue point.
          if (bx < rx) {
            continue; // Skip to the next red point.
          }

          // Condition 2: The blue point's y-coordinate must be greater than the red point's y-coordinate.
          // Additionally, we want to find the red point with the largest y-coordinate that satisfies the conditions.
          if (by > ry && ry > max[1]) {
            // If both conditions are met, and this red point's y-coordinate is better than 'max[1]',
            // update 'max' with the current red point's details.
            max = [j, ry];
          }
        }

        // After checking all red points, if a suitable match was found (i.e., max[1] is not -1).
        if (max[1] >= 0) {
          // Remove the matched red point from the 'rp' array using its index.
          // This prevents it from being matched again.
          rp.splice(max[0], 1);
          // Increment the total count of matched pairs.
          count++;
        }
      }

      // Return the final count of matched pairs as a string.
      return `${count}`;
    } // End of the anonymous arrow function definition.
  ) // End of the IIFE's function part.
  (
    require('fs') // Access the Node.js 'fs' (file system) module.
    .readFileSync( // Use the 'readFileSync' method to read a file synchronously.
      '/dev/stdin', // Specify the path to read from standard input.
      'utf8' // Specify the encoding for reading the file content.
    ) // The content read from stdin is passed as the 'args' parameter to the IIFE.
  ) // End of the IIFE call.
); // Log the final result to the console.