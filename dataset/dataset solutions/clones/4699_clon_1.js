process.stdin.resume();
process.stdin.setEncoding( 'utf8' );

/*
 * This function, 'Main', is designed to process
 * the entire input data, which is provided as a single string.
 */
function Main( input )
{

  // The input string is first split into an array of strings,
  // where each element represents a line from the input.
  var tmp = input.split( "\n" ) ;


  // The first line (index 0) is further split by spaces
  // to extract individual values from it.
  var line0 = tmp[0].split( " " ) ;

  // The following lines are commented out in the original source,
  // indicating they are not actively used in this particular version
  // of the program. They are kept commented to preserve Type I cloning.
  // var line1 = tmp[1].split( " " ) ;
  // var line2 = tmp[2].split( " " ) ;
  // var line3 = tmp[3].split( " " ) ;


  // Extracting and converting the first two numbers from line0.
  // N is the first number, M is the second.
  var N = Number( line0[0] ) ; // Often represents 'S' or a primary count
  var M = Number( line0[1] ) ; // Often represents 'c' or a secondary count


  // These variables are also commented out, similar to line1, line2, line3.
  // var A = Number( line0[1] ) ;
  // var B = Number( line0[2] ) ;


  // A counter variable, initialized to zero.
  // Its current usage within this function is absent.
  var count = 0 ;

  // A commented-out line that would print N and M for debugging purposes.
  // console.log( N + " " + M ) ;


  // Conditional logic: if N is greater than half of M,
  // print the floor of M divided by 2.
  if ( N > M / 2 )
  {
    console.log( Math.floor( M / 2 ) ) ;
  }


  // Modify the value of M by subtracting N multiplied by 2.
  M = M - N * 2 ;


  // Calculate the final result and output it to the console.
  // The calculation involves N and the floor of M divided by 4.
  console.log( N + Math.floor( M / 4 ) ) ;

}

/*
 * DO NOT EDIT BELOW THIS LINE.
 * This section is responsible for reading input from standard input
 * and passing it to the 'Main' function for processing.
 */
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;