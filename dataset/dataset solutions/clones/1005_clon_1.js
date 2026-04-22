/*
 * This JavaScript program demonstrates a selection sort algorithm.
 * It reads a list of numbers, sorts them in ascending order,
 * and counts the total number of element exchanges (swaps) performed.
 */

// First, we import the 'fs' module, which provides file system capabilities.
// This is used to read input from '/dev/stdin'.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');

// Next, we process the raw input string.
// We trim any leading/trailing whitespace and then split it into an array
// of strings, using the newline character as a delimiter.
var input_array = input.trim().split("\n");

// From the 'input_array', we are interested in the second line (index 1),
// which is expected to contain the numbers to be sorted.
// This line is split by spaces, and each resulting string is converted to a Number.
var numbers = input_array[1].split(' ').map((n) => Number(n));


// Initialize a variable to keep track of how many times elements are swapped.
var exchange_count = 0;


// This is the main sorting logic, implementing the Selection Sort algorithm.
// The outer loop iterates from the first element up to the second-to-last element.
for (var i = 0; i < numbers.length; i++)
{
   // Assume the current element at index 'i' is the minimum in the unsorted part.
   var min_index = i;

   // The inner loop searches for the actual minimum element
   // within the unsorted portion of the array (from 'i' to the end).
   for (var j = i; j < numbers.length; j++)
   {
      // If an element at 'j' is found to be smaller than the current minimum,
      // update 'min_index' to 'j'.
      min_index = numbers[j] < numbers[min_index] ? j : min_index;
   }

   // After the inner loop completes, 'min_index' holds the index of the smallest
   // element in the unsorted subarray.
   // If this minimum element is not already at the current position 'i',
   // then we need to swap it into place.
   if (min_index !== i)
   {
      // Perform the swap using a temporary variable 'tmp'.
      var tmp = numbers[min_index];
      numbers[min_index] = numbers[i];
      numbers[i] = tmp;

      // Increment the counter for exchanges.
      exchange_count++;
   }
}


// After the sorting is complete, print the sorted array elements.
// They are joined back into a single string with spaces in between.
console.log(numbers.join(' '));

// Finally, print the total number of swaps that occurred during the sort.
console.log(exchange_count);