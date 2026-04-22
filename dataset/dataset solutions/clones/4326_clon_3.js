process.stdin.resume();
process.stdin.setEncoding('utf8');

// This buffer accumulates all data chunks received from standard input.
let receivedInputBuffer = '';

// Event listener for incoming data: Each chunk is appended to the buffer.
process.stdin.on('data', (dataChunk) => {
    receivedInputBuffer += dataChunk;
});

// Event listener for the end of the input stream: Process the accumulated data.
process.stdin.on('end', () => {
    // Split the raw input into individual lines,
    // trim leading/trailing whitespace from each,
    // and filter out any lines that are empty after trimming.
    const cleanedInputLines = receivedInputBuffer
        .split(/\r?\n/)
        .map(lineContent => lineContent.trim())
        .filter(trimmedLine => trimmedLine.length > 0);

    // Initiate the core calculation logic with the prepared input.
    findDiophantineSolution(cleanedInputLines);
});

/**
 * Solves the Diophantine equation 4/N = 1/x + 1/y + 1/z for positive integers x, y, z.
 * It iterates through possible values for x and y, then calculates z.
 *
 * @param {string[]} dataLines An array containing lines of input, where the first line
 *                             is expected to be the integer N.
 */
function findDiophantineSolution(dataLines) {
    // Define the maximum iteration limit for x, y, and z.
    // This value was implicitly 3500 in the original problem context.
    const ITERATION_UPPER_LIMIT = 3500;

    let targetIntegerN; // Represents the 'N' from the problem statement.

    // Attempt to parse the primary input value.
    try {
        const parsedValue = parseInt(dataLines[0], 10);

        // Validate the parsed integer to ensure it's a positive number.
        if (isNaN(parsedValue) || parsedValue <= 0) {
            console.error("Error: The provided target integer is invalid or not positive. Please provide a valid number.");
            return; // Terminate execution if input is invalid.
        }
        targetIntegerN = parsedValue;
    } catch (parsingException) {
        console.error("An error occurred during input parsing: " + parsingException.message);
        return; // Terminate on any parsing failure.
    }

    // Pre-calculate constants to optimize repeated calculations within loops.
    // These correspond to the terms (4/N), (2/3500), and (1/3500) in the original problem's inequality checks.
    const primaryRatioFactor = 4 / targetIntegerN;
    const firstThresholdConstant = 2 / ITERATION_UPPER_LIMIT;
    const secondThresholdConstant = 1 / ITERATION_UPPER_LIMIT;

    // Variables to store the found solution (x, y, z).
    let solutionX = 0;
    let solutionY = 0;
    let solutionZ = 0;

    // A boolean flag to efficiently break out of nested loops once a solution is found.
    let isSolutionAchieved = false;

    // Outer loop: Iterate through possible values for 'x' (originally 'h').
    // 'x' must be positive, hence starting from 1.
    for (let currentX = 1; currentX < ITERATION_UPPER_LIMIT; ++currentX) {
        const inverseOfX = 1 / currentX;

        // Optimization: Skip combinations where currentX is too small to satisfy the initial condition.
        // This is derived from 4/N < 1/x + 2/ITERATION_UPPER_LIMIT.
        if (primaryRatioFactor < inverseOfX + firstThresholdConstant) {
            continue; // Move to the next 'currentX'.
        }

        // Inner loop: Iterate through possible values for 'y' (originally 'n').
        // 'y' starts from 'currentX' to ensure x <= y and avoid redundant permutations.
        for (let currentY = currentX; currentY < ITERATION_UPPER_LIMIT; ++currentY) {
            const inverseOfY = 1 / currentY;

            // Further optimization: Skip combinations where currentY is too small.
            // This is derived from 4/N < 1/x + 1/y + 1/ITERATION_UPPER_LIMIT.
            if (primaryRatioFactor < inverseOfX + inverseOfY + secondThresholdConstant) {
                continue; // Move to the next 'currentY'.
            }

            // Calculate a candidate value for 'z' based on the current 'x' and 'y'.
            // The equation 4/N = 1/x + 1/y + 1/z can be rearranged to solve for z:
            // 1/z = 4/N - 1/x - 1/y
            // 1/z = (4xy - N y - N x) / (Nxy)
            // z = (Nxy) / (4xy - N y - N x)
            const numeratorZ = targetIntegerN * currentX * currentY;
            const denominatorZ = (4 * currentX * currentY) - (targetIntegerN * currentY) - (targetIntegerN * currentX);

            // Guard against invalid denominators (zero or negative), which would lead to
            // an undefined or non-positive 'z', violating the positive integer constraint.
            if (denominatorZ <= 0) {
                continue; // Skip this (currentX, currentY) pair.
            }

            // Compute 'z' and round up to the nearest integer.
            // This is crucial because we are looking for integer solutions, and
            // Math.ceil ensures we check the smallest integer 'z' that could potentially work.
            let potentialZ = Math.ceil(numeratorZ / denominatorZ);

            // Additional optimization: If 'potentialZ' is already beyond our upper limit,
            // it cannot be a valid part of a solution within the specified bounds.
            if (potentialZ >= ITERATION_UPPER_LIMIT) {
                continue;
            }

            // Verify if the calculated 'potentialZ' precisely satisfies the original equation.
            // To avoid floating-point inaccuracies, the equation 4/N = 1/x + 1/y + 1/z
            // is transformed into an equivalent integer-based form:
            // 4xyz = N(yz + xz + xy)
            const leftSideOfEquation = 4 * currentX * currentY * potentialZ;
            const rightSideOfEquation = (targetIntegerN * currentY * potentialZ) +
                                        (targetIntegerN * currentX * potentialZ) +
                                        (targetIntegerN * currentX * currentY);

            // If the integer equation holds true, a solution has been found.
            if (leftSideOfEquation === rightSideOfEquation) {
                isSolutionAchieved = true;
                solutionX = currentX;
                solutionY = currentY;
                solutionZ = potentialZ;
                break; // Exit the inner loop.
            }

            // If a solution was found in the inner loop's prior iterations, propagate the break.
            if (isSolutionAchieved) {
                break;
            }
        }

        // If a solution was found in any of the inner loop iterations, exit the outer loop.
        if (isSolutionAchieved) {
            break;
        }
    }

    // Output the results.
    if (isSolutionAchieved) {
        console.log(`${solutionX} ${solutionY} ${solutionZ}`);
    } else {
        // This case should ideally not be reached if a solution is guaranteed by problem constraints.
        console.log("No valid integer solution (x, y, z) found within the specified iteration limits.");
    }
}