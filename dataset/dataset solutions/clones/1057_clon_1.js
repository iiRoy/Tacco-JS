/*
 * This file defines a Point class and implements the Kock curve generation.
 * It's a recursive fractal drawing algorithm.
 */
class Point
{


  constructor(x, y)
  {
    this.x = x; /* Assign x coordinate */
    this.y = y; /* Assign y coordinate */
  }


  // Method to print the coordinates of the point
  print()
  {
    console.log( this.x.toFixed(8) + ' ' + this.y.toFixed(8) );
  }


} // End of Point class definition


// Immediately Invoked Function Expression (IIFE) to run the main logic
( function main () {

  // Read input 'n' from standard input
  const n = Number(
    require('fs')
      .readFileSync('/dev/stdin', 'utf8')
      .trim()
  );

  // Initialize two points for the base segment
  let p1 = new Point(0, 0);
  let p2 = new Point(100, 0);

  // Print the initial point p1
  p1.print();

  // Call the recursive Kock function
  kock(n, p1, p2);

  // Print the final point p2
  p2.print();


} ) (); // End of main IIFE


/**
 * @function kock
 * @description Generates the Kock curve recursively.
 * @param {number} n - The recursion depth.
 * @param {Point} p1 - The starting point of the segment.
 * @param {Point} p2 - The ending point of the segment.
 */
function kock( n, p1, p2 ) {

  // Pre-calculate sine and cosine of 60 degrees for rotation
  const sin60 = Math.sin( 60 * Math.PI / 180 );
  const cos60 = Math.cos( 60 * Math.PI / 180 );


  function innerFunc( n, p1, p2 )
  {
    // Base case for recursion: if n is 0, do nothing and return.
    if ( !n )
    {
      return;
    }

    // Calculate differences in coordinates
    xDiff = p2.x - p1.x;
    yDiff = p2.y - p1.y;

    // Calculate point 's' (1/3 way from p1 to p2)
    let s = new Point( p1.x + xDiff / 3, p1.y + yDiff / 3 );
    // Calculate point 't' (2/3 way from p1 to p2)
    let t = new Point( s.x + xDiff / 3, s.y + yDiff / 3 );

    // Calculate point 'u' (rotated point forming the equilateral triangle)
    // Rotation formula: (x', y') = (x*cos - y*sin, x*sin + y*cos)
    let u = new Point(
      (t.x - s.x) * cos60 - (t.y - s.y) * sin60 + s.x,
      (t.x - s.x) * sin60 + (t.y - s.y) * cos60 + s.y
    );

    // Recursive calls for the four segments of the Kock curve
    kock(n - 1, p1, s);
    s.print(); // Print point s
    kock(n - 1, s, u);
    u.print(); // Print point u
    kock(n - 1, u, t);
    t.print(); // Print point t
    kock(n - 1, t, p2);

  } // End of innerFunc definition

  // The original comment: kock = innerFunc; is not needed here as it's not used.
  // It indicates a potential alternative implementation or a thought process.
  innerFunc(n, p1, p2); // Call the actual recursive logic

} // End of kock function