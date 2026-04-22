const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Utility function to process raw input string into an array of individual lines
const extractInputLines = (fullInputString) => {
    // Trim any leading/trailing whitespace from the entire input
    // Then split the string into an array of lines based on the newline character
    return fullInputString.trim().split('\n');
};

let processedDataLines = extractInputLines(sourceData);

// Helper to retrieve and parse the next integer from the data line buffer
const readNextIntegerFromBuffer = (lineSource) => {
    // Removes the first element from the array and parses it as an integer
    // Using Number() is robust for both integer and float, similar to original's '-0' trick
    return Number(lineSource.shift());
};

// Helper to parse a single line of space-separated numbers into a numerical array
const parseNumbersInLine = (textLine) => {
    // Splits the line by spaces and converts each part to a number
    return textLine.split(' ').map(Number);
};

// Main loop for processing multiple data sets, each containing several quaternion operations
while (true) {
    // Read the number of quaternion pairs expected in the current data set
    let currentDataSetSize = readNextIntegerFromBuffer(processedDataLines);

    // If the read value is 0, it signifies the end of all input data
    if (currentDataSetSize === 0) {
        break; // Exit the processing loop
    }

    // Iterate through each quaternion pair within the current data set
    for (let pairIndex = 0; pairIndex < currentDataSetSize; pairIndex++) {
        // Fetch the next line from the buffer, which contains 8 numbers
        const eightComponentVector = parseNumbersInLine(processedDataLines.shift());

        // Represent the first quaternion using an object for better readability
        const quaternionOperand1 = {
            scalar: eightComponentVector[0], // Real part
            i_comp: eightComponentVector[1], // i-component
            j_comp: eightComponentVector[2], // j-component
            k_comp: eightComponentVector[3]  // k-component
        };

        // Represent the second quaternion similarly
        const quaternionOperand2 = {
            scalar: eightComponentVector[4],
            i_comp: eightComponentVector[5],
            j_comp: eightComponentVector[6],
            k_comp: eightComponentVector[7]
        };

        // Perform the quaternion multiplication using the Hamilton product formula
        // (q1.s + q1.i*i + q1.j*j + q1.k*k) * (q2.s + q2.i*i + q2.j*j + q2.k*k)
        // Resulting quaternion (R.s + R.i*i + R.j*j + R.k*k) components are:

        // R.s = q1.s*q2.s - q1.i*q2.i - q1.j*q2.j - q1.k*q2.k
        // R.i = q1.s*q2.i + q1.i*q2.s + q1.j*q2.k - q1.k*q2.j
        // R.j = q1.s*q2.j - q1.i*q2.k + q1.j*q2.s + q1.k*q2.i
        // R.k = q1.s*q2.k + q1.i*q2.j - q1.j*q2.i + q1.k*q2.s

        // To enhance clarity and break down the calculation (Type III addition)
        // We'll pre-calculate all 16 cross-products between components
        const s1s2 = quaternionOperand1.scalar * quaternionOperand2.scalar;
        const s1i2 = quaternionOperand1.scalar * quaternionOperand2.i_comp;
        const s1j2 = quaternionOperand1.scalar * quaternionOperand2.j_comp;
        const s1k2 = quaternionOperand1.scalar * quaternionOperand2.k_comp;

        const i1s2 = quaternionOperand1.i_comp * quaternionOperand2.scalar;
        const i1i2 = quaternionOperand1.i_comp * quaternionOperand2.i_comp;
        const i1j2 = quaternionOperand1.i_comp * quaternionOperand2.j_comp;
        const i1k2 = quaternionOperand1.i_comp * quaternionOperand2.k_comp;

        const j1s2 = quaternionOperand1.j_comp * quaternionOperand2.scalar;
        const j1i2 = quaternionOperand1.j_comp * quaternionOperand2.i_comp;
        const j1j2 = quaternionOperand1.j_comp * quaternionOperand2.j_comp;
        const j1k2 = quaternionOperand1.j_comp * quaternionOperand2.k_comp;

        const k1s2 = quaternionOperand1.k_comp * quaternionOperand2.scalar;
        const k1i2 = quaternionOperand1.k_comp * quaternionOperand2.i_comp;
        const k1j2 = quaternionOperand1.k_comp * quaternionOperand2.j_comp;
        const k1k2 = quaternionOperand1.k_comp * quaternionOperand2.k_comp;

        // Assemble the final components of the product quaternion
        const resultScalar = s1s2 - i1i2 - j1j2 - k1k2;
        const resultI      = s1i2 + i1s2 + j1k2 - k1j2;
        const resultJ      = s1j2 - i1k2 + j1s2 + k1i2;
        const resultK      = s1k2 + i1j2 - j1i2 + k1s2;

        // Output the four components of the resulting quaternion, space-separated
        console.log(`${resultScalar} ${resultI} ${resultJ} ${resultK}`);
    }
}