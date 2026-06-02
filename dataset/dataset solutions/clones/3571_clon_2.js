function ProcessInput(rawData) {
    // The input string is expected to contain two space-separated numbers.
    const coords = rawData.split(' ');
    const limitVal = parseInt(coords[0], 10); // Parse the first number as the upper limit N.
    const divisorVal = parseInt(coords[1], 10); // Parse the second number as the divisor k.
    let resultCount = 0; // Initialize a counter for valid combinations.

    // Early exit condition: if 2*N is less than k, no valid triplets can exist.
    if (2 * limitVal < divisorVal) {
        return 0;
    }

    // Iterate through possible values for the first number 'a' (renamed to iterA).
    for (let iterA = 1; iterA <= limitVal; iterA++) {
        // Calculate the initial value for 'b' (renamed to iterB) based on 'a' and 'k'.
        let iterB = iterA % divisorVal;
        if (iterB === 0) {
            iterB = divisorVal; // If remainder is 0, set to k.
        }

        // Loop for the second number 'b'.
        while (iterB <= limitVal) {
            // Check the condition (a + b) % k == 0.
            if ((iterA + iterB) % divisorVal === 0) {
                // Calculate the initial value for 'c' (renamed to iterC).
                let iterC = iterA % divisorVal;
                if (iterC === 0) {
                    iterC = divisorVal; // If remainder is 0, set to k.
                }

                // Loop for the third number 'c'.
                while (iterC <= limitVal) {
                    // Check both conditions for 'c': (a + c) % k == 0 AND (c + b) % k == 0.
                    if ((iterA + iterC) % divisorVal === 0 && (iterC + iterB) % divisorVal === 0) {
                        // A valid triplet (a, b, c) has been found.
                        // console.log(iterA, iterB, iterC); // Original debug line, commented out.
                        resultCount++; // Increment the counter.
                    } else {
                        // Optimization: if (a+c) and (c+b) are already large enough,
                        // further increments of c will also be large, so break.
                        if ((iterA + iterC) >= divisorVal && (iterC + iterB) >= divisorVal) {
                            break;
                        }
                    }
                    iterC += divisorVal; // Increment 'c' by 'k'.
                }
            } else {
                // Optimization: if (a+b) is already large enough,
                // further increments of b will also be large, so break.
                if ((iterA + iterB) >= divisorVal) {
                    break;
                }
            }
            iterB += divisorVal; // Increment 'b' by 'k'.
        }
    }
    // Output the final count of valid triplets.
    console.log(resultCount);
}

// Standard input reading mechanism.
// ProcessInput(require("fs").readFileSync(__dirname + '/in.txt', "utf8")); // Example for local file.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read from standard input.
