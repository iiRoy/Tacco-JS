/*
 * This JavaScript file implements a set of operations (A, B, C, D)
 * that modify a shared array, 'arr'. The main part of the script
 * processes input, applies these operations based on commands,
 * and then outputs the modified array.
 *
 * The array 'arr' is dynamically sized based on input 'n',
 * and boundary markers 'X' are added to its ends for internal logic.
 */

function AA()
{
  // Function AA: Find the first occurrence of '0' and replace it with 'A'.
  // It iterates from the second element (index 1) up to the second-to-last element.
  for ( var i = 1; i < arr.length - 1; i++ )
  {
    // Check if the current element is '0'.
    if ( arr[i] == 0 )
    {
      arr[i] = "A"; // Replace '0' with 'A'.
      return;       // Exit the function immediately after the first change.
    }
  }
} // End of function AA

function BB()
{
  // Function BB: This function has two main phases for modification.

  // Phase 1: Search backwards for a specific pattern.
  // Iterate from the second-to-last element down to the second element.
  for ( var i = arr.length - 2; i >= 1; i-- )
  {
    // Look for a sequence: [not 'A'], [0], [not 'A']
    if ( arr[i - 1] != "A" && arr[i] == 0 && arr[i + 1] != "A" )
    {
      arr[i] = "B"; // If the pattern is found, replace the '0' with 'B'.
      return;       // Exit the function after the first successful modification.
    }
  }

  // Phase 2: If the specific pattern was not found, search forwards for any '0'.
  // This loop runs if the first loop completed without returning.
  for ( var i = 1; i < arr.length - 1; i++ )
  {
    // Find the first '0' from the beginning.
    if ( arr[i] == 0 )
    {
      arr[i] = "B"; // Replace it with 'B'.
      return;       // Exit after the first modification.
    }
  }
} // End of function BB

function CC()
{
  // Function CC: Aims to place 'C' adjacent to a non-zero element.

  // Iterate through the array from the second element to the second-to-last.
  for ( var i = 1; i < arr.length - 1; i++ )
  {
    // Check if the current element is non-zero AND the next element is zero.
    if ( arr[i] != 0 && arr[i + 1] == 0 )
    {
      arr[i + 1] = "C"; // Place 'C' in the next position.
      return;           // Exit immediately.
    }

    // Check if the current element is non-zero AND the previous element is zero.
    if ( arr[i] != 0 && arr[i - 1] == 0 )
    {
      arr[i - 1] = "C"; // Place 'C' in the previous position.
      return;           // Exit immediately.
    }
  }

  // Special conditions based on the parity of 'n' (original array size).
  // These are fallback placements if no adjacent '0' was found.

  // If 'n' is odd, place 'C' at a specific calculated middle-ish index.
  if ( n % 2 == 1 )
    arr[(n - 1) / 2 + 1] = "C";

  // If 'n' is not odd (i.e., 'n' is even), place 'C' at another calculated middle-ish index.
  if ( n % 2 != 1 )
    arr[n / 2 + 1] = "C";

  // Note: There is no 'return' after these 'if' statements,
  // meaning if 'n' was odd, the second 'if' would still be checked,
  // though its condition `n % 2 != 1` would be false.
} // End of function CC

function DD()
{
  // Function DD: Finds the longest contiguous block of '0's and places 'D' in its center.
  // If no such block is found, it places 'D' in the first available '0'.

  // 'max' stores [index of start of longest block, length of longest block].
  var max = [ 0, 0 ];

  // Iterate through the array to find potential starting points for zero blocks.
  for ( var i = 1; i < arr.length - 1; i++ )
  {
    // If the current element is not '0', skip to the next.
    if ( arr[i] != 0 )
      continue;

    // Initialize pointers for expanding outwards from 'i'.
    var jA  =  i; // Left pointer.
    var jB  =  i; // Right pointer.
    var cnt =  0; // Counter for the current block's length.

    // Expand outwards from 'i' to find the boundaries of the '0' block.
    while ( true )
    {
      // Move left pointer 'jA' inwards if it hasn't hit an 'X'.
      if ( arr[jA] != "X" )
        jA--;

      // Move right pointer 'jB' outwards if it hasn't hit an 'X'.
      if ( arr[jB] != "X" )
        jB++;

      // Break condition 1: Both pointers have hit the 'X' boundary markers.
      if ( arr[jA] == "X" && arr[jB] == "X" )
        break;

      // Break condition 2: Left pointer has hit a non-'X' and non-'0' element.
      if ( arr[jA] != "X" && arr[jA] != 0 )
        break;

      // Break condition 3: Right pointer has hit a non-'X' and non-'0' element.
      if ( arr[jB] != "X" && arr[jB] != 0 )
        break;

      // Increment the count as we are still within a '0' block.
      cnt++;

      // Update 'max' if the current block is longer than any previously found.
      if ( max[1] < cnt )
        max = [ i, cnt ]; // Store starting index 'i' and new maximum count.
    } // End of while loop for expanding zero block.
  } // End of for loop iterating through array.

  // After checking all possible '0' blocks, if a valid longest block was found (max[0] and max[1] are non-zero).
  if ( max[0] != 0 && max[1] != 0 )
  {
    arr[max[0]] = "D"; // Place 'D' at the starting position of the longest block.
    return;            // Exit DD function.
  }

  // Fallback: If no specific longest zero block was found (or all were length 0),
  // find the first available '0' and replace it with 'D'.
  for ( var i = 1; i < arr.length - 1; i++ )
  {
    if ( arr[i] == 0 )
    {
      arr[i] = "D"; // Replace the first '0' with 'D'.
      return;       // Exit.
    }
  }
} // End of function DD

// --- Main Program Execution Flow ---

// Read the entire input from standard input synchronously.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input: remove leading/trailing whitespace and split into an array of lines.
var Arr = input.trim().split("\n");

// Main loop to handle multiple test cases from the input.
while ( true )
{
  // Get the first line of the current test case, split by space, and convert to numbers.
  var nm = Arr.shift().split(" ").map(Number);

  // Extract 'n' (array size) and 'm' (number of operations) from the parsed line.
  var n = nm[0];
  var m = nm[1];

  // Termination condition for the main loop: if both 'n' and 'm' are zero.
  if ( n == 0 && m == 0 )
    break; // Exit the while loop.

  // Initialize the 'arr' array with 'n' zero elements.
  var arr = [];
  for ( var i = 0; i < n; i++ )
    arr.push(0);

  // Add boundary markers 'X' to the beginning and end of 'arr'.
  // These are used by functions like DD to detect array limits.
  arr.unshift("X"); // Adds 'X' to the front.
  arr.push("X");    // Adds 'X' to the end.

  // Execute 'm' operations specified in the input.
  for ( var i = 0; i < m; i++ )
  {
    // Get the next operation command (e.g., "A", "B", "C", "D").
    var v = Arr.shift();

    // Call the corresponding function based on the command 'v'.
    if ( v == "A" )
      AA(); // Execute function AA.
    if ( v == "B" )
      BB(); // Execute function BB.
    if ( v == "C" )
      CC(); // Execute function CC.
    if ( v == "D" )
      DD(); // Execute function DD.
  }

  // Remove the temporary boundary markers 'X' before printing the final result.
  arr.shift(); // Remove the first element ('X').
  arr.pop();   // Remove the last element ('X').

  // Join the array elements into a single string and replace all '0's with '#'.
  // Then, print the final modified string to the console.
  console.log(arr.join("").replace(/0/g, "#"));
} // End of main while loop.