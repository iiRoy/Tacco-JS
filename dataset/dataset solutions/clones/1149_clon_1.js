"use strict"
	; // This is a strict mode declaration.

// --- Start of Input Handling Section ---

/*
 * This block defines a creative way to embed multiline string input
 * directly into the JavaScript file. It uses a function's toString()
 * method to extract the comment content, which serves as the input.
 */
var input = function () { /*
                         6 6
                         1 0 1 0 1 0
                         0 1 0 1 0 1
                         1 0 1 0 1 0
                         0 1 0 1 0 1
                         1 0 1 0 1 0
                         0 1 0 1 0 1
                         */}.toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1].replace(/\n/g, "\n"); // The input string is extracted here.

/*
 * This conditional block checks if the code is running in a browser
 * environment by checking for the 'document' object.
 * If in a browser, it sets up an event listener for DOM content loaded.
 */
if (typeof document != "undefined") {
	document.addEventListener("DOMContentLoaded",
		/**
		 * This anonymous function is executed when the DOM is fully loaded.
		 * It processes the embedded input string and passes it to the main function.
		 */
		function () {
			var lines = input.split("\n"); // Splits the input string into an array of lines.
			lines.shift(); // Removes the first line (often metadata or blank).
			lines.pop(); // Removes the last line (often metadata or blank).
			main(lines); // Calls the main logic function with the processed input lines.
		});
}

// --- Separator ---

/*
 * 'log' is an alias for console.log, making it shorter to type for debugging.
 */
var log = console.log;

/*
 * This conditional block checks if the code is running in a Node.js
 * environment by checking for the 'process' object.
 * If in Node.js, it sets up standard input (stdin) handling.
 */
if (typeof process != "undefined") {
	var input = ""; // Re-declares 'input' to store standard input in Node.js.
	process.stdin.resume(); // Resumes stdin to start listening for data.
	process.stdin.setEncoding('utf8'); // Sets the encoding for stdin to UTF-8.
	process.stdin.on('data',
		/**
		 * This event listener accumulates data chunks received from stdin.
		 * @param {string} chunk - A piece of data read from stdin.
		 */
		function (chunk) {
			input += chunk; // Appends the current chunk to the 'input' string.
		});
	process.stdin.on('end',
		/**
		 * This event listener is triggered when stdin stream ends.
		 * It processes the accumulated input and passes it to the main function.
		 */
		function () {
			var lines = input.split("\n"); // Splits the accumulated input into an array of lines.
			main(lines); // Calls the main logic function with the processed input lines.
		});
}

// --- End of Input Handling Section ---

// --- Utility Functions Section ---

/*
 * Determines if point 'b' is "righter" than point 'a'.
 * This comparison is based on the second element (column index) of the points.
 * @param {Array<number>} a - The first point, e.g., [row, col].
 * @param {Array<number>} b - The second point, e.g., [row, col].
 * @returns {boolean} True if b's column index is greater than a's.
 */
function isright(a, b) {
	// return true if b is righter than a
	return a[1] < b[1];
}

/*
 * Determines if point 'b' is "downer" than point 'a'.
 * This comparison is based on the first element (row index) of the points.
 * @param {Array<number>} a - The first point, e.g., [row, col].
 * @param {Array<number>} b - The second point, e.g., [row, col].
 * @returns {boolean} True if b's row index is greater than a's.
 */
function isdown(a, b) {
	// return true if b si downer than a
	return a[0] < b[0];
}

/*
 * Calculates the point immediately to the right of point 'a'.
 * @param {Array<number>} a - The original point, e.g., [row, col].
 * @returns {Array<number>} A new point [row, col + 1].
 */
function get_right(a) {
	// get right of a
	return [a[0], a[1] + 1];
}

/*
 * Calculates the point immediately below point 'a'.
 * @param {Array<number>} a - The original point, e.g., [row, col].
 * @returns {Array<number>} A new point [row + 1, col].
 */
function get_down(a) {
	return [a[0] + 1, a[1]];
}

