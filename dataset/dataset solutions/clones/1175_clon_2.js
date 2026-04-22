'use strict'; // This directive ensures that the code runs in strict mode.

// Kick off the primary computation process by supplying a callback function.
ProcessInputData(
    (rawInputStr) => {
        // Deconstruct the input string, parsing each segment as an integer.
        const [sideA_len, sideB_len, angleCDegrees] = rawInputStr
            .split(' ') // Divide the string by spaces.
            .map( (numericString) => {
                 // Convert the string representation of a number to an actual integer (base 10).
                 return parseInt(numericString, 10);
            });

        // Convert the provided angle from degrees into radians, required for JavaScript's Math functions.
        const angleC_rad = angleCDegrees * Math.PI / 180.0;

        // Calculate the total length of the triangle's boundary (perimeter) using the law of cosines.
        const trianglePerimeter = sideA_len + sideB_len + Math.sqrt(
            sideA_len * sideA_len + sideB_len * sideB_len - 2 * sideA_len * sideB_len * Math.cos(angleC_rad)
        );

        // Compute the surface area of the triangle using the formula (1/2) * a * b * sin(C).
        const triangleArea = (1 / 2) * sideA_len * sideB_len * Math.sin(angleC_rad);

        // Determine the altitude (height) of the triangle with respect to side A.
        const altitudeH = sideB_len * Math.sin(angleC_rad);

        // Display the calculated area, perimeter, and height to the standard output.
        console.log(triangleArea, trianglePerimeter, altitudeH);
    }
);


/**
 * Core utility function to manage standard input stream and invoke a handler.
 * @param {Function} computationExecutor - The function that will process the complete input data.
 */
function ProcessInputData(computationExecutor) {
    let receivedInputBuffer = ''; // An empty string to accumulate all incoming data.
    const stdInputSource = process.stdin; // Access the standard input stream object.

    stdInputSource.resume(); // Begin listening for input data.
    stdInputSource.setEncoding('utf8'); // Ensure input is processed as UTF-8 text.

    // Register an event listener for 'data' chunks.
    stdInputSource.on(
        'data',
        (inputPiece) => {
            receivedInputBuffer += inputPiece; // Append each piece of data to the buffer.
        }
    );

    // Register an event listener for when the input stream concludes.
    stdInputSource.on(
        'end',
        () => {
            computationExecutor(receivedInputBuffer); // Execute the provided callback with the full input.
        }
    );
}