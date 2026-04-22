'use strict' /* Enforce strict mode for better error handling */
// Import necessary modules
const inputs = require('fs') . readFileSync('/dev/stdin', 'utf8') . trim() . split('\n'); // Read input from stdin, trim whitespace, and split by newlines.

// Parse R (rows), C (columns), and N (number of points)
const RC = inputs [0] . split(' ') . map(Number); // First line contains R and C, split by space and convert to numbers.
const R = RC[0]; // R is the first element
const C = RC[1]; // C is the second element
const N = parseInt(inputs[1]); // N is on the second line, parse as integer.

// The remaining lines contain the r, c, a values for each point.
const rca = inputs . slice(2); // Slice from index 2 to get all point data.

// Initialize distance variables for odd/even rows/columns.
// -1 indicates that the distance has not yet been determined.
let dist_x_odd = -1, // Distance along X-axis for odd rows
dist_x_even = -1, // Distance along X-axis for even rows
dist_y_odd = -1, // Distance along Y-axis for odd columns
dist_y_even = -1; // Distance along Y-axis for even columns

// Initialize Maps to store observed points (r,c,a) for different parity groups.
// These maps help in finding a second point on the same line to calculate a distance.
let map_x_odd = new Map(), // Stores [c, a] for a given odd row r.
map_x_even = new Map(), // Stores [c, a] for a given even row r.
map_y_odd = new Map(), // Stores [r, a] for a given odd column c.
map_y_even = new Map(); // Stores [r, a] for a given even column c.

