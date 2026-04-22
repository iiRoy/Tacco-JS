class Point /* Defines a 2D point with x and y coordinates */
{
  /* Constructor for the Point class */
  constructor(x,y)
  {
    // Assign the x coordinate
    this.x = x;
    // Assign the y coordinate
    this.y = y;
  }
  // Method to print the point's coordinates to the console
  print()
  {
    // Output x and y, formatted to 8 decimal places, separated by a space
    console.log(this.x.toFixed(8) + ' ' + this.y.toFixed(8));
  }
} // End of Point class definition

/*
 * This is the main execution block wrapped in an Immediately Invoked Function Expression (IIFE).
 * It ensures that variables declared here do not pollute the global scope.
 */
( function main ( )
{
  // Read input from stdin, convert it to a number, and store it in 'n'.
  // 'n' typically represents the recursion depth for the Koch snowflake.
  const n = Number( require('fs').readFileSync('/dev/stdin', 'utf8').trim() );

  // Initialize the first point, p1, at the origin (0,0).
  let p1 = new Point( 0 , 0 );
  // Initialize the second point, p2, at (100,0). This defines the base line segment.
  let p2 = new Point( 100 , 0 );

  // Print the initial point p1.
  p1.print();

  // Call the 'kock' function to generate the Koch curve segments.
  // 'n' is the recursion depth, p1 and p2 are the start and end points of the current segment.
  kock(n,p1,p2);

  // Print the final point p2.
  p2.print();
} ) ( ); // The IIFE is invoked immediately here.

/*
 * The 'kock' function is responsible for generating the Koch curve.
 * It's designed to be reassigned internally to 'innerFunc' for recursive calls.
 *
 * Parameters:
 *   n: The current recursion depth.
 *   p1: The starting point of the current line segment.
 *   p2: The ending point of the current line segment.
 */
function kock (n, p1, p2)
{
  // Pre-calculate sine and cosine of 60 degrees (in radians) for rotation.
  // These values are constant for the Koch curve's equilateral triangles.
  const sin60 = Math.sin( 60 * Math.PI / 180 );
  const cos60 = Math.cos( 60 * Math.PI / 180 );

  /*
   * This nested function 'innerFunc' contains the actual recursive logic for the Koch curve.
   * It is defined inside 'kock' to capture 'sin60' and 'cos60' from its outer scope.
   */
  function innerFunc ( n , p1 , p2 )
  {
    // Base case for recursion: if n is 0, stop and return.
    if ( !n )
      return;

    // Calculate the difference in x-coordinates between p2 and p1.
    xDiff = p2.x - p1.x;
    // Calculate the difference in y-coordinates between p2 and p1.
    yDiff = p2.y - p1.y;

    // Calculate point 's': the first third of the segment from p1 to p2.
    let s = new Point( p1.x + xDiff / 3 , p1.y + yDiff / 3 );
    // Calculate point 't': the second third of the segment from p1 to p2.
    let t = new Point( s.x + xDiff / 3 , s.y + yDiff / 3 );

    // Calculate point 'u': the apex of the equilateral triangle formed by s and t.
    // This involves rotating the vector (t - s) by 60 degrees around point s.
    let u = new Point( ( t.x - s.x ) * cos60 - ( t.y - s.y ) * sin60 + s.x ,
                       ( t.x - s.x ) * sin60 + ( t.y - s.y ) * cos60 + s.y );

    // Recursive call for the first segment: from p1 to s.
    kock( n - 1 , p1 , s );
    // Print point s after the first segment is processed.
    s.print();

    // Recursive call for the second segment: from s to u.
    kock( n - 1 , s , u );
    // Print point u after the second segment is processed.
    u.print();

    // Recursive call for the third segment: from u to t.
    kock( n - 1 , u , t );
    // Print point t after the third segment is processed.
    t.print();

    // Recursive call for the fourth segment: from t to p2.
    kock( n - 1 , t , p2 );
  } // End of innerFunc definition

  // Reassign the global 'kock' function reference to 'innerFunc'.
  // This is a common pattern in competitive programming to avoid declaring 'innerFunc' globally
  // and allows 'kock' to call itself (the innerFunc implementation) recursively.
  kock = innerFunc;

  // Initial call to the now reassigned 'kock' (which is 'innerFunc') with the original parameters.
  innerFunc(n,p1,p2);
} // End of kock function definition