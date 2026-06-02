const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data
let lineBuffer = (rawData.trim()).split("\n");

// Main processing loop
while (true) {
    // Read the number of test cases for this block
    const count = parseInt(lineBuffer.shift(), 10);

    // If the count is zero, terminate the program
    if (count === 0) {
        break;
    }

    // Iterate through each test case in the current block
    for (let idx = 0; idx < count; idx++) {
        // Parse the current line into an array of numbers
        const coords = lineBuffer.shift().split(" ").map(Number);

        // Extract the first quaternion components
        const valX1 = coords[0];
        const valY1 = coords[1];
        const valZ1 = coords[2];
        const valW1 = coords[3];

        // Extract the second quaternion components
        const valX2 = coords[4];
        const valY2 = coords[5];
        const valZ2 = coords[6];
        const valW2 = coords[7];

        // Perform quaternion multiplication (Hamilton product)
        // Initialize components of the resulting quaternion
        let resultA = valX1 * valX2;
        let resultI = valX1 * valY2;
        let resultJ = valX1 * valZ2;
        let resultK = valX1 * valW2;

        // Add/subtract terms from the second component (y1)
        resultI += valY1 * valX2;
        resultA -= valY1 * valY2;
        resultK += valY1 * valZ2;
        resultJ -= valY1 * valW2;

        // Add/subtract terms from the third component (z1)
        resultJ += valZ1 * valX2;
        resultK -= valZ1 * valY2;
        resultA -= valZ1 * valZ2;
        resultI += valZ1 * valW2;

        // Add/subtract terms from the fourth component (w1)
        resultK += valW1 * valX2;
        resultJ += valW1 * valY2;
        resultI -= valW1 * valZ2;
        resultA -= valW1 * valW2;

        // Output the calculated quaternion components
        console.log(resultA + " " + resultI + " " + resultJ + " " + resultK);
    }
}
