'use strict'; // Enforce strict mode for cleaner code.


// This section handles reading input data from standard input.
// It assumes the input is provided via a file or pipe.
const inputs = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');


// Parse the first line of input to get R and C dimensions.
const RC = inputs[0].split(' ').map(Number);

// R represents the number of rows.
const R = RC[0];

// C represents the number of columns.
const C = RC[1];

// N is the number of data points, parsed from the second line.
const N = parseInt(inputs[1]);

// rca holds the remaining input lines, which contain row, column, and value (a) data.
const rca = inputs.slice(2);


/*
 * Declare variables to store calculated distances.
 * - dist_x_odd: Stores the common difference for odd-indexed columns in x-direction.
 * - dist_x_even: Stores the common difference for even-indexed columns in x-direction.
 * - dist_y_odd: Stores the common difference for odd-indexed rows in y-direction.
 * - dist_y_even: Stores the common difference for even-indexed rows in y-direction.
 * Initialized to -1 to indicate that no common difference has been established yet.
 */
let dist_x_odd = -1,
	dist_x_even = -1,
	dist_y_odd = -1,
	dist_y_even = -1;


/*
 * Declare Map objects to store observed points and their values.
 * These maps help in checking consistency and calculating differences.
 * - map_x_odd: Stores data for odd-indexed columns (keyed by row).
 * - map_x_even: Stores data for even-indexed columns (keyed by row).
 * - map_y_odd: Stores data for odd-indexed rows (keyed by column).
 * - map_y_even: Stores data for even-indexed rows (keyed by column).
 */
let map_x_odd = new Map(),
	map_x_even = new Map(),
	map_y_odd = new Map(),
	map_y_even = new Map();


