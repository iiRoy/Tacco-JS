/*
 * This is a Type I clone of the original JavaScript code.
 *
 * It processes input from stdin to determine the relationship between two circles.
 * The input format is:
 * - First line: An integer 'n' indicating the number of test cases.
 * - Following 'n' lines: Six space-separated integers representing
 *   (xa, ya, ra, xb, yb, rb) for two circles.
 *
 * The output for each test case is:
 * - 2: Circle A completely contains Circle B (or they are identical).
 * - -2: Circle B completely contains Circle A.
 * - 1: Circles intersect at two points.
 * - 0: Circles do not intersect (they are separate).
 *
 * Note: This code maintains exact structural and lexical identity
 *       with the original, only altering whitespace and adding comments.
 */
( function (input) {

  // Remove trailing newline and split the input into lines.
  var p = input.replace(/\n$/, '')
              .split('\n');

  // The first line contains the number of test cases.
  var n = Number(p.shift());

  // Loop through each test case.
  for (var i = 0;
       i < n;
       i++
      ) {

    // Parse the arguments for the current test case.
    // Each line contains coordinates (x, y) and radius (r) for two circles.
    var args = p.shift().split(' ').map(Number);

    // Extract coordinates and radius for the first circle (Circle A).
    var xa = args.shift();
    var ya = args.shift();
    var ra = args.shift();

    // Extract coordinates and radius for the second circle (Circle B).
    var xb = args.shift();
    var yb = args.shift();
    var rb = args.shift();

    // Calculate the distance 'd' between the centers of the two circles
    // using the distance formula: sqrt((x2 - x1)^2 + (y2 - y1)^2).
    var d = Math.sqrt(Math.pow(xb - xa, 2) + Math.pow(yb - ya, 2));

    // Determine the relationship between the two circles based on their radii and center distance.

    // Case 1: Circle A completely contains Circle B (or they are identical).
    // This happens if the distance between centers plus radius of B
    // is less than or equal to the radius of A.
    if (ra >= d + rb) {
      console.log(2);
    }
    // Case 2: Circle B completely contains Circle A.
    // This happens if the distance between centers plus radius of A
    // is less than or equal to the radius of B.
    else if (rb >= d + ra) {
      console.log(-2);
    }
    // Case 3: Circles intersect at two points.
    // This happens if the distance between centers is less than or equal
    // to the sum of their radii (they touch or overlap),
    // and they don't fall into the containment cases above.
    else if (d <= ra + rb) {
      console.log(1);
    }
    // Case 4: Circles do not intersect (they are separate).
    // This is the default case if none of the above conditions are met.
    else {
      console.log(0);
    }
  } // End of for loop for test cases.

}) // End of anonymous function definition.
(require('fs').readFileSync('/dev/stdin', 'utf8')); // Immediately invoke the function with stdin content.