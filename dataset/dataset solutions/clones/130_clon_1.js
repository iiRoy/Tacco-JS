var    input    =    require('fs').readFileSync('/dev/stdin',    'utf8') ; /* This line reads the entire content of '/dev/stdin'
                                                                                      as a UTF-8 string and assigns it to the 'input' variable. */

var lines = input . trim() . split('\n') ; // The input string is trimmed of leading/trailing whitespace and then split into an array of lines.


var line; /* This variable will temporarily hold each line as we process it. */
var rectangles = 0 ; // Counter for geometric shapes identified as rectangles (specifically, right-angled triangles based on Pythagorean theorem).
var lozenges = 0 ; // Counter for shapes identified as lozenges (specifically, triangles with two equal sides, implying rhombus/square if it were a quadrilateral).

// Begin a loop to process each line from the 'lines' array.
// The 'shift()' method removes the first element from the array and returns it,
// which is then assigned to 'line'. The loop continues as long as 'line' is not undefined (i.e., there are lines left).
while (   line   =   lines.shift()   )
{
	// Each line is expected to contain three comma-separated numbers representing side lengths.
	// These are split, and then mapped to convert string representations into actual numbers.
	var    l    =    line . split(',') . map(   function(n)   {   return   +n;   }   )   ;

	// Assign the three numeric values from the processed line to distinct variables.
	var    a    =    l[0]   ;
	var    b    =    l[1]   ;
	var    c    =    l[2]   ;

	/*
	 * Check if the triangle formed by sides a, b, and c is a right-angled triangle.
	 * This is determined by the Pythagorean theorem: a^2 + b^2 = c^2.
	 * If true, increment the 'rectangles' counter.
	 */
	if    (    a * a   +   b * b    ==    c * c    )
		rectangles++   ; // Increment the count for rectangles.
	else    if    (    a    ==    b    )    // If not a rectangle, check if two sides are equal.
		// This condition identifies a triangle with two equal sides.
		// In a quadrilateral context, this might imply a rhombus or square, hence "lozenges".
		lozenges++   ; // Increment the count for lozenges.
}

// After processing all lines, print the final count of rectangles.
console.log(rectangles) ;
// Then, print the final count of lozenges.
console.log(lozenges) ;