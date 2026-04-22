var           log         =      console    .    log         ;


// Check if the code is running in a Node.js environment
if (      typeof   process       !=    "undefined"      )
{
 // Initialize an empty string to accumulate input data
	var input = "" ;


		// Resume the standard input stream
	process.stdin.resume();

	// Set the encoding for the input stream to UTF-8
	process.stdin.setEncoding('utf8');


		// Event listener for incoming data chunks
	process.stdin.on('data', function (chunk) {
		input += chunk; // Append the chunk to the input string
	});


	// Event listener for the end of the input stream
	process.stdin.on('end', function () {
		// Split the accumulated input into lines
		var lines = input.split("\n");
				main(lines); // Call the main function with the processed lines
	});
}

// -------------------------------------------------------------------------------------------------------------

/**
 * The primary function that processes an array of input lines.
 * It parses the input, extracts data sets, and then calls the dataset processing function.
 * @param {Array<string>} lines - An array of strings, where each string is a line from the input.
 */
function main(lines) {


	// First, transform the input lines:
	// Convert individual numbers or space-separated numbers into numerical arrays or single numbers.
	lines = lines.map(function (e) {
		if (e.split(" ").length >= 2) {
			// If a line contains multiple space-separated values, convert them to numbers.
			return e.split(" ").map(function (f) {
				return Number(f); // Convert each part to a number.
			});
		} else {
			// Otherwise, it's a single number.
			return Number(e);
		}
	});


		// Process data sets until there are no more lines left.
	while (lines.length > 0) {

		// Get the first line, which should contain N and M.
		var top = lines.shift();
		var nums = top; // Assign to a more descriptive variable.

		var N = nums[0]; // Number of elements for H.
		var M = nums[1]; // Number of elements for W.


		// Check for the termination condition (N=0, M=0).
		if (N == 0 && M == 0) {
			return; // Exit the function if the termination condition is met.
		} else {
			// Extract H and W arrays based on N and M.
			// H represents the first N elements following N, M.
			var H = lines.splice(0, N);
			// W represents the next M elements.
			var W = lines.splice(0, M);
						dataset(H, W); // Process this specific data set.
		}
	}
}

// This function handles the processing for a single data set (H and W arrays).
/**
 * Processes a given dataset consisting of two arrays, H and W.
 * It calculates the frequencies of all possible sums for sub-arrays within H and W,
 * then determines the "cross" product based on these frequencies.
 *
 * @param {Array<number>} H - The first array of numbers for the current dataset.
 * @param {Array<number>} W - The second array of numbers for the current dataset.
 */
function dataset(H, W) {

	// The goal here is to find how many times a sum 'X' appears as a sub-array sum in H,
	// and how many times that same sum 'X' appears as a sub-array sum in W.
	// Then, for each such 'X', we multiply the counts from H and W and sum these products.

	// Calculate frequency maps for sums of contiguous sub-arrays for H.
	var HE = listnum(H);
	// Calculate frequency maps for sums of contiguous sub-arrays for W.
	var WE = listnum(W);

	// Compute the 'cross' product of the two frequency maps.
	var cross = crossobj(HE, WE);

	// Log the final result for this dataset.
	log(cross);
}

// Function to generate a frequency map of all possible contiguous sub-array sums.
/**
 * Generates an object where keys are sums of contiguous sub-arrays and values are their frequencies.
 * For example, for [1, 2, 3], sums would be: 1, 2, 3, (1+2)=3, (2+3)=5, (1+2+3)=6.
 * The resulting object would map these sums to their counts.
 *
 * @param {Array<number>} arr - The input array of numbers.
 * @returns {Object<number, number>} An object mapping sums to their frequencies.
 */
function listnum(arr) {
	var len = arr.length; // Get the length of the input array.
	var result = {}; // Initialize an empty object to store sum frequencies.

	// Outer loop iterates through all possible starting points of a sub-array.
	for (var i = 0; i < len; i++) {
		var cur = 0; // Initialize current sum for the sub-array starting at 'i'.

		// Inner loop extends the sub-array from 'i' to the end of the array.
		for (var j = i + 1; j <= len; j++) {
			cur += arr[j - 1]; // Add the next element to the current sum.

			// Increment the count for this sum in the result object.
			if (!result[cur]) {
				result[cur] = 1; // If sum not seen before, initialize count to 1.
			} else {
				result[cur]++; // Otherwise, increment existing count.
			}
		}
	}
	return result; // Return the frequency map of sums.
}

// This function calculates the "cross product" of two frequency objects.
// It effectively finds common sums and multiplies their frequencies.
/**
 * Calculates the sum of products of frequencies for common keys (sums) between two objects.
 * This is used to find how many times a sum from array A also appears in array B,
 * considering their respective frequencies.
 *
 * @param {Object<number, number>} A - The first frequency map (e.g., from listnum(H)).
 * @param {Object<number, number>} B - The second frequency map (e.g., from listnum(W)).
 * @returns {number} The calculated cross product sum.
 */
function crossobj(A, B) {
	var ret = 0; // Initialize the return value (total cross product).

	// Iterate over the keys (sums) in the first frequency map (A).
	for (key in A) {
		// Check if the current key (sum) also exists in the second frequency map (B).
		// The `!!B[key]` ensures that B[key] is truthy (exists and is not 0).
		if (!!B[key]) {
			// If the sum exists in both, multiply their frequencies and add to the total.
			ret += A[key] * B[key];
		}
	}
	return ret; // Return the final calculated cross product.
}