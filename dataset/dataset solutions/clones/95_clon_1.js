/*
 * This JavaScript code calculates the positional relationship
 * between two circles given their coordinates and radii.
 *
 * It processes multiple test cases, reading input from stdin
 * and printing the result for each case to stdout.
 */

//  The 'fs' module is required for file system operations,
//  specifically to read the input from '/dev/stdin'.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');


//  The input string is first cleaned by removing any trailing newline character,
//  and then split into an array of strings, where each string represents a line of input.
var p = input.replace(/\n$/, '').split('\n');


//  The very first line of the input array 'p' contains the total
//  number of test cases to be processed. This value is extracted
//  and converted to a number. The 'shift()' method removes this
//  element from the 'p' array.
var n = Number(p.shift());


//  A loop iterates 'n' times, once for each test case.
for (var i = 0; i < n; i++)
{

    //  For each iteration, the next line from the 'p' array is taken.
    //  This line contains space-separated numerical arguments.
    //  It is split by spaces, and each resulting string is converted to a Number.
    //  The 'shift()' method is used again to get the next line and remove it.
    var args = p.shift().split(' ').map(Number);


    //  The arguments array 'args' contains the parameters for the two circles.
    //  The first three elements define the first circle (xa, ya, ra).
    var xa = args.shift();
    var ya = args.shift();
    var ra = args.shift();


    //  The next three elements define the second circle (xb, yb, rb).
    var xb = args.shift();
    var yb = args.shift();
    var rb = args.shift();


    //  Calculate the Euclidean distance 'd' between the centers of the two circles.
    //  This uses the distance formula: sqrt((x2-x1)^2 + (y2-y1)^2).
    var d = Math.sqrt(Math.pow(xb - xa, 2) + Math.pow(yb - ya, 2));


    //  Now, we determine the relationship between the two circles based on 'd', 'ra', and 'rb'.

    //  Case 1: The circles might intersect, touch, or one might be contained within the other.
    if (d <= ra + rb)
    {

        //  Sub-case 1.1: Circle A is completely inside Circle B and they do not touch.
        //  This happens if the distance 'd' is less than the absolute difference of their radii.
        //  Specifically, if d < |rb - ra|, and rb > ra.
        if (d < rb - ra)
        {
            console.log(-2); // Output -2 for this specific containment.
        }
        //  Sub-case 1.2: Circle B is completely inside Circle A and they do not touch.
        //  This happens if d < |ra - rb|, and ra > rb.
        else if (d < ra - rb)
        {
            console.log(2);  // Output 2 for this specific containment.
        }
        //  Sub-case 1.3: Circles intersect at two points, or touch at exactly one point (internally or externally).
        else
        {
            console.log(1);  // Output 1 for intersection or touching.
        }
    }
    //  Case 2: The circles are completely separate and do not intersect or touch.
    else
    {
        console.log(0);      // Output 0 for no interaction.
    }

}

//  End of the program.
//  All test cases have been processed.