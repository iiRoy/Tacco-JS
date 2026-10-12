'use strict';

// This is the main execution block of the program.
// It processes input data to calculate geometric properties.
ExecuteProgram((rawData) => {
    // Parse the input string into three numeric values: sideA, sideB, and angleCDegrees.
    const [sideA, sideB, angleCDegrees] = rawData.split(' ').map(numStr => parseInt(numStr, 10));

    // Convert the angle from degrees to radians for trigonometric functions.
    const angleC = angleCDegrees * Math.PI / 180.0;

    // Calculate the perimeter (L) of the triangle using the law of cosines for the third side.
    const perimeter = sideA + sideB + Math.sqrt(sideA * sideA + sideB * sideB - 2 * sideA * sideB * Math.cos(angleC));

    // Calculate the area (S) of the triangle using the formula 0.5 * a * b * sin(C).
    const area = 0.5 * sideA * sideB * Math.sin(angleC);

    // Calculate the height (h) of the triangle relative to side 'a' as the base.
    const height = sideB * Math.sin(angleC);

    // Output the calculated area, perimeter, and height to the console.
    console.log(area, perimeter, height);
});

/**
 * Sets up standard input to read data and then calls the provided entryPoint function.
 * @param {function(string): void} entryPoint The function to call with the collected input string.
 */
function ExecuteProgram(entryPoint) {
  let receivedData = ''; // Accumulator for incoming data chunks.
  const inputStream = process.stdin; // Reference to the standard input stream.

  inputStream.resume(); // Start reading from stdin.
  inputStream.setEncoding('utf8'); // Set the encoding for the input stream.

  // Event listener for 'data' chunks. Appends each chunk to receivedData.
  inputStream.on('data', dataChunk => receivedData += dataChunk);

  // Event listener for 'end' of input. Calls the entryPoint with the full collected data.
  inputStream.on('end', () => entryPoint(receivedData));
}