// Main loop: Process each of the N input points
for (let i = 0; i < N; i++) {
  // Parse current point's r, c, a values
  let rcai = rca[i].split(' '), // Split the line by space
  r1 = parseInt(rcai[0]), // Row of current point
  c1 = parseInt(rcai[1]), // Column of current point
  a1 = parseInt(rcai[2]); // Value at current point

  /*
  * Logic for Y-axis (vertical) distances.
  * This section checks if a consistent distance (slope) can be maintained
  * along columns, considering row parity.
  */
  if (R === 2) {
    // Special case: Only 2 rows
    if (map_y_even.has(c1)) { // If we've already seen a point in this column
      let ra2 = map_y_even.get(c1), // Get the previously stored [r, a] for this column
      r2 = ra2[0], // Previous row
      a2 = ra2[1]; // Previous value

      let d = (a2 - a1) / (r2 - r1); // Calculate distance (slope)

      if (dist_y_even === -1) { // If this is the first distance calculated for y_even
        dist_y_even = d; // Set it as the reference distance

        // After determining the first distance, validate all previously stored points
        // for this group against this new distance.
        for (let cra3 of map_y_even.entries()) {
          let c3 = cra3[0], // Column of previous point
          r3 = cra3[1][0], // Row of previous point
          a3 = cra3[1][1]; // Value of previous point

          // Check if the value falls outside the valid range [0, 0] based on the distance.
          // This implies values must be exactly 0.
          if (a3 - d * (r3 - 1) < 0 ||
          a3 + d * (R - r3) < 0) {
            console.log('No'); // If invalid, output 'No' and exit.
            process.exit();
          }
        }
      } else {
        // If dist_y_even was already set, compare with the newly calculated 'd'
        if (d !== dist_y_even) {
          console.log('No'); // If they don't match, output 'No' and exit.
          process.exit();
        }
      }
      // Finally, validate the current point itself against the established distance.
      if (a1 - d * (r1 - 1) < 0 ||
      a1 + d * (R - r1) < 0) {
        console.log('No');
        process.exit();
      }

    } else {
      // If no point seen in this column yet, store the current one.
      map_y_even.set(c1, [r1, a1]);
    }

  } else {
    // General case: R > 2 rows
    if (r1 % 2 === 0) {
      // Current row is EVEN
      if (map_y_even.has(c1)) { // If a previous even-row point exists in this column
        let ra2 = map_y_even.get(c1),
        r2 = ra2[0],
        a2 = ra2[1];

        // Calculate distance. Note the division by (r2 - r1) / 2 because we only care about even rows.
        let d = (a2 - a1) / ((r2 - r1) / 2);

        if (dist_y_even === -1) {
          // Check if distance 'd' is an integer, as expected for these calculations.
          if (Math.round(d) !== d) {
            console.log('No');
            process.exit();
          }
          dist_y_even = d;

          // Validate all previously stored odd-row points (this seems like a bug in the original logic,
          // it should be map_y_even here if it's validating 'even' distances).
          // Assuming it's intended to validate against `map_y_odd` if `R` is not 2 and `r1` is even.
          // This specific loop might be a copy-paste error from the original source.
          // For Type I clone, we reproduce it exactly.
          for (let cra3 of map_y_odd.entries()) { // Potentially problematic: iterating over map_y_odd for dist_y_even
            let c3 = cra3[0],
            r3 = cra3[1][0],
            a3 = cra3[1][1];

            // Check boundaries based on calculated distance.
            if (a3 - d * ((r3 / 2) - 1) < 0 ||
            a3 + d * Math.floor((R - r3) / 2) < 0) {
              console.log('No');
              process.exit();
            }
          }
        } else {
          // Compare with existing dist_y_even
          if (d !== dist_y_even) {
            console.log('No');
            process.exit();
          }
        }
        // Validate current point
        if (a1 - d * ((r1 / 2) - 1) < 0 ||
        a1 + d * Math.floor((R - r1) / 2) < 0) {
          console.log('No');
          process.exit();
        }

      } else {
        // Store the current even-row point in map_y_even
        map_y_even.set(c1, [r1, a1]);
      }

    } else {
      // Current row is ODD
      if (map_y_odd.has(c1)) { // If a previous odd-row point exists in this column
        let ra2 = map_y_odd.get(c1),
        r2 = ra2[0],
        a2 = ra2[1];

        // Calculate distance, again considering only odd rows.
        let d = (a2 - a1) / ((r2 - r1) / 2);

        if (dist_y_odd === -1) {
          // Check for integer distance
          if (Math.round(d) !== d) {
            console.log('No');
            process.exit();
          }

          dist_y_odd = d;

          // Validate all previously stored odd-row points against this new distance.
          for (let cra3 of map_y_odd.entries()) {
            let c3 = cra3[0],
            r3 = cra3[1][0],
            a3 = cra3[1][1];

            // Check boundaries
            if (a3 - d * Math.floor(r3 / 2) < 0 ||
            a3 + d * Math.floor((R - r3) / 2) < 0) {
              console.log('No');
              process.exit();
            }
          }
        } else {
          // Compare with existing dist_y_odd
          if (d !== dist_y_odd) {
            console.log('No');
            process.exit();
          }
        }
        // Validate current point
        if (a1 - d * Math.floor(r1 / 2) < 0 ||
        a1 + d * Math.floor((R - r1) / 2) < 0) {
          console.log('No');
          process.exit();
        }
      } else {
        // Store the current odd-row point in map_y_odd
        map_y_odd.set(c1, [r1, a1]);
      }
    }
  }

  /*
  * Logic for X-axis (horizontal) distances.
  * This section is symmetrical to the Y-axis logic, but for rows and column parity.
  */
  if (C === 2) {
    // Special case: Only 2 columns
    if (map_x_even.has(r1)) { // If we've already seen a point in this row
      let ca2 = map_x_even.get(r1),
      c2 = ca2[0],
      a2 = ca2[1];

      let d = (a2 - a1) / (c2 - c1); // Calculate distance

      if (dist_x_even === -1) {
        dist_x_even = d;

        // Validate all previously stored points for this group.
        for (let rca3 of map_x_even.entries()) {
          let r3 = rca3[0],
          c3 = rca3[1][0],
          a3 = rca3[1][1];

          // Check boundaries
          if (a3 - d * (c3 - 1) < 0 ||
          a3 + d * (C - c3) < 0) {
            console.log('No');
            process.exit();
          }
        }
      } else {
        if (d !== dist_x_even) {
          console.log('No');
          process.exit();
        }
      }
      // Validate current point
      if (a1 - d * c1 < 0 || // This condition 'a1 - d * c1' seems unusual; usually 'c1-1' or 'c1/2'
      a1 + d * (C - c1) < 0) {
        console.log('No');
        process.exit();
      }

    } else {
      // Store the current point
      map_x_even.set(r1, [c1, a1]);
    }
  } else {
    // General case: C > 2 columns
    if (c1 % 2 == 0) { // Current column is EVEN
      if (map_x_even.has(r1)) {
        let ca2 = map_x_even.get(r1),
        c2 = ca2[0],
        a2 = ca2[1];

        // Calculate distance. Division by (c2 - c1) / 2 for even columns.
        let d = (a2 - a1) / ((c2 - c1) / 2);

        if (dist_x_even === -1) {
          // Check for integer distance
          if (Math.round(d) !== d) {
            console.log('No');
            process.exit();
          }

          dist_x_even = d;

          // Validate all previously stored even-column points.
          for (let rca3 of map_x_even.entries()) {
            let r3 = rca3[0],
            c3 = rca3[1][0],
            a3 = rca3[1][1];

            // Check boundaries
            if (a3 - d * ((c3 / 2) - 1) < 0 ||
            a3 + d * Math.floor((C - c3) / 2) < 0) {
              console.log('No');
              process.exit();
            }
          }
        } else {
          // Compare with existing dist_x_even
          if (d !== dist_x_even) {
            console.log('No');
            process.exit();
          }
        }
        // Validate current point
        if (a1 - d * ((c1 / 2) - 1) < 0 ||
        a1 + d * Math.floor((C - c1) / 2) < 0) {
          console.log('No');
          process.exit();
        }
      } else {
        // Store the current even-column point
        map_x_even.set(r1, [c1, a1]);
      }

    } else {
      // Current column is ODD
      if (map_x_odd.has(r1)) {
        let ca2 = map_x_odd.get(r1),
        c2 = ca2[0],
        a2 = ca2[1];

        // Calculate distance. Division by (c2 - c1) / 2 for odd columns.
        let d = (a2 - a1) / ((c2 - c1) / 2);

        if (dist_x_odd === -1) {
          // Check for integer distance
          if (Math.round(d) !== d) {
            console.log('No');
            process.exit();
          }

          dist_x_odd = d;

          // Validate all previously stored odd-column points.
          for (let rca3 of map_x_odd.entries()) {
            let r3 = rca3[0],
            c3 = rca3[1][0],
            a3 = rca3[1][1];

            // Check boundaries
            if (a3 - d * Math.floor(c3 / 2) < 0 ||
            a3 + d * Math.floor((C - c3) / 2) < 0) {
              console.log('No');
              process.exit();
            }
          }
        } else {
          // Compare with existing dist_x_odd
          if (d !== dist_x_odd) {
            console.log('No');
            process.exit();
          }
        }
        // Validate current point
        if (a1 - d * Math.floor(c1 / 2) < 0 ||
        a1 + d * Math.floor((C - c1) / 2) < 0) {
          console.log('No');
          process.exit();
        }
      } else {
        // Store the current odd-column point
        map_x_odd.set(r1, [c1, a1]);
      }
    }
  }
}

// If the loop completes without exiting, all conditions were met.
console.log('Yes'); // Output 'Yes' indicating a consistent pattern.