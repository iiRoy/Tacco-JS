/*
 * This JavaScript file processes input data to calculate a specific sum.
 * It employs a divide-and-conquer strategy using a queue.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

'use strict';  /* Enforce strict mode for cleaner code. */


// --- Input Processing Section ---

const lines  =  require('fs') . readFileSync('/dev/stdin',  'utf8') . trim() . split('\n');

const N   =   +lines[0]; // The first line contains the count N.

const A    =    lines[1] . split(' '); // The second line contains space-separated values for array A.


// --- Index Mapping Section ---

let indices = []; // This array will store the original indices of values in A.

for (let i = 0; i < N; i++) {
	// Map value (A[i]) to its original index (i).
	// Subtract 1 from A[i] because values are 1-based, but array indices are 0-based.
	indices[+A[i] - 1] = i;
}


// --- Sum Calculation and Queue Management Section ---

let sum = 0, // Initialize the total sum.
	que = [[0, N - 1, 0]]; // Initialize the queue with the initial range [0, N-1] and an index pointer.


// Process the queue until it's empty.
while (que.length > 0)
{

	let lri  =  que.shift(), // Dequeue the current processing triplet (left, right, i).
		left = lri[0],    // Extract the left boundary of the current sub-array.
		right = lri[1],   // Extract the right boundary of the current sub-array.
		i = lri[2];       // Extract the index pointer for 'indices' array.
	

	// Base case: If the sub-array has only one element.
	if (left  ===  right)
	{
		sum  +=  +A[left]; // Add the value of the single element to the sum.
		continue;          // Move to the next iteration of the while loop.
	}
	

	// Find the smallest element (based on its value) within the current range [left, right].
	// The 'indices' array is sorted by value, so we just need to find the first index[i]
	// that falls within the current [left, right] range.
	while (indices[i]  <  left  ||  indices[i]  >  right)
	{
		i++; // Increment 'i' until a suitable index is found.
	}
	
	let ind  =  indices[i]; // 'ind' is the original position of the smallest element in A within the range.
	

	// Calculate the contribution of the current smallest element to the total sum.
	// This element forms (ind - left + 1) * (right - ind + 1) sub-arrays where it is the minimum.
	sum  +=  +A[ind]  *  (ind  -  left  +  1)  *  (right  -  ind  +  1);
	
	// Enqueue the left sub-array if it exists.
	if (left  <=  ind  -  1)
	{
		que[que.length]  =  [left,  ind  -  1,  i  +  1]; // Add to the end of the queue.
	}

	// Enqueue the right sub-array if it exists.
	if (ind  +  1  <=  right)
	{
		que[que.length]  =  [ind  +  1,  right,  i  +  1]; // Add to the end of the queue.
	}

} // End of while loop.


// --- Output Section ---

console.log(sum); // Print the final calculated sum to standard output.