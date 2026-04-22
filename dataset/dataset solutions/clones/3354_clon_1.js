function      Main(    input     ) {

  /*
   * Input processing:
   * 1. Split the input string by newline characters.
   * 2. Parse the first line as an integer N.
   * 3. Parse the second line as an array of integers h.
   * 4. Parse the third line as an array of integers a.
   */
  input = input.split( "\n" );

  var N = parseInt( input[0] ); // Number of elements

  var h = input[1].split( " " )
                   .map( i => parseInt( i ) );

  var a = input[2].split( " " )
                   .map( i => parseInt( i ) );


  // Calculate the smallest power of 2 greater than or equal to N
  var x; // This variable will store the exponent
  for( var i=0 ; N / Math.pow( 2 , i ) > 0.5 ; i++ ) {
    x = i; // Assign current 'i' to 'x'
  }

  // 'n' will be the size of the segment tree's leaves
  var n = Math.pow( 2 , x );

  // Initialize the segment tree (dp array)
  // The size is 2*n - 1 for a complete binary tree
  var dp = new Array( Math.pow( 2 , x ) * 2 - 1 )
                   .fill( 0 );


  // Segment tree query function
  function query( a , b , k , l , r ) {
    // [a, b) is the query range
    // k is the current node index
    // [l, r) is the range covered by node k

    if ( r <= a || b <= l ) { // Current segment is outside query range
      return 0; // Return identity for max operation
    }
    else if ( a <= l && r <= b ) { // Current segment is fully within query range
      return dp[ k ]; // Return value at current node
    }
    else { // Current segment partially overlaps with query range
      var vl = query( a , b , k * 2 + 1 , l , ( l + r ) / 2 ); // Query left child
      var vr = query( a , b , k * 2 + 2 , ( l + r ) / 2 , r ); // Query right child
      return Math.max( vl , vr ); // Combine results
    }
  }


  // Segment tree update function
  function update( i , x ) {
    // Update value at index 'i' to 'x'

    i += n - 1; // Convert to leaf node index in dp array
    dp[ i ] = x; // Set the new value

    while ( i > 0 ) {
      i = Math.floor( ( i - 1 ) / 2 ); // Move to parent node
      dp[ i ] = Math.max( dp[ i * 2 + 1 ] , dp[ i * 2 + 2 ] ); // Update parent value
    }
  }


  // The original problem statement might have had this commented out.
  // dp[h[0]] = a[0]; // This line was likely for a specific problem context.

  var ans = 0; // Initialize answer variable

  // Iterate through the input arrays h and a
  for ( var i = 0 ; i < N ; i++ ) {

    var max = 0; // Temporary variable for maximum value

    // Query for the maximum value in the range [0, h[i]-1)
    // This effectively finds the max 'a' value for smaller 'h' values
    max = query( 0 , h[i] - 1 , 0 , 0 , n );

    // Update the segment tree at index h[i]-1 with (max + a[i])
    // This represents the maximum "score" achievable ending at h[i]
    update( h[i] - 1 , max + a[i] );

    // Update the overall maximum answer
    ans = Math.max( ans , max + a[i] );
  }

  console.log( '%s' , ans ); // Output the final answer

  return ans; // Return the result
}


// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
// This function is for local testing in a specific environment.
function debug( n ) {

  var input = document.getElementById( "input" + n ).value;

  var ans = Main( input ); // Call the main logic

  var result = "WA"; // Assume Wrong Answer initially

  // Check if the computed answer matches the expected output
  if ( ans == document.getElementById( "output" + n ).value.split( "\n" )[0] ) {
    result = "AC"; // If it matches, it's Accepted
  }

  // Display the result on the webpage
  document.getElementById( "result" + n ).innerHTML = result;
}


// Main execution block when run in a Node.js-like environment
Main( require( "fs" )
               .readFileSync( "/dev/stdin" , "utf8" ) );