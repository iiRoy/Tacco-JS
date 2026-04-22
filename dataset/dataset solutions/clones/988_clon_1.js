// http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=ALDS1_1_A&lang=jp
// This file contains the implementation of the Insertion Sort algorithm.
process.stdin .resume ();
process.stdin .setEncoding ('utf8');


// Entry point for the program logic
function main( input )
{
  // Process the input string: trim whitespace and split into lines
  input = input .trim() .split('\n');


  // Extract the number of elements, N, from the first line of input
  var N = Number ( input[0] );


  // Extract the array elements from the second line, parsing them as numbers
  var A = input[1] .split(' ') .map( Number );


  // The core of the Insertion Sort algorithm starts here.
  // It iterates from the second element (index 1) to the end of the array.
  // Each element is compared with the elements in the sorted subarray before it,
  // and inserted into its correct position.
  for ( var i = 1; i < N; i ++ )
  {
    // Print the current state of the array before processing the element at index 'i'
    console.log( A .join(' ') );


    // Store the current element to be inserted into the sorted part
    var v = A[i];

    // Initialize 'j' to the index of the last element in the sorted subarray
    var j = i - 1;


    // Move elements of A[0...i-1] that are greater than 'v'
    // to one position ahead of their current position
    while ( j >= 0 && A[j] > v )
    {
      A[j+1] = A[j]; // Shift element to the right
      j--;           // Move to the next element in the sorted subarray
    }


    // Place 'v' into its correct position in the sorted subarray
    A[j+1] = v;
  }


  // After the loop finishes, the entire array A is sorted.
  // Print the final sorted array.
  console.log( A .join(' ') );
}


// Read the entire input from standard input using Node.js 'fs' module
// and then invoke the main function with the read content.
main( require('fs') .readFileSync('/dev/stdin', 'utf8') );