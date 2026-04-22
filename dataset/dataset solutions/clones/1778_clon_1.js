"use strict";

// This is the main function that processes the input argument.
const  main  =  ( arg )  =>  {

  // Trim leading/trailing whitespace and split the input string by newlines.
  arg  =  arg.trim().split( "\n" );

  // Parse the first number from the first line of input to get N.
  const  N  =  parseInt( arg[0].split( " " )[0] );

  // Process the second line: split by space, map to integers, and sort in ascending order.
  let  A  =  arg[1].split( " " ).map( (n) =>  parseInt(n) ).sort( (a,b) =>  a-b );

  /*
   * Initialize an index variable for iterating through the array A.
   * This index will be advanced based on conditions within the loop.
   */
  let  i  =  0;

  // Begin the primary loop. It continues as long as the index 'i' is less than N.
  while ( i  <  N )  {

    // Check if the current element A[i] has already been marked as processed (-1).
    if  ( A[i]  ===  -1 )  {

      // If it's -1, simply move to the next element.
      i++;
      continue;

    }

    // Flag to indicate if a duplicate of A[i] was found.
    let  flg  =  false;

    // Flag to indicate if 'next' has been set to a valid index.
    let  setted  =  false;

    // Variable to store the index of the next element to process if A[i] is not removed.
    let  next;

    // Iterate through the remaining elements of the array, starting from i + 1.
    for  ( let  j  =  i + 1;  j  <  N;  j++ )  {

      // Skip elements that have already been marked as processed.
      if  ( A[j]  ===  -1 )  {
        continue;
      }

      // Check for a direct duplicate of A[i].
      if  ( A[j]  ===  A[i] )  {

        flg  =  true;

      }

      // Check if A[j] is a multiple of A[i].
      if  ( A[j]  %  A[i]  ===  0 )  {

        // If it is, mark A[j] as processed.
        A[j]  =  -1;

      }  else  if  ( !setted )  { // If not a multiple and 'next' hasn't been set yet.

        // Set 'next' to the current index 'j' and mark 'setted' as true.
        next  =  j;
        setted  =  true;

      }

    } // End of inner 'for' loop.

    // If a duplicate of A[i] was found, mark A[i] itself as processed.
    if  ( flg )  {
      A[i]  =  -1;
    }

    // Determine the next index to process in the outer loop.
    if  ( next )  {

      // If 'next' was set, jump directly to that index.
      i  =  next;

    }  else  {

      // Otherwise, simply increment 'i' to move to the next element sequentially.
      i++;

    }

  } // End of outer 'while' loop.

  // Filter out all the -1 elements and print the count of the remaining elements.
  console.log( A.filter( (n) =>  n  !==  -1 ).length );

}; // End of main function definition.

// Read input from standard input, decode as UTF-8, and pass it to the main function.
main ( require( 'fs' ).readFileSync( '/dev/stdin',  'utf8' ) );