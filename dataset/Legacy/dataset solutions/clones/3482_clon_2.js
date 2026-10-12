function greatestCommonDivisor(num1, num2) {
    // Base case: if the second number is zero, the GCD is the first number.
    if (num2 === 0) {
        return num1;
    }
    // Recursive step: apply Euclidean algorithm.
    return greatestCommonDivisor(num2, num1 % num2);
}

function retrievePositions(count, lengthVal) {
    // Initialize an array to store calculated positions.
    let positionList = [];
    // The first position is always 0.
    positionList.push(0);

    // Calculate subsequent positions based on the given count and total length.
    for (let idx = 1; idx <= count - 1; idx++) {
        positionList.push((idx * lengthVal) / count);
    }

    return positionList;
}


function processInput(inputString) {
    // Split the input string into individual lines.
    let inputLines = inputString.split("\n");
    // Parse the first line for two numeric values.
    let firstLineParts = inputLines[0].split(" ");
    let valN = Number(firstLineParts[0]);
    let valM = Number(firstLineParts[1]);
    // Extract the two string values from the second and third lines.
    let stringS = inputLines[1];
    let stringT = inputLines[2];

    // Calculate the greatest common divisor of N and M.
    let commonDivisor = greatestCommonDivisor(valN, valM);

    // Initialize a variable for the final result.
    let resultValue = -1; // This variable is effectively overwritten later.

    // Special case: if the two strings are identical, the answer is N.
    if (stringS === stringT) {
        console.log(valN);
        return; // Exit early.
    }

    // Another special case: if N is a multiple of M or M is a multiple of N,
    // it's impossible to find a common pattern, so output -1.
    if (valN % valM === 0 || valM % valN === 0) {
        console.log(-1);
    } else {
        // Initialize a loop counter for the potential common length.
        let currentLength = 0;

        // Iterate through possible common lengths, starting from the least common multiple
        // of N and M, and incrementing by the same amount.
        // The upper bound is an arbitrary large number to prevent infinite loops.
        for (currentLength = (valN * valM) / commonDivisor; currentLength < Math.pow(10, 5); currentLength += (valN * valM) / commonDivisor) {
            // Generate index arrays for string S and string T based on the current common length.
            let nPositions = retrievePositions(valN, currentLength);
            let mPositions = retrievePositions(valM, currentLength);
            // Flag to track consistency between the two strings at common positions.
            let isConsistent = true;

            // Iterate through all possible positions within the current common length.
            for (let checkIndex = 0; checkIndex < currentLength; checkIndex++) {
                // Find if the current position exists in the N-based index array.
                let nMatchIndex = nPositions.indexOf(checkIndex);
                // Find if the current position exists in the M-based index array.
                let mMatchIndex = mPositions.indexOf(checkIndex);

                // If the position is not common to both (i.e., not an intersection point), skip it.
                if (nMatchIndex < 0 || mMatchIndex < 0) {
                    continue;
                }

                // If the characters at the common position do not match, set the flag to false
                // and break the inner loop.
                if (stringS[nMatchIndex] !== stringT[mMatchIndex]) {
                    isConsistent = false;
                    break;
                }
            }

            // If all common positions were consistent, we found the answer.
            if (isConsistent) {
                break; // Exit the outer loop.
            }
        }
        // Output the found common length.
        console.log(currentLength);
    }

}
// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
