/*
 * This JavaScript module processes input data to calculate a specific value.
 * It appears to be solving a problem related to array manipulation and pattern detection
 * based on a sequence of numbers.
 */
function Main(  input  )
{
  // Split the raw input string into an array of lines.
  input = input.split( "\n" );

  // Parse the first line to get the integer N, which usually represents the size of an array.
  var N = parseInt( input[0] );


  // Initialize array A with N elements. This array will store the main sequence of numbers.
  A = new Array( N );

  // Split the second line of input into a temporary string array 'tmp'.
  // These are the string representations of the numbers for array A.
  tmp = input[1].split( " " );

  /*
   * Populate array A with integer values parsed from 'tmp'.
   * This loop iterates N times, converting each string element from 'tmp' to an integer
   * and storing it in the corresponding position in array A.
   */
  for ( i = 0 ; i < N ; i++ )
  {
    A[i] = parseInt( tmp[i] );
  }

  // Initialize 'ans' with 1. Note that this variable will be re-declared and overwritten later,
  // making this initialization effectively dead code.
  var ans = 1;


  // Initialize a flag variable for state tracking within the main loop.
  var flag = 0;

  // Re-declare and initialize 'ans' to 0. This declaration shadows the previous one.
  var ans = 0;

  // The original initialization for 'c' was commented out.
  // var c = 0;

  // Initialize counter 'c' to 1. This is the active initialization for the counter.
  var c = 1;


  // Initialize array B. Its size is determined by the first element of A (A[0]),
  // and all its elements are initially set to 1.
  B = new Array( A[0] ).fill( 1 );


  // Main processing loop. It iterates from the second element of A (index 1)
  // up to the last element (N-1), comparing adjacent elements.
  for ( i = 1 ; i < N ; i++ )
  {
    // Condition 1: If the current element A[i] is less than the previous element A[i-1].
    if ( A[i] < A[i-1] )
    {
      // Trim array B to the size of A[i]. This effectively removes elements from the end.
      B = B.slice( 0, A[i] );
    }


    // Condition 2: If the 'flag' is currently set to 2.
    if ( flag == 2 )
    {
      // Loop through all elements of array B.
      for ( j = 0 ; j < B.length ; j++ )
      {
        // Original commented out line: c = Math.max(c, B[j]);
        if ( B[j] != B[0] )
        {
          // If any element in B is different from the first element,
          // set 'flag' to 1 and immediately break out of this inner loop.
          flag = 1;
          break;
        }
        else
        {
          // Otherwise (if B[j] is equal to B[0]), set 'flag' to 0.
          // If all elements are the same, 'flag' will remain 0 after this loop completes.
          flag = 0;
        }
      }
    }


    // Condition 3: If the current element A[i] is greater than the previous element A[i-1].
    if ( A[i] > A[i-1] )
    {
      // Extend array B by pushing '1's. The number of '1's pushed is the difference A[i] - A[i-1].
      for ( j = 0 ; j < A[i] - A[i-1] ; j++ )
      {
        B.push( 1 );
        flag = 2; // Set 'flag' to 2 after extending B.
      }

    }
    // Condition 4: If A[i] is NOT greater than A[i-1] (i.e., A[i] <= A[i-1]) AND 'flag' is 0.
    else if ( flag == 0 )
    {
      // Increment a specific element in array B. The index is A[i] - 1.
      B[ A[i] - 1 ] = B[ A[i] - 1 ] + 1;
      // Trim array B again based on A[i].
      B = B.slice( 0, A[i] );
      // If B has more than one element after trimming, update 'flag' to 1 and increment counter 'c'.
      if ( B.length != 1 )
      {
        flag = 1;
        c++;
      }
    }
    // Condition 5: If A[i] is NOT greater than A[i-1] (i.e., A[i] <= A[i-1]) AND 'flag' is 1.
    else if ( flag == 1 )
    {
      // Trim array B to the size of A[i].
      B = B.slice( 0, A[i] );
      // Loop backwards through array B, starting from index A[i] - 1.
      for ( j = A[i] - 1 ; j >= 0 ; j-- )
      {
        if ( B[j] == c )
        {
          // If the element B[j] matches the counter 'c', reset it to 1.
          B[j] = 1;
        }
        else if ( B[j] != c )
        {
          // If B[j] does not match 'c', increment it by 1,
          // set 'flag' to 2, and then break out of this inner loop.
          B[j] = B[j] + 1;
          flag = 2;
          break;
        }
      }
    }
  } // End of main processing loop.

  // Final assignment of the value of 'c' to 'ans'.
  var ans = c;
  // Output the final calculated answer to the console.
  console.log( '%s', ans );
}


/*
 * This is a debugging utility function.
 * It is typically intended to be executed when a "Run" button is pressed
 * in a web-based coding environment or similar interactive debugger.
 * It retrieves input from a specified DOM element and passes it to the Main function.
 */
function debug( )
{
  // Get the input value from the HTML element with the id "input".
  var input = document.getElementById( "input" ).value;
  // Call the main processing function with the retrieved input.
  Main( input );
}

// This line serves as the entry point for execution in a Node.js environment.
// It reads input from standard input (/dev/stdin) using the 'fs' module,
// decodes it as UTF-8, and then passes it to the Main function for processing.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );