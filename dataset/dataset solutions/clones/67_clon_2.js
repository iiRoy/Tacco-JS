let mathStringPart='+ = + splitValues[ 0 ] * Math . '; /* String fragment for trigonometric calculation */
let angleStringPart='( totalAngleDegrees * Math . PI / 180 )'; /* String fragment for angle conversion to radians */

let currentXCoord =0.0; /* Stores the horizontal position */
let currentYCoord =0.0; /* Stores the vertical position */
let totalAngleDegrees =0.0; /* Accumulates the total angle in degrees */

// Begin processing input data from standard input
require("fs")
  .readFileSync(
    "/dev/stdin", // Path to the standard input stream
    "utf8"       /* Specify UTF-8 encoding for text data */
  )
  .trim()          /* Remove any leading or trailing whitespace */
  .split('\n')     /* Divide the input string into an array of lines */
  .some(function(lineContent) { // Iterate over each individual line of input
    /* Split the current line by a comma to get individual values */
    let splitValues = lineContent.split(',');

    /*
     * Dynamically construct and execute a JavaScript string.
     * This updates currentXCoord and currentYCoord based on
     * the first value from splitValues, current totalAngleDegrees,
     * and trigonometric functions (sine for X, cosine for Y).
     */
    eval(
        'currentXCoord' + mathStringPart + 'sin' + angleStringPart +
        ',currentYCoord' + mathStringPart + 'cos' + angleStringPart
    );

    /*
     * Add the second value from splitValues to the totalAngleDegrees.
     * The unary plus operator converts the string to a number.
     */
    totalAngleDegrees += +splitValues[1];

    return false; /* Ensures the 'some' method iterates through all lines */
  });

/* Output the final horizontal coordinate, truncated to an integer */
console.log(Math.floor(currentXCoord));

/* Output the final vertical coordinate, truncated to an integer */
console.log(Math.floor(currentYCoord));