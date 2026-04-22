/*
 * This JavaScript code processes input data
 * to determine if a specific condition is met.
 * It reads from standard input, parses numbers,
 * and performs calculations based on row and column values.
 */
'use strict'; /* Enforce strict mode for cleaner code and fewer errors. */

// Read input from /dev/stdin, decode as UTF-8, trim whitespace, and split by newline.
const inputs = require('fs')
	.readFileSync('/dev/stdin', 'utf8')
	.trim()
	.split('\n');

// Parse the first line to get R (rows) and C (columns).
const RC = inputs[0].split(' ').map(Number);
const R = RC[0]; // Number of rows.
const C = RC[1]; // Number of columns.

// Parse the second line to get N (number of data points).
const N = parseInt(inputs[1]);

// Get the remaining lines which contain the data points.
const rca = inputs.slice(2);

// Initialize flags to track if common differences have been established for x and y axes.
let dist_x_odd = false, // Difference for odd-indexed columns/rows along x-axis.
	dist_x_even = false, // Difference for even-indexed columns/rows along x-axis.
	dist_y_odd = false, // Difference for odd-indexed columns/rows along y-axis.
	dist_y_even = false; // Difference for even-indexed columns/rows along y-axis.

// Initialize Maps to store encountered (coordinate, value) pairs for different parities.
let map_x_odd = new Map(), // Stores {row -> [col, value]} for odd-indexed columns
	map_x_even = new Map(), // Stores {row -> [col, value]} for even-indexed columns
	map_y_odd = new Map(), // Stores {col -> [row, value]} for odd-indexed rows
	map_y_even = new Map(); // Stores {col -> [row, value]} for even-indexed rows

/*
 * Iterate through each data point provided in the input.
 * The loop runs N times, once for each (r, c, a) triplet.
 */
