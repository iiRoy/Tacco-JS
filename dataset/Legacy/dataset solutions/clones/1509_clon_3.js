function solveProblem(rawInputData) {
    const MAX_ITERATION_BOUND = 1000; // Defines the exclusive upper limit for iteration variables

    const processedLines = rawInputData.split("\n");
    const targetSumValue = parseInt(processedLines[0], 10); // Explicitly specify radix for safety

    let combinationCounter = 0; // Use 'let' for a mutable counter variable

    for (let factorA = 1; factorA < MAX_ITERATION_BOUND; factorA++) {
        for (let factorB = 1; factorB < MAX_ITERATION_BOUND; factorB++) {
            // Calculate the product of factorA and factorB once per inner loop iteration
            const currentProductAB = factorA * factorB;

            for (let addendC = 1; addendC < MAX_ITERATION_BOUND; addendC++) {
                // Calculate the full sum using the pre-computed product
                const evaluatedSum = currentProductAB + addendC;

                if (targetSumValue === evaluatedSum) {
                    combinationCounter++; // Increment if the target sum is matched
                }
            }
        }
    }

    console.log('%d', combinationCounter); // Output the final count using the specified format
}

// The following lines are for standard input/output handling and should not be edited.
solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