// Begin processing each data point provided in the input.
// The loop iterates N times, once for each (r, c, a) triplet.
for (let i = 0; i < N; i++) {

	// Parse the current line of input for row (r1), column (c1), and value (a1).
	let rcai = rca[i].split(' '),
		r1 = parseInt(rcai[0]),
		c1 = parseInt(rcai[1]),
		a1 = parseInt(rcai[2]);

	// --- Logic pertaining to rows (y-direction) ---

	// Special handling if there are only 2 rows.
	if ( R === 2 ) {

		// If a value for this column (c1) has already been recorded for even rows.
		if ( map_y_even.has(c1) ) {

			// Retrieve the previously recorded row and value for this column.
			let ra2 = map_y_even.get(c1),
				r2 = ra2[0],
				a2 = ra2[1];

			// Calculate the difference (d) between the two values.
			let d = a2 - a1;

			// If this is the first time a difference is calculated for even rows.
			if ( dist_y_even === -1 ) {
				dist_y_even = d; // Set the common difference.

			} else {
				// If a common difference already exists, check for consistency.
				if ( d !== dist_y_even ) {
					console.log('No'); // Inconsistent, output 'No' and exit.
					process.exit();
				}
			}

			// Check if values would become negative at boundaries.
			// This ensures the pattern holds for the entire grid.
			if ( a1 - d * r1 < 0 ||
				a1 + d * (R - r1) < 0 ) {
				console.log('No'); // Invalid pattern, output 'No' and exit.
				process.exit();
			}

		} else {
			// If no value for this column (c1) has been recorded yet, store the current one.
			map_y_even.set(c1, [r1, a1]);
		}

	} else { // General case for R > 2 rows.

		// Check if the current row (r1) is even.
		if ( r1 % 2 === 0 ) {

			// If a value for this column (c1) has already been recorded for even rows.
			if ( map_y_even.has(c1) ) {

				// Retrieve the previously recorded row and value.
				let ra2 = map_y_even.get(c1),
					r2 = ra2[0],
					a2 = ra2[1];

				// Calculate the difference (d) based on row indices.
				let d = (a2 - a1) / ((r2 - r1) / 2);

				// If this is the first time a difference is calculated for even rows.
				if ( dist_y_even === -1 ) {

					// Ensure the difference is an integer.
					if ( Math.round(d) !== d ) {
						console.log('No');
						process.exit();
					}
					dist_y_even = d; // Set the common difference.

					// After setting dist_y_even, check all previously recorded odd row points
					// to ensure they are consistent with this newly found difference.
					for ( let cra3 of map_y_odd.entries() ) {
						let c3 = cra3[0],
							r3 = cra3[1][0],
							a3 = cra3[1][1];

						// Check boundary conditions for odd rows with the even row difference.
						if ( a3 - d * ((r3 / 2) - 1) < 0 ||
							a3 + d * Math.floor((R - r3) / 2) < 0 ) {
							console.log('No');
							process.exit();
						}
					}
				} else {
					// If a common difference already exists, check for consistency.
					if ( d !== dist_y_even ) {
						console.log('No');
						process.exit();
					}
				}

				// Check boundary conditions for the current point.
				if ( a1 - d * ((r1 / 2) - 1) < 0 ||
					a1 + d * Math.floor((R - r1) / 2) < 0 ) {
					console.log('No');
					process.exit();
				}

			} else {
				// Store the current point if not already present.
				map_y_even.set(c1, [r1, a1]);
			}

		} else { // If the current row (r1) is odd.

			// If a value for this column (c1) has already been recorded for odd rows.
			if ( map_y_odd.has(c1) ) {

				// Retrieve the previously recorded row and value.
				let ra2 = map_y_odd.get(c1),
					r2 = ra2[0],
					a2 = ra2[1];

				// Calculate the difference (d) based on row indices.
				let d = (a2 - a1) / ((r2 - r1) / 2);

				// If this is the first time a difference is calculated for odd rows.
				if ( dist_y_odd === -1 ) {

					// Ensure the difference is an integer.
					if ( Math.round(d) !== d ) {
						console.log('No');
						process.exit();
					}

					dist_y_odd = d; // Set the common difference.

					// After setting dist_y_odd, check all previously recorded odd row points
					// to ensure they are consistent.
					for ( let cra3 of map_y_odd.entries() ) {
						let c3 = cra3[0],
							r3 = cra3[1][0],
							a3 = cra3[1][1];

						// Check boundary conditions.
						if ( a3 - d * Math.floor(r3 / 2) < 0 ||
							a3 + d * Math.floor((R - r3) / 2) < 0 ) {
							console.log('No');
							process.exit();
						}
					}
				} else {
					// If a common difference already exists, check for consistency.
					if ( d !== dist_y_odd ) {
						console.log('No');
						process.exit();
					}
				}

				// Check boundary conditions for the current point.
				if ( a1 - d * Math.floor(r1 / 2) < 0 ||
					a1 + d * Math.floor((R - r1) / 2) < 0 ) {
					console.log('No');
					process.exit();
				}
			} else {
				// Store the current point if not already present.
				map_y_odd.set(c1, [r1, a1]);
			}
		}
	}

	// --- Logic pertaining to columns (x-direction) ---

	// Special handling if there are only 2 columns.
	if ( C === 2 ) {

		// If a value for this row (r1) has already been recorded for even columns.
		if ( map_x_even.has(r1) ) {

			// Retrieve the previously recorded column and value.
			let ca2 = map_x_even.get(r1),
				c2 = ca2[0],
				a2 = ca2[1];

			// Calculate the difference (d) between the two values.
			let d = a2 - a1;

			// If this is the first time a difference is calculated for even columns.
			if ( dist_x_even === -1 ) {
				dist_x_even = d; // Set the common difference.

			} else {
				// If a common difference already exists, check for consistency.
				if ( d !== dist_x_even ) {
					console.log('No');
					process.exit();
				}
			}

			// Check if values would become negative at boundaries.
			if ( a1 - d * c1 < 0 ||
				a1 + d * (C - c1) < 0 ) {
				console.log('No');
				process.exit();
			}

		} else {
			// If no value for this row (r1) has been recorded yet, store the current one.
			map_x_even.set(r1, [c1, a1]);
		}
	} else { // General case for C > 2 columns.

		// Check if the current column (c1) is even.
		if ( c1 % 2 == 0 ) {

			// If a value for this row (r1) has already been recorded for even columns.
			if ( map_x_even.has(r1) ) {
				let ca2 = map_x_even.get(r1),
					c2 = ca2[0],
					a2 = ca2[1];

				// Calculate the difference (d) based on column indices.
				let d = (a2 - a1) / ((c2 - c1) / 2);

				// If this is the first time a difference is calculated for even columns.
				if ( dist_x_even === -1 ) {

					// Ensure the difference is an integer.
					if ( Math.round(d) !== d ) {
						console.log('No');
						process.exit();
					}

					dist_x_even = d; // Set the common difference.

					// Check all previously recorded even column points for consistency.
					for ( let rca3 of map_x_even.entries() ) {
						let r3 = rca3[0],
							c3 = rca3[1][0],
							a3 = rca3[1][1];

						// Check boundary conditions.
						if ( a3 - d * ((c3 / 2) - 1) < 0 ||
							a3 + d * Math.floor((C - c3) / 2) < 0 ) {
							console.log('No');
							process.exit();
						}
					}
				} else {
					// If a common difference already exists, check for consistency.
					if ( d !== dist_x_even ) {
						console.log('No');
						process.exit();
					}
				}

				// Check boundary conditions for the current point.
				if ( a1 - d * ((c1 / 2) - 1) < 0 ||
					a1 + d * Math.floor((C - c1) / 2) < 0 ) {
					console.log('No');
					process.exit();
				}
			} else {
				// Store the current point if not already present.
				map_x_even.set(r1, [c1, a1]);
			}

		} else { // If the current column (c1) is odd.

			// If a value for this row (r1) has already been recorded for odd columns.
			if ( map_x_odd.has(r1) ) {
				let ca2 = map_x_odd.get(r1),
					c2 = ca2[0],
					a2 = ca2[1];

				// Calculate the difference (d) based on column indices.
				let d = (a2 - a1) / ((c2 - c1) / 2);

				// If this is the first time a difference is calculated for odd columns.
				if ( dist_x_odd === -1 ) {

					// Ensure the difference is an integer.
					if ( Math.round(d) !== d ) {
						console.log('No');
						process.exit();
					}

					dist_x_odd = d; // Set the common difference.

					// Check all previously recorded odd column points for consistency.
					for ( let rca3 of map_x_odd.entries() ) {
						let r3 = rca3[0],
							c3 = rca3[1][0],
							a3 = rca3[1][1];

						// Check boundary conditions.
						if ( a3 - d * Math.floor(c3 / 2) < 0 ||
							a3 + d * Math.floor((C - c3) / 2) < 0 ) {
							console.log('No');
							process.exit();
						}
					}
				} else {
					// If a common difference already exists, check for consistency.
					if ( d !== dist_x_odd ) {
						console.log('No');
						process.exit();
					}
				}

				// Check boundary conditions for the current point.
				if ( a1 - d * Math.floor(c1 / 2) < 0 ||
					a1 + d * Math.floor((C - c1) / 2) < 0 ) {
					console.log('No');
					process.exit();
				}
			} else {
				// Store the current point if not already present.
				map_x_odd.set(r1, [c1, a1]);
			}
		}
	}
}

// If the program reaches this point, all checks passed successfully.
// Output 'Yes' indicating a valid grid pattern.
console.log('Yes');