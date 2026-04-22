const k_io = require('readline');
const k_lineReader = k_io.createInterface({
    input: process.stdin,
    output: process.stdout
});

let k_dataLines = [];

k_lineReader.on('line', (line) => {
    k_dataLines.push(line);
});

k_lineReader.on('close', () => {
    k_processInput(k_dataLines);
});

function k_processInput(receivedLines) {
    const k_valA = parseInt(receivedLines[0], 10);

    let k_solX = 0;
    let k_solY = 0;
    let k_solZ = 0;

    const k_maxIter = 3500; // Upper bound for the first two variables

    // Use Array.from and some for a functional-style iteration to find the first solution
    const k_solutionFound = Array.from({ length: k_maxIter }).some((_, xIdx) => {
        const currentX = xIdx + 1; // x starts from 1

        // The second variable 'y' starts from 'x' up to k_maxIter
        return Array.from({ length: k_maxIter - xIdx }).some((_, yOffset) => {
            const currentY = yOffset + currentX; // y = x + offset

            // Perform calculations using BigInt for exact integer arithmetic
            const termA = 4n * BigInt(currentX) * BigInt(currentY);
            const termB = BigInt(k_valA) * BigInt(currentY);
            const termC = BigInt(k_valA) * BigInt(currentX);

            const k_denominator = termA - termB - termC;

            // Check if denominator is positive to ensure 'z' can be positive
            if (k_denominator > 0n) {
                const k_numerator = BigInt(k_valA) * BigInt(currentX) * BigInt(currentY);

                // Check if 'z' is an integer
                if (k_numerator % k_denominator === 0n) {
                    const calculatedZBigInt = k_numerator / k_denominator;
                    const calculatedZ = Number(calculatedZBigInt); // Convert back to Number for output

                    // Since denominator > 0 and numerator is always positive, calculatedZ will be positive.
                    // The original code only checked w > 0.
                    // No explicit upper bound for z is given in the original code, unlike for h and n.

                    k_solX = currentX;
                    k_solY = currentY;
                    k_solZ = calculatedZ;
                    return true; // Solution found, exit inner 'some' loop
                }
            }
            return false; // Continue searching in inner loop
        });
    });

    // Output the found solution
    console.log(`${k_solX} ${k_solY} ${k_solZ}`);
}