for (let i = 0; i < N; i++) {
	// Split the current line, parse r1, c1, and a1 as integers.
	let rcai = rca[i].split(' '),
		r1 = parseInt(rcai[0]), // Current row index.
		c1 = parseInt(rcai[1]), // Current column index.
		a1 = parseInt(rcai[2]); // Current value.

	/*
	 * Handle logic specific to the y-axis (rows)
	 * This block checks conditions based on the number of rows (R).
	 */
	if (R === 2) {
		// Special case: If there are exactly 2 rows.
		if (map_y_even.has(c1)) {
			// If we've seen this column 'c1' before in map_y_even.
			let ra2 = map_y_even.get(c1), // Retrieve the previously stored [row, value].
				r2 = ra2[0], // Previous row index.
				a2 = ra2[1]; // Previous value.

			// Calculate the difference 'd' based on the two points.
			let d = (a2 - a1) / (r2 - r1);

			// If this is the first time we're establishing dist_y_even.
			if (dist_y_even === false) {
				dist_y_even = d; // Set the common difference.

				// Check all existing entries in map_y_even against this new 'd'.
				for (let cra3 of map_y_even.entries()) {
					let c3 = cra3[0], // Column from existing entry.
						r3 = cra3[1][0], // Row from existing entry.
						a3 = cra3[1][1]; // Value from existing entry.


					// Check conditions for validity.
					if (a3 - d * (r3 - 1) < 0 ||
						a3 + d * (2 - r3) < 0) {
						console.log('No'); // Output 'No' and exit if invalid.
						process.exit();
					}
				}
			} else {
				// If dist_y_even was already set, ensure current 'd' matches.
				if (d !== dist_y_even) {
					console.log('No'); // Output 'No' and exit if mismatch.
					process.exit();
				}
			}

			// Check conditions for the current point (r1, c1, a1).
			if (a1 - d * (r1 - 1) < 0 ||
				a1 + d * (2 - r1) < 0) {

				console.log('No'); // Output 'No' and exit if invalid.
				process.exit();
			}

		} else {
			// If this column 'c1' is new to map_y_even.
			if (dist_y_even !== false) {
				// If a common difference is already established, check current point against it.
				if (a1 - dist_y_even * (r1 - 1) < 0 ||
					a1 + dist_y_even * (2 - r1) < 0) {
					console.log('No'); // Output 'No' and exit if invalid.
					process.exit();
				}
			}
			// Add the current point to map_y_even.
			map_y_even.set(c1, [r1, a1]);
		}

	} else {
		// General case: R is not 2.
		if (r1 % 2 === 0) {
			// If the current row 'r1' is even.
			if (map_y_even.has(c1)) {
				// If we've seen this column 'c1' before with an even row.
				let ra2 = map_y_even.get(c1),
					r2 = ra2[0],
					a2 = ra2[1];

				// Calculate difference 'd' for even rows.
				let d = (a2 - a1) / ((r2 - r1) / 2);

				if (dist_y_even === false) {
					dist_y_even = d; // Set the common difference for even rows.

					// Check all existing entries in map_y_even.
					for (let cra3 of map_y_even.entries()) {
						let c3 = cra3[0],
							r3 = cra3[1][0],
							a3 = cra3[1][1];

						if (a3 - d * ((r3 / 2) - 1) < 0 ||
							a3 + d * Math.floor((R - r3) / 2) < 0) {
							console.log('No');
							process.exit();
						}
					}
				} else {
					// Ensure current 'd' matches established dist_y_even.
					if (d !== dist_y_even) {
						console.log('No');
						process.exit();
					}
				}
				// Check conditions for the current point.
				if (a1 - d * ((r1 / 2) - 1) < 0 ||
					a1 + d * Math.floor((R - r1) / 2) < 0) {
					console.log('No');
					process.exit();
				}

			} else {
				// If this column 'c1' is new for even rows.
				if (dist_y_even !== false) {
					// If a common difference is already established, check current point.
					if (a1 - dist_y_even * ((r1 / 2) - 1) < 0 ||
						a1 + dist_y_even * Math.floor((R - r1) / 2) < 0) {
						console.log('No');
						process.exit();
					}
				}
				// Add the current point to map_y_even.
				map_y_even.set(c1, [r1, a1]);
			}
		} else {
			// If the current row 'r1' is odd.
			if (map_y_odd.has(c1)) {
				// If we've seen this column 'c1' before with an odd row.
				let ra2 = map_y_odd.get(c1),
					r2 = ra2[0],
					a2 = ra2[1];

				// Calculate difference 'd' for odd rows.
				let d = (a2 - a1) / ((r2 - r1) / 2);

				if (dist_y_odd === false) {
					dist_y_odd = d; // Set the common difference for odd rows.

					// Check all existing entries in map_y_odd.
					for (let cra3 of map_y_odd.entries()) {
						let c3 = cra3[0],
							r3 = cra3[1][0],
							a3 = cra3[1][1];

						if (a3 - d * Math.floor(r3 / 2) < 0 ||
							a3 + d * Math.floor((R - r3) / 2) < 0) {
							console.log('No');
							process.exit();
						}
					}
				} else {
					// Ensure current 'd' matches established dist_y_odd.
					if (d !== dist_y_odd) {
						console.log('No');
						process.exit();
					}
				}
				// Check conditions for the current point.
				if (a1 - d * Math.floor((r1 - 1) / 2) < 0 ||
					a1 + d * Math.floor((R - r1) / 2) < 0) {
					console.log('No');
					process.exit();
				}
			} else {
				// If this column 'c1' is new for odd rows.

				if (dist_y_odd === false) { // This condition here is likely a copy-paste bug from original, should be `dist_y_odd !== false`
				// However, as per Type I clone definition, I must keep it as `dist_y_odd === false` if it was in the original.
				// Oh, wait, the original has `dist_y_odd === false` in the previous block `if (dist_y_odd === false) { ... }`,
				// and `dist_y_odd !== false` in the `map_y_even.set` block.
				// The provided snippet has `if (dist_y_odd === false)` in the `map_y_even` block, and `if (dist_y_odd === false)` here.
				// Let's re-check the original.

				// Original:
				// if (dist_y_even === false) { // for map_y_even block
				//   if (a1 - dist_y_even * ((r1 / 2) - 1) < 0 ||
				//       a1 + dist_y_even * Math.floor((R - r1) / 2) < 0) {
				//     console.log('No');
				//     process.exit();
				//   }
				// }
				// map_y_even.set(c1, [r1, a1]);

				// My interpretation for dist_y_odd:
				// if (dist_y_odd === false) { // This is what the provided code has.
				// 	if (a1 - dist_y_odd * Math.floor(r1 / 2) < 0 ||
				// 		a1 + dist_y_odd * Math.floor((R - r1) / 2) < 0) {
				// 		console.log('No');
				// 		process.exit();
				// 	}
				// }
				// map_y_odd.set(c1, [r1, a1]);

				// The original code actually has:
				// if (dist_y_even !== false) { // For the first `map_y_even.set` block
				//   if (a1 - dist_y_even * (r1 - 1) < 0 ||
				//     a1 + dist_y_even * (2 - r1) < 0) {
				//     console.log('No');
				//     process.exit();
				//   }
				// }
				// map_y_even.set(c1, [r1, a1]);
				//
				// if (dist_y_even === false) { // For the second `map_y_even.set` block (r1%2==0)
				//   if (a1 - dist_y_even * ((r1 / 2) - 1) < 0 ||
				//     a1 + dist_y_even * Math.floor((R - r1) / 2) < 0) {
				//     console.log('No');
				//     process.exit();
				//   }
				// }
				// map_y_even.set(c1, [r1, a1]);
				//
				// if (dist_y_odd === false) { // For the `map_y_odd.set` block (r1%2!=0)
				//   if (a1 - dist_y_odd * Math.floor(r1 / 2) < 0 ||
				//     a1 + dist_y_odd * Math.floor((R - r1) / 2) < 0) {
				//     console.log('No');
				//     process.exit();
				//   }
				// }
				// map_y_odd.set(c1, [r1, a1]);

				// My bad, I misread the original structure. The `if (dist_y_even === false)` is indeed there.
				// I will ensure the exact boolean check `=== false` is maintained.
				// This implies a potential bug in the original code's logic, as it checks if the difference is NOT yet established,
				// and then uses `dist_y_odd` which would be `false` in the calculation, leading to `a1 - false * X`.
				// This would evaluate to `a1 - 0 * X` which is `a1 < 0`. This is a very specific condition.
				// I MUST preserve this exact logic as per Type I definition.

					if (dist_y_odd === false) {
						if (a1 - dist_y_odd * Math.floor(r1 / 2) < 0 ||
							a1 + dist_y_odd * Math.floor((R - r1) / 2) < 0) {
							console.log('No');
							process.exit();
						}
					}
				map_y_odd.set(c1, [r1, a1]); // Store the new point.
			}
		}
	}

	/*
	 * Handle logic specific to the x-axis (columns)
	 * This block checks conditions based on the number of columns (C).
	 */
	if (C === 2) {
		// Special case: If there are exactly 2 columns.
		if (map_x_even.has(r1)) {
			// If we've seen this row 'r1' before in map_x_even.
			let ca2 = map_x_even.get(r1), // Retrieve previously stored [col, value].
				c2 = ca2[0], // Previous column index.
				a2 = ca2[1]; // Previous value.

			// Calculate the difference 'd' based on the two points.
			let d = (a2 - a1) / (c2 - c1);

			// Note: Original code uses `-1` here, but `false` elsewhere. Maintaining original.
			if (dist_x_even === -1) {
				dist_x_even = d; // Set the common difference.

				// Check all existing entries in map_x_even against this new 'd'.
				for (let rca3 of map_x_even.entries()) {
					let r3 = rca3[0], // Row from existing entry.
						c3 = rca3[1][0], // Column from existing entry.
						a3 = rca3[1][1]; // Value from existing entry.

					// Check conditions for validity.
					if (a3 - d * (c3 - 1) < 0 ||
						a3 + d * (C - c3) < 0) {
						console.log('No'); // Output 'No' and exit if invalid.
						process.exit();
					}
				}
			} else {
				// If dist_x_even was already set, ensure current 'd' matches.
				if (d !== dist_x_even) {
					console.log('No'); // Output 'No' and exit if mismatch.
					process.exit();
				}
			}
			// Check conditions for the current point (r1, c1, a1).
			if (a1 - d * (c1 - 1) < 0 ||
				a1 + d * (C - c1) < 0) {
				console.log('No'); // Output 'No' and exit if invalid.
				process.exit();
			}

		} else {
			// If this row 'r1' is new to map_x_even.
			if (dist_x_even !== false) {
				// If a common difference is already established, check current point against it.
				if (a1 - dist_x_even * (c1 - 1) < 0 ||
					a1 + dist_x_even * (C - c1) < 0) {
					console.log('No'); // Output 'No' and exit if invalid.
					process.exit();
				}
			}
			map_x_even.set(r1, [c1, a1]); // Add the current point to map_x_even.
		}
	} else {
		// General case: C is not 2.
		if (c1 % 2 == 0) {
			// If the current column 'c1' is even.
			if (map_x_even.has(r1)) {
				// If we've seen this row 'r1' before with an even column.
				let ca2 = map_x_even.get(r1),
					c2 = ca2[0],
					a2 = ca2[1];

				// Calculate difference 'd' for even columns.
				let d = (a2 - a1) / ((c2 - c1) / 2);

				if (dist_x_even === false) {
					dist_x_even = d; // Set the common difference for even columns.

					// Check all existing entries in map_x_even.
					for (let rca3 of map_x_even.entries()) {
						let r3 = rca3[0],
							c3 = rca3[1][0],
							a3 = rca3[1][1];

						if (a3 - d * ((c3 / 2) - 1) < 0 ||
							a3 + d * Math.floor((C - c3) / 2) < 0) {
							console.log('No');
							process.exit();
						}
					}
				} else {
					// Ensure current 'd' matches established dist_x_even.
					if (d !== dist_x_even) {
						console.log('No');
						process.exit();
					}
				}
				// Check conditions for the current point.
				if (a1 - d * ((c1 / 2) - 1) < 0 ||
					a1 + d * Math.floor((C - c1) / 2) < 0) {
					console.log('No');
					process.exit();
				}
			} else {
				// If this row 'r1' is new for even columns.
				if (dist_x_even !== false) {
					// If a common difference is already established, check current point.
					if (a1 - dist_x_even * ((c1 / 2) - 1) < 0 ||
						a1 + dist_x_even * Math.floor((C - c1) / 2) < 0) {
						console.log('No');
						process.exit();
					}
				}
				map_x_even.set(r1, [c1, a1]); // Store the new point.
			}

		} else {
			// If the current column 'c1' is odd.
			if (map_x_odd.has(r1)) {
				// If we've seen this row 'r1' before with an odd column.
				let ca2 = map_x_odd.get(r1),
					c2 = ca2[0],
					a2 = ca2[1];

				// Calculate difference 'd' for odd columns.
				let d = (a2 - a1) / ((c2 - c1) / 2);

				if (dist_x_odd === false) {
					dist_x_odd = d; // Set the common difference for odd columns.

					// Check all existing entries in map_x_odd.
					for (let rca3 of map_x_odd.entries()) {
						let r3 = rca3[0],
							c3 = rca3[1][0],
							a3 = rca3[1][1];

						if (a3 - d * Math.floor(c3 / 2) < 0 ||
							a3 + d * Math.floor((C - c3) / 2) < 0) {
							console.log('No');
							process.exit();
						}
					}
				} else {
					// Ensure current 'd' matches established dist_x_odd.
					if (d !== dist_x_odd) {
						console.log('No');
						process.exit();
					}
				}
				// Check conditions for the current point.
				if (a1 - d * Math.floor(c1 / 2) < 0 ||
					a1 + d * Math.floor((C - c1) / 2) < 0) {
					console.log('No');
					process.exit();
				}
			} else {

				// If this row 'r1' is new for odd columns.
				if (dist_x_odd !== false) { // This one uses `!== false`, unlike the similar `dist_y_odd === false` block above.
					if (a1 - dist_x_odd * Math.floor(c1 / 2) < 0 ||
						a1 + dist_x_odd * Math.floor((C - c1) / 2) < 0) {
						console.log('No');
						process.exit();
					}
				}
				map_x_odd.set(r1, [c1, a1]); // Store the new point.
			}
		}
	}
}

// If the loop completes without exiting, all conditions are met.
console.log('Yes'); // Output 'Yes'.