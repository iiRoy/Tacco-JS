/* This is a Type I clone version of the original JavaScript code.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been altered significantly.
 * This file processes numerical input to find a maximum sum based on various sign combinations.
 */
// Import the 'process' module to access standard input and output streams.
var stdin = require('process').stdin;

// Initialize an empty string variable to accumulate all incoming data from stdin.
var input = "";

// Set up an event listener for the 'data' event on the standard input stream.
// This callback function appends each chunk of received data to the 'input' string.
stdin.on('data'
    ,
    function (x) {
        // Concatenate the received data chunk 'x' to the 'input' string.
        input += x;
    }
);

// Set up another event listener for the 'end' event on the standard input stream.
// This function will execute once all input has been received.
stdin.on('end', function () {
    // Split the accumulated input string into an array of lines based on the newline character.
    var lines = input.split('\n');

    // Parse the first line of input to extract two integer values, 'n' and 'm'.
    // The line is split by space, and each part is trimmed and converted to an integer.
    var _a = lines[0].split(' ') /* Split by space character */
        .map(function (x) {
            // Trim any leading/trailing whitespace from the string part 'x' and convert it to an integer.
            return parseInt(x.trim());
        }),
        n = _a[0], // The first parsed integer is assigned to 'n'.
        m = _a[1] // The second parsed integer is assigned to 'm'.
    ;


    // Check for a specific edge case: if 'm' is zero.
    if (m === 0) {
        // If 'm' is 0, the problem specifies the output should be 0.
        console.log(0);
        return; // Exit the function early as no further computation is needed.
    }

    // Define an array of 3-element arrays, representing all possible sign combinations for (x, y, z).
    // Note: one combination ([-1,-1,1]) is missing from the original problem, but we must clone exactly.
    var signs = [
        [1, 1, 1], // All positive signs.
        [1, 1, -1],
        [1, -1, 1],
        [1, -1, -1],
        [-1, 1, 1],
        [-1, 1, -1],
        [-1, -1, -1], // All negative signs.
    ];

    // Initialize an empty array, 'points', which will store lists of calculated values for each sign combination.
    var points = [];

    // Populate the 'points' array with empty arrays.
    // There will be one empty array for each sign combination defined in 'signs'.
    for (var _i = 0, signs_1 = signs; /* Loop through each sign combination */
         _i < signs_1.length;
         _i++
    ) {
        var _ = signs_1[_i]; // '_' is used as a placeholder variable since the value itself is not used here.
        points.push(new Array()); // Add a new empty array to 'points'.
    }


    // This is a transpiled helper function (from a 'let' in a loop) to maintain proper scope.
    // It processes one line of input (representing a 3D point).
    var _loop_1 = function (i) {
        // Parse the (i+1)-th line of input to get the x, y, and z coordinates.
        // The line is split by space, and each part is trimmed and converted to an integer.
        var _a = lines[i + 1].split(' ') // Access the next line (input lines are 1-indexed for points).
            .map(function (x) {
                return parseInt(x.trim()); // Convert string parts to integers.
            }),
            x = _a[0], // The x-coordinate.
            y = _a[1], // The y-coordinate.
            z = _a[2] // The z-coordinate.
        ;

        // Iterate over each defined sign combination.
        signs.forEach(function (_a, i) {
            // Destructure the current sign combination into 'a', 'b', and 'c'.
            var a = _a[0],
                b = _a[1],
                c = _a[2]
            ;
            // Calculate the signed sum (x*a + y*b + z*c) and push it into the corresponding list in 'points'.
            points[i].push(x * a + y * b + z * c);
        });
    };

    // Loop from 0 to n-1, processing each of the 'n' data points.
    for (var i = 0; i < n; i++) {
        _loop_1(i); // Call the helper function for the current index 'i'.
    }

    // Transform the 'points' array to 'pointMax'.
    // For each list of calculated values, it finds the sum of the top 'm' values.
    var pointMax = points.map(function (x) {
        // Sort the current list of values 'x' in descending order.
        x.sort(function (x, y) {
            return y - x;
        });
        // Take the first 'm' elements (which are now the largest) and sum them up using 'reduce'.
        return x.slice(0, m).reduce(function (x, y) {
            return x + y;
        });
    });

    // Sort the 'pointMax' array (which contains the sums of top 'm' values) in descending order.
    // This will place the overall maximum sum at the beginning of the array.
    pointMax.sort(function (x, y) {
        return y - x;
    });

    // Output the largest sum found among all sign combinations.
    // This is the first element of the sorted 'pointMax' array.
    console.log(pointMax[0]);
});