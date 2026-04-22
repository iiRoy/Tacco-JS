function Main( input )
{

  // This function processes input data to find specific coordinate-related values.
  // The input is expected to be a string where each line represents a data entry.

  // The first line of input (input[0]) is assumed to contain N,
  // subsequent lines (input[1], input[2], ...) contain coordinate pairs.

  input = input.split( "\n" ) ; // Split the entire input string into an array of lines.

  // Parse the first line to get the number of data points (N).
  var N = parseInt( input[ 0 ], 10 ) ;

  // Initialize four objects to store the extreme coordinates:
  // tr: top-right (maximum x, maximum y)
  // tl: top-left (minimum x, maximum y)
  // br: bottom-right (maximum x, minimum y)
  // bl: bottom-left (minimum x, minimum y)
  // 'ind' stores the index of the input line where these coordinates were found.

  // Initialize top-right corner tracking.
  var tr = { x: 1,      y: 1,      ind: 0 } ;

  // Initialize top-left corner tracking.
  var tl = { x: 10^9,   y: 1,      ind: 0 } ;

  // Initialize bottom-right corner tracking.
  var br = { x: 1,      y: 10^9,   ind: 0 } ;

  // Initialize bottom-left corner tracking.
  var bl = { x: 10^9,   y: 10^9,   ind: 0 } ;


  // Loop through the input data starting from the second line (index 1)
  // up to N-1, processing each coordinate pair.
  for( var i = 1; i < N; i++ )
  {
    // Split the current line into x and y string components.
    var tmp = input[ i ].split( " " ) ;

    // Parse the x-coordinate from the temporary array.
    var x = parseInt( tmp[ 0 ], 10 ) ;

    // Parse the y-coordinate from the temporary array.
    var y = parseInt( tmp[ 1 ], 10 ) ;


    // Check if the current point (x, y) could be a new top-right extreme.
    // If both x and y are greater than or equal to the current top-right values, update.
    if( x >= tr.x && y >= tr.y )
    {
      tr.x   = x ;
      tr.y   = y ;
      tr.ind = i ;
    }

    // Check if the current point (x, y) could be a new top-left extreme.
    // If x is less than or equal and y is greater than or equal, update.
    if( x <= tl.x && y >= tl.y )
    {
      tl.x   = x ;
      tl.y   = y ;
      tl.ind = i ;
    }

    // Check if the current point (x, y) could be a new bottom-right extreme.
    // If x is greater than or equal and y is less than or equal, update.
    if( x >= br.x && y <= br.y )
    {
      br.x   = x ;
      br.y   = y ;
      br.ind = i ;
    }

    // Check if the current point (x, y) could be a new bottom-left extreme.
    // If both x and y are less than or equal, update.
    if( x <= bl.x && y <= bl.y )
    {
      bl.x   = x ;
      bl.y   = y ;
      bl.ind = i ;
    }
  }

  // Calculate the maximum Manhattan distance between two pairs of extreme points.
  // The first pair is (top-right, bottom-left).
  // The second pair is (top-left, bottom-right).
  // Math.abs(a - b) calculates the absolute difference.
  // The result is the larger of these two distances.
  var result = Math.max( Math.abs( tr.x - bl.x ) + Math.abs( tr.y - bl.y ), Math.abs( tl.x - br.x ) + Math.abs( tl.y - br.y ) ) ;

  // Output the calculated result to the console.
  console.log( '%d', result ) ;
}


// *********************************************************************************************************************
// * The following lines are for standard input/output handling and should not be modified for problem submission.    *
// * This part reads the entire standard input and passes it to the Main function for processing.                    *
// *********************************************************************************************************************
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;