/*
 * Checks if a given point 'a' is subdominant within a list of 'dominants'.
 * A point 'a' is subdominant if there exists another point 'c' in 'dominants'
 * such that 'c' is "righter" or "downer" than 'a' along one axis while
 * having the same coordinate on the other axis.
 * @param {Array<number>} a - The point to check for subdominance.
 * @param {Array<Array<number>>} dominants - A list of dominant points.
 * @returns {boolean} True if 'a' is subdominant to at least one point in 'dominants'.
 */
function exists_more_dominant(a, dominants) {
	// return if a is subdominant in dominants
	// ??????????????????w??§???????????????h????°????????????????????????????????????????????????????
	var alpha = dominants.unshift(false); // Inserts a dummy element at the beginning; 'alpha' gets the new length.
	var ret = dominants.reduce(function (p, c) { // Reduces the dominants array to find if any point dominates 'a'.
		if (p) {
			return p; // If already found a dominant, continue propagating true.
		} else {
			if (a[1] == c[1]) { // If column coordinates are the same...
				return isdown(c, a); // Check if 'c' is "downer" than 'a'.
			}
			if (a[0] == c[0]) { // If row coordinates are the same...
				return isright(c, a); // Check if 'c' is "righter" than 'a'.
			}
			return p; // No dominance found for current 'c'.
		}
	});
	dominants.shift(); // Removes the dummy element added earlier.
	return ret; // Returns the result of the dominance check.
}

/*
 * Extends the Array.prototype with a 'fill' method.
 * This custom 'fill' method creates a new array of the same length
 * and fills it with the specified element 'e'.
 * Note: This is different from the native Array.prototype.fill which modifies in-place.
 * @param {*} e - The element to fill the array with.
 * @returns {Array} A new array filled with 'e'.
 */
Array.prototype.fill = function (e) {
	var l = this.length; // Gets the length of the original array.
	var r = []; // Initializes a new array to store the filled elements.
	for (var k = 0; k < l; k++) {
		r[k] = e; // Fills each position in the new array with 'e'.
	}
	return r; // Returns the newly created and filled array.
};

// --- End of Utility Functions Section ---

// --- Main Logic Section ---

/**
 * The main function that processes the input lines to solve the problem.
 * It calculates the maximum area of a rectangle of 0s in a binary grid.
 * @param {Array<string>} lines - An array of strings, where each string represents a row in the grid.
 */
