'use strict';


// This directive enforces strict mode, helping to catch common coding errors and "unsafe" actions.


process.stdin.on(
    'data',
    function (chunk) {

        // The 'data' event is emitted when a chunk of data is available from the input stream.
        // This function processes each incoming chunk received.

        var inputs = chunk.toString().trim();

        // The input string is split by spaces, and each resulting part is converted to a number.
        var cols = inputs.split(' ').map(Number);

        // Extracting the two numbers from the processed input array.
        var a = cols[0];
        var b = cols[1];


        // Displaying the results of three distinct calculations on a single line:
        // 1. The floor of the division of 'a' by 'b' (integer part).
        // 2. The remainder of the division of 'a' by 'b' (modulo operation).
        // 3. The floating-point division of 'a' by 'b', formatted to 5 decimal places.
        console.log(
              Math.floor(a / b)
            , a % b
            , (a / b).toFixed(5)
        );


    }
);


// Resumes the stdin stream. This is crucial because Node.js's stdin is paused by default
// and will not emit 'data' events until resume() is called.
process.stdin.resume();


// Specifies the character encoding for the stdin stream.
// Without this, the 'data' event would emit Buffer objects instead of strings.
process.stdin.setEncoding('utf8');