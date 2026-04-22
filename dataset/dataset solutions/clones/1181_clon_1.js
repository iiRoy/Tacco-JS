/*
 * This JavaScript code is designed to read numerical input from standard input (stdin),
 * process it to calculate various distance metrics between two vectors,
 * and then output these calculated distances to the console.
 *
 * It specifically computes:
 * 1. The Manhattan Distance (L1 norm).
 * 2. The Euclidean Distance (L2 norm).
 * 3. The Minkowski Distance with p=3 (L3 norm).
 * 4. The Chebyshev Distance (L-infinity norm).
 *
 * Input format expected:
 * Line 1: An integer 'n' representing the dimension of the vectors.
 * Line 2: 'n' space-separated numbers representing vector X.
 * Line 3: 'n' space-separated numbers representing vector Y.
 */


    // Declare a variable to store all incoming data from stdin.
    var   input   =    ''    ;


// Obtain a reference to the standard input stream object.
var   readable   =    process.stdin    ;


/*
 *  The 'resume()' method ensures that the readable stream
 *  starts emitting 'data' events. Without this, the stream
 *  might remain paused.
 */
readable.resume ( )    ;


// Configure the character encoding for the incoming data stream.
readable.setEncoding (    'utf-8'    )    ;


/*
 *  Attach an event listener for the 'data' event.
 *  This function is called every time a chunk of data is available
 *  from the input stream.
 *  The 'chunk' parameter contains the piece of data received.
 */
readable.on (    'data'    ,    function (   chunk   )    {

        // Append the received data chunk to our 'input' string.
        // This accumulates all input until the 'end' event.
        input    +=    chunk    ;

} )    ;


/*
 *  Attach an event listener for the 'end' event.
 *  This function executes once the entire input stream has been
 *  received and no more data is expected.
 *  All calculations and output logic are encapsulated here.
 */
readable.on (    'end'    ,    function ( )    {


        // Split the accumulated input string by newline characters
        // to separate the lines of input into an array.
        var    data    =    input.split (    '\n'    )    ;


        /*
         *  The first element of the 'data' array (index 0)
         *  is expected to be the integer 'n', representing
         *  the number of elements in the vectors.
         *  'parseInt()' converts the string to an integer.
         */
        var    n    =    parseInt (    data [ 0 ]    )    ;


        // The second line (data[1]) contains space-separated numbers for vector X.
        // 'split(' ')' creates an array of strings.
        // 'map(Number)' converts each string element to a numeric type.
        var    x    =    data [ 1 ].split (    ' '    ).map (    Number    )    ;


        // Similarly, the third line (data[2]) contains space-separated numbers for vector Y.
        var    y    =    data [ 2 ].split (    ' '    ).map (    Number    )    ;


        // Initialize a variable for the Manhattan distance (L1 norm).
        var    Dxy    =    0    ;


        // Initialize a variable to accumulate squared differences for Euclidean distance (L2 norm).
        var    Dxy2    =    0    ;


        // Initialize a variable to accumulate cubed differences for Minkowski p=3 distance (L3 norm).
        var    Dxy3    =    0    ;


        // Initialize a variable for the Chebyshev distance (L-infinity norm).
        // This will store the maximum absolute difference.
        var    Dmax    =    0    ;


        // Declare an array to store the absolute differences between corresponding elements of x and y.
        var    txy    =    [ ]    ;


        /*
         *  Iterate through the vectors from index 0 up to (but not including) 'n'.
         *  In each iteration, calculate the absolute difference, and update
         *  the various distance accumulators.
         */
        for    (    var    i    =    0    ;    i    <    n    ;    i    ++    )    {

            // Calculate the absolute difference between x[i] and y[i]
            // and push it into the 'txy' array.
            txy.push (    Math.abs (    x [ i ]    -    y [ i ]    )    )    ;

            // Add the current absolute difference to Dxy (Manhattan distance).
            Dxy    +=    txy [ i ]    ;

            // Add the square of the current absolute difference to Dxy2 (for Euclidean distance).
            Dxy2    +=    Math.pow (    txy [ i ]    ,    2    )    ;

            // Add the cube of the current absolute difference to Dxy3 (for Minkowski p=3 distance).
            Dxy3    +=    Math.pow (    txy [ i ]    ,    3    )    ;

            // Update Dmax if the current absolute difference is greater than the current Dmax.
            Dmax    =    Math.max (    Dmax    ,    txy [ i ]    )    ;

        }


    // Output the calculated Manhattan Distance (p=1) to the console.
    console.log (    Dxy    )    ;


    // Output the calculated Euclidean Distance (p=2) by taking the square root of Dxy2.
    console.log (    Math.sqrt (    Dxy2    )    )    ;


    // Output the calculated Minkowski Distance (p=3) by taking the cube root of Dxy3.
    // Note: Math.pow(value, 1/3) calculates the cube root.
    console.log (    Math.pow (    Dxy3    ,    1    /    3    )    )    ;


    // Output the calculated Chebyshev Distance (p=infinity) to the console.
    console.log (    Dmax    )    ;

} )    ;