function main(lines) {
	/*
	 * Parses the input lines into a 2D array of numbers.
	 * Each line is split by space, and each part is converted to a number.
	 */
	var lines2 = lines.map(function (e) {
		return e.split(" ").map(function (f) {
			return Number(f);
		});
	});

	var top_line = lines2.shift(); // Extracts the first line, which contains grid dimensions.
	var H = top_line[0]; // Height of the grid.
	var W = top_line[1]; // Width of the grid.

	var max = -1; // Initializes the maximum area found so far.

	// These arrays store information for dynamic programming.
	var n_x = new Array(W).fill(-1); // Stores the row index of the nearest '1' above or -1.
	var n_y = new Array(W).fill(-1); // Stores the column index of the nearest '1' to the left or -1.
	var dom = new Array(W).fill([]); // Stores dominant points for each column.

	/*
	 * Iterates through each cell of the grid (row by row, then column by column).
	 */
	for (var h = 0; h < H; h++) {
		var v_n_x = []; // Temporary array for n_x for the current row.
		var v_n_y = []; // Temporary array for n_y for the current row.
		var v_dom = []; // Temporary array for dom for the current row.

		for (var w = 0; w < W; w++) {
			var val = lines2[h][w]; // The value of the current cell (0 or 1).

			// Calculate n_n_x (row of nearest '1' above)
			var n_n_x = h == 0 ? -1 : n_x[w];

			// Calculate n_n_y (column of nearest '1' to the left)
			var n_n_y = w == 0 ? -1 : v_n_y[w - 1]; // Note: uses v_n_y for current row's left neighbor

			// Retrieve dominant points from the cell diagonally top-left.
			var _dom = h == 0 || w == 0 ? [] : dom[w - 1]; // Note: uses dom from previous row for current column's left neighbor

			var n_dom; // Will store the updated dominant points for the current cell.

			if (val == 0) {
				// If the current cell is 0, we can potentially extend a rectangle.
				var x_c = [n_n_x, w]; // Represents the top-left corner based on n_n_x.
				var y_c = [h, n_n_y]; // Represents the top-left corner based on n_n_y.

				// Debugging log statements (commented out or conditional in original).
				// if (h == 1 && w == 2) { log(n_dom); }

				/*
				 * Maps existing dominant points from _dom to new dominant points for the current cell.
				 * This logic updates the dominant points based on the current cell's (h, w) coordinates
				 * and the nearest '1's (n_n_x, n_n_y).
				 */
				n_dom = _dom.map(function (e) {
					if (!isright(y_c, e) && !isdown(x_c, e)) {
						return [n_n_x + 1, n_n_y + 1];
					}
					if (!isright(y_c, e)) {
						return [e[0], n_n_y + 1];
					}
					if (!isdown(x_c, e)) {
						return [n_n_x + 1, e[1]];
					}
					return e;
				});

				// Add new potential dominant points based on current cell.
				n_dom.push(get_right(y_c)); // Point derived from the left-most '1'.
				n_dom.push(get_down(x_c)); // Point derived from the top-most '1'.

				// if (h == 1 && w == 2) { log(n_dom); }

				/*
				 * Filters out subdominant points.
				 * This ensures that only truly dominant points (representing top-left corners of potential rectangles)
				 * are kept.
				 */
				n_dom = n_dom.filter(function (e) {
					return !exists_more_dominant(e, n_dom);
				});

				// if (h == 1 && w == 2) { log(n_dom); }

				/*
				 * Filters out duplicate dominant points.
				 * This ensures uniqueness among the remaining dominant points.
				 */
				n_dom = n_dom.filter(function (e, i) {
					for (var k = 0; k < i; k++) {
						var o = n_dom[k];
						if (o[0] == e[0] && o[1] == e[1]) {
							return false; // Duplicate found.
						} else {
							continue; // Continue checking.
						}
					}
					return true; // No duplicate found so far for this element.
				});
			} else {
				// If the current cell is 1, it breaks any continuous rectangle.
				n_n_x = h; // The nearest '1' above is the current row.
				n_n_y = w; // The nearest '1' to the left is the current column.
				n_dom = []; // No dominant points can pass through a '1'.
			}

			// Store the calculated values for the current cell.
			v_dom[w] = n_dom; // Current column's dominant points for the current row.
			n_x[w] = n_n_x; // Current column's nearest '1' row index for the current row.
			v_n_y[w] = n_n_y; // Current column's nearest '1' column index for the current row.

			var maxs = [-1]; // Initializes an array to hold potential max areas for the current cell.
			/*
			 * For each dominant point, calculate the area of the rectangle it defines
			 * with the current cell (h, w) as the bottom-right corner.
			 */
			n_dom.forEach(function (e) {
				var hei = h - e[0] + 1; // Height of the rectangle.
				var wid = w - e[1] + 1; // Width of the rectangle.
				maxs.push(hei * wid); // Add the calculated area to the list.
			});

			/*
			 * Find the maximum area among all rectangles ending at (h, w).
			 * Math.max.apply is used to find the maximum in an array.
			 */
			var m = Math.max.apply(this, maxs);
			if (m > max) {
				max = m; // Update the overall maximum area if a larger one is found.
			}
		}
		// After processing all columns in the current row (h), update the DP arrays for the next row.
		n_x = new Array(W).fill(-1); // Reset n_x for the next row (it depends on the '1's above).
		n_y = v_n_y; // n_y for the next row becomes v_n_y from the current row.
		dom = v_dom; // dom for the next row becomes v_dom from the current row.
	}
	log(max); // Output the final maximum area found.
}