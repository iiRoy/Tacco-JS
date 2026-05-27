let finished_processing = false; // A flag to control the program's termination state

// Define a small repeating pattern segment as a Buffer
const pattern_segment = Buffer.from("#.#.#.#.#.", 'utf8');

// Allocate a larger Buffer to hold the full generated pattern string
let full_pattern_string_buffer = Buffer.alloc(300);

// Populate the large buffer by repeatedly copying the small segment
for (let current_offset = 0; current_offset < 300; current_offset += 10) {
	pattern_segment.copy(full_pattern_string_buffer, current_offset, 0);
}

// Convert the populated buffer into a string for easier slicing
const full_pattern_text = full_pattern_string_buffer.toString();

// Use Node.js 'fs' module to read standard input, split by newlines, and process each line
require('fs').readFileSync('/dev/stdin', 'ascii').split('\n').forEach(processInputLine);

// The original code had a commented-out test array: //["2 2", "3 3", "0 0"].forEach(main);

/**
 * Processes a single line of input, parsing dimensions and printing a pattern.
 * @param {string} input_data - The current line of text read from standard input.
 */
function processInputLine(input_data) {
	// Check for the termination condition
	if (input_data === '0 0') {
		finished_processing = true; // Set the flag to indicate processing should stop
		return; // Exit this function call
	}

	// If the termination flag is set, skip further processing for subsequent lines
	if (finished_processing) {
		return;
	}

	// Parse the height and width from the input line
	const dimensions_array = input_data.split(' ').map(Number);
	const width_val = dimensions_array[1]; // Extract the width component

	// Create the 'even' row pattern slice (starting from the first character)
	const even_pattern_slice = full_pattern_text.slice(0, width_val);

	// Create the 'odd' row pattern slice (starting from the second character)
	const odd_pattern_slice = full_pattern_text.slice(1, width_val + 1);

	// Call the display function with the height and the two generated pattern slices
	displayPatternRows(dimensions_array[0], even_pattern_slice, odd_pattern_slice);

	// Print an empty line after each block of patterns, as per original behavior
	console.log("");
}

/**
 * Prints a series of rows, alternating between two provided pattern strings.
 * @param {number} height_val - The total number of rows to be printed.
 * @param {string} even_row_str - The pattern string to use for even-indexed rows.
 * @param {string} odd_row_str - The pattern string to use for odd-indexed rows.
 */
function displayPatternRows(height_val, even_row_str, odd_row_str) {
	// Iterate through each row, from 0 up to (height_val - 1)
	for (let row_index = 0; row_index < height_val; row_index++) {
		// Check if the current row index is even
		if (row_index % 2 === 0) {
			console.log(even_row_str); // Print the pattern for even rows
		}
		// If the current row index is odd
		else {
			console.log(odd_row_str); // Print the pattern for odd rows
		}
	}
}
