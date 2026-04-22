// This script is designed to read input from standard input.
// It utilizes the Node.js 'fs' module for file system operations.

var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ; // Read the entire content of standard input as a UTF-8 string.

// The following section contains commented-out code.
// It represents a possible solution logic that was previously active or is under development.
// This block processes numerical data, sorts it, and prints the result.

// var   Arr   =   ( input.trim ( ) ) . split ( "\n" ) ; // Trim whitespace and split input by newlines into an array of strings.

// while ( true ) { // Start an infinite loop to process multiple test cases.

//    // Extract the first line of the current test case, split by space, and convert to numbers.
//    var   nm   =   ( Arr.shift ( ) ) . split ( " " ) . map ( Number ) ;

//    // Check for the termination condition (both numbers are zero).
//    if ( nm[0] == 0   &&   nm[1] == 0 )   break ; // Exit the loop if the condition is met.

//    var   arr   =   [ ] ; // Initialize an empty array to store data.

//    // Populate the 'arr' array with initial values based on 'nm[1]'.
//    for ( var   i = 0 ;   i < nm[1] ;   i++ )   arr[i] = [ i + 1 , 0 ] ;

//    // Process 'nm[0]' subsequent lines of input.
//    for ( var   i = 0 ;   i < nm[0] ;   i++ ) {

//       // Read a line, split by space, and convert to numbers.
//       var   v   =   ( Arr.shift ( ) ) . split ( " " ) . map ( Number ) ;

//       // Iterate through the numbers in 'v' and accumulate values into 'arr'.
//       v.forEach ( function ( val , i ) {   arr[i][1] += val ;   } ) ;
//    }

//    // Sort the 'arr' array based on custom criteria.
//    // Primary sort key is the second element (descending).
//    // Secondary sort key is the first element (ascending) if primary keys are equal.
//    arr.sort ( function ( a , b ) {

//       if ( a[1] == b[1] )   return   a[0] - b[0] ; // Sort by first element ascending if second elements are equal.
//       else   return   b[1] - a[1] ; // Sort by second element descending.
//    } ) ;

//    var   ans   =   [ ] ; // Initialize an array to store the final answer.

//    // Extract the first elements (IDs) from the sorted 'arr' and push them to 'ans'.
//    arr.forEach ( function ( val , i ) {   ans.push ( arr[i][0] ) ;   } ) ;

//    // Print the elements of 'ans' joined by spaces.
//    console.log ( ans.join ( " " ) ) ;
// }
// End of the main processing loop.
// This commented-out code block illustrates a common competitive programming pattern.