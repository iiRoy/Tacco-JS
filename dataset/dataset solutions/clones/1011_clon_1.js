/*
 * This JavaScript program demonstrates sorting algorithms: Bubble Sort and Selection Sort.
 * It reads numerical data from standard input, sorts two copies of it
 * using the different algorithms, and then compares their results
 * to determine if the sorting was stable.
 *
 * This specific version is a Type I clone, meaning its functionality
 * is identical to the original, but its formatting (whitespace,
 * indentation, and comments) has been extensively altered for
 * visual differentiation.
 */

// Initialize input variables by reading from standard input.
let input =
    require('fs')
        .readFileSync( // Synchronously reads the entire content of a file.
            '/dev/stdin', // Specifies the file path for standard input.
            'utf8'        // Sets the encoding for the file content.
        ).split('\n');    // Splits the read content into an array of strings,
                          // using the newline character as a delimiter.


// Prepare two separate arrays for sorting, both initialized with the same data.
// The second line of input (index 1) is expected to contain the elements to be sorted,
// separated by spaces.
let lineA = input[1] . split(' '); // Array for Bubble Sort.
let lineB = input[1] . split(' '); // Array for Selection Sort.

// The first line of input (index 0) is expected to be the number of elements 'n'.
let n = Number(input[0]);         // Converts the string 'n' to a numerical type.


/**
 * Implements the Bubble Sort algorithm.
 *
 * @param {Array<string>} A - The array of elements (strings) to be sorted.
 * @param {number} N - The number of elements in the array.
 */
function bubbleSort(A, N) {
    // Outer loop: controls the number of passes.
    // In each pass, the largest unsorted element "bubbles" to its correct position.
    for (let i = 0;
            i < n;
                i++) {

        // Inner loop: performs the actual comparisons and swaps.
        // It iterates from the end of the unsorted portion down to 'i + 1'.
	    for (let j = n - 1;
                j > i;
                    j--) {

            // Compares the numerical part of two adjacent elements.
            // A[j].match(/\d/) extracts the first sequence of digits from the string.
    		if (A[j].match(/\d/) < A[j - 1].match(/\d/)) {
    			// If the current element is smaller than the previous one, swap them.
    			let tmp = A[j];     // Temporarily store the current element.
    			A[j] = A[j - 1];    // Move the previous element to the current position.
    			A[j - 1] = tmp;     // Place the stored element in the previous position.
    		}
    	}
    }
}


/**
 * Implements the Selection Sort algorithm.
 *
 * @param {Array<string>} A - The array of elements (strings) to be sorted.
 * @param {number} N - The number of elements in the array.
 */
function selectionSort (A, N) {
    // Outer loop: iterates through the array to place elements in their sorted positions.
    for (let i = 0;
            i <= N - 1;
                i++) {

            // Assume the current element at index 'i' is the minimum.
            let minj = i;

       // Inner loop: finds the index of the minimum element in the unsorted part of the array.
       for (let j = i;
                j <= N - 1;
                    j++) {

             // Compares the numerical value of the second character (index 1) of elements.
             // Subtracting 0 converts the character to a number.
             if (A[j][1] - 0 < A[minj][1] - 0) {
                // If a smaller element is found, update 'minj' to its index.
                minj = j;
           }
       }

            // After the inner loop, if the minimum element is not at the current position 'i',
            // swap it into place. This comparison ensures a swap only occurs if needed.
            if (A[i][1] - 0 !== A[minj][1] - 0) {
              // Note: 'tmp' is declared implicitly here, mirroring the original code's behavior.
              // In strict mode, this would throw an error if 'tmp' wasn't declared elsewhere.
              tmp = A[i];        // Store the element at 'i'.
             A[i] = A[minj];     // Move the minimum element to position 'i'.
             A[minj] = tmp;      // Place the stored element in the minimum's original position.
            }
       }
}


// Execute Bubble Sort on 'lineA'.
bubbleSort(lineA, n);

// Print the sorted elements of 'lineA', joined by spaces.
console.log(lineA.join(' '));

// Print a hardcoded message indicating stability for Bubble Sort (in this context).
console.log('Stable');


// Execute Selection Sort on 'lineB'.
selectionSort(lineB, n);

// Print the sorted elements of 'lineB', joined by spaces.
console.log(lineB.join(' '));

// Compare the results of Bubble Sort and Selection Sort to check for overall stability.
// If the joined strings are identical, it implies both algorithms maintained the
// relative order of equal elements for this specific input, thus 'Stable'.
console.log((lineA.join(' ') === lineB.join(' ')) ?
    'Stable' : // Output if the results are identical.
    'Not stable'); // Output if the results differ.