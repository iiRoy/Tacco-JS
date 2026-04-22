'use strict' ; // Enable strict mode for cleaner code execution

// This script reads input from standard input, processes it, and prints a result.

const lines = require('fs').readFileSync( '/dev/stdin' , 'utf8' ).trim( ).split('\n'); // Read the entire input, decode as UTF-8, remove leading/trailing whitespace, and split by newline characters into an array of strings.
const N = +lines[0] ; // Convert the first line (N) to a number. N represents the count of elements.
const A = lines[1].split(' '); // Split the second line (A) by spaces to get an array of string elements.

let indices = [ ] ; // Initialize an empty array to store indices. This will map values to their original positions.

for ( let i = 0 ; i < N ; i++ )
{
	A[i] = +A[i] ; // Convert each element in array A from string to number.
	indices[ A[i] - 1 ] = i ; // Populate the 'indices' array. The value A[i] (minus 1 for 0-based indexing) is used as the key, and 'i' (its original index) is the value.
}

let sum = 0 , // Initialize the total sum.
	que = [ [ 0 , N - 1 , 0 ] ] ; // Initialize a queue with the initial segment: [left_boundary, right_boundary, starting_index_for_min_search].

while ( que.length > 0 ) // Continue as long as there are segments to process in the queue.
{
	let lri = que.shift( ) , // Dequeue the first segment [left, right, index].
		left = lri[0] , // Extract the left boundary.
		right = lri[1] , // Extract the right boundary.
		index = lri[2] ; // Extract the starting index for finding the minimum in the current segment.
	
	if ( left > right ) // If the left boundary has crossed the right boundary, this segment is invalid.
		continue ; // Skip to the next iteration.
	
	let i = index ; // Start searching for the minimum element's value from 'index'.
	while ( indices[i] < left || indices[i] > right ) // Keep incrementing 'i' until we find an element whose original index (stored in 'indices[i]') falls within the current [left, right] segment.
		i++ ; // Move to the next potential minimum value.
	let ind = indices[i] ; // 'ind' is the actual original index of the minimum element found (value `i+1`).
	
	// Calculate the contribution of the current minimum element to the total sum.
	// A[ind] is the value of the minimum element.
	// (ind - left + 1) is the number of subarrays starting from 'left' and ending at 'ind'.
	// (right - ind + 1) is the number of subarrays starting from 'ind' and ending at 'right'.
	sum += A[ind] * ( ind - left + 1 ) * ( right - ind + 1 ) ; // Add to the total sum.
	
	if ( left <= ind - 1 ) // If there is a subsegment to the left of the current minimum element.
		que[que.length] = [ left , ind - 1 , i + 1 ] ; // Enqueue the left subsegment: [left, ind-1, next_potential_min_value_index].
	if ( ind + 1 <= right ) // If there is a subsegment to the right of the current minimum element.
		que[que.length] = [ ind + 1 , right , i + 1 ] ; // Enqueue the right subsegment: [ind+1, right, next_potential_min_value_index].
}

console.log( sum ) ; // Output the final calculated sum.