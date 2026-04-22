// This script processes input data to count a specific matching condition.
// The main logic is encapsulated within an immediately invoked function expression (IIFE).

console
  .log(
    (
      args =>
      {
        // Destructure the input arguments.
        // First, trim any leading/trailing whitespace from the input string.
        // Then, split the string by newline characters to get an array of rows.
        // Each row is then split by spaces, and each value is converted to an integer.
        const [
          [N],
          ...tmp
        ] = args
          .trim()
          .split('\n') // Split input into lines.
          .map(
            r =>
              r.split(' ') // Split each line into space-separated values.
                .map(
                  v =>
                    v | 0 // Convert each value to an integer using bitwise OR with 0.
                )
          );

        // Separate the temporary array into two distinct arrays: 'rp' and 'bp'.
        // 'rp' contains the first N elements.
        const rp = tmp.slice(0, N);
        // 'bp' contains the next N elements (from index N up to 2*N).
        const bp = tmp.slice(N, 2 * N);

        // Sort the 'bp' array based on the first element of each sub-array in ascending order.
        bp
          .sort(
            (a, b) =>
              a[0] - b[0] // Comparison function for sorting.
          );


        // Initialize a counter for the number of successful matches.
        let
          count = 0;


        // Iterate through the 'bp' array. The loop condition N - count ensures
        // we only iterate over relevant elements, as elements are removed from 'bp'.
        for (
          let
            i = 0;
          i < N - count;
          i++
        )
        {

          // Initialize variables to track the maximum 'y' value and its index in 'rp'.
          let
            maxy = -1,
            maxi = -1;

          // Inner loop: Iterate through the 'rp' array.
          // Similar to the outer loop, N - count ensures we iterate over relevant elements.
          for (
            let
              j = 0;
            j < N - count;
            j++
          )
          {

            // Check the matching condition:
            // If the current 'bp' element's x-coordinate is less than 'rp's x-coordinate
            // AND 'bp' element's y-coordinate is less than 'rp's y-coordinate,
            // then this 'rp' element does not satisfy the condition for the current 'bp' element.
            if (
              bp[i][0] < rp[j][0] &&
              bp[i][1] < rp[j][1]
            )
              continue; // Skip to the next 'rp' element.

            // If the current 'rp' element's y-coordinate is greater than the current maximum 'y',
            // update 'maxy' and 'maxi'.
            if (
              maxy < rp[j][1]
            )
            {
              maxy = rp[j][1]; // Update maximum y-coordinate.
              maxi = j;       // Store the index of the 'rp' element that gave this max y.
            }
          }

          // After checking all 'rp' elements for the current 'bp' element:
          // If a suitable 'rp' element was found (i.e., maxi is not -1),
          // then we have a match.
          if (
            maxi >= 0
          )
          {
            // Remove the matched 'bp' element from its array.
            bp
              .splice(
                i--, // Decrement 'i' because an element was removed, and we need to re-check the current index.
                1    // Remove 1 element.
              );

            // Remove the matched 'rp' element from its array.
            rp
              .splice(
                maxi, // Index of the element to remove.
                1     // Remove 1 element.
              );

            // Increment the total match count.
            count++;
          }
        }

        // Return the final count as a string.
        return `${count}`;
      }
    )
      // Read input from standard input using Node.js 'fs' module.
      (
        require('fs')
          .readFileSync('/dev/stdin', 'utf8')
      )
  );