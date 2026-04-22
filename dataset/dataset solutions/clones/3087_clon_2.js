// This function is designed to process a complex multi-line string input.
// It simulates movements or transformations of elements based on a sequence of operations.
function processInputString(inputContent) {
    // The initial raw input string is first segmented into an array of individual lines.
    inputContent = inputContent.split("\n");

    // The very first line of the input is extracted and subsequently discarded, as it's not used.
    let firstUnusedLine = inputContent.shift();

    // The second line is taken, then immediately broken down into an array of its constituent characters.
    let characterArray = inputContent.shift().split("");

    // The total count of characters in the sequence is stored as a constant for efficiency.
    const arrayLength = characterArray.length;

    // All subsequent lines are treated as operation definitions. Each line is split by space
    // to separate the target character and the movement direction, forming a list of operations.
    let operationList = inputContent.map(lineElement => lineElement.split(" "));

    // An array is initialized to track the number of entities at each position.
    // Initially, all positions are set to zero.
    let currentCounts = new Array(arrayLength).fill(0);

    // Each position in the `currentCounts` array is then explicitly set to one.
    // This establishes the starting condition for the simulation.
    for (let posIndex = 0; posIndex < currentCounts.length; posIndex++) {
        currentCounts[posIndex] = 1;
    }

    // The core logic iterates through each operation defined in the `operationList`.
    for (let opIteration = 0; opIteration < operationList.length; opIteration++) {
        // For the current operation, extract the specific character that triggers a movement.
        let targetCharacter = operationList[opIteration][0];
        // Also, extract the direction ('L' for left, 'R' for right) associated with this operation.
        let moveDirection = operationList[opIteration][1];

        // A temporary array is created to store the counts for the *next* state after this operation.
        // It's initialized with zeros to accumulate new counts.
        let nextIterationCounts = new Array(arrayLength).fill(0);

        // This inner loop processes every single character position within the main sequence.
        for (let charPosition = 0; charPosition < arrayLength; charPosition++) {
            // Check if the character at the current `charPosition` does not match the `targetCharacter`.
            if (characterArray[charPosition] !== targetCharacter) {
                // If there's no match, the count at this position simply carries over unchanged
                // to the same position in the `nextIterationCounts` array.
                nextIterationCounts[charPosition] += currentCounts[charPosition];
            } else {
                // If the character at `charPosition` *does* match the `targetCharacter`,
                // then movement logic is applied based on `moveDirection`.
                if (moveDirection === 'L') {
                    // For a 'Left' movement:
                    // Verify that moving one position to the left is still within the array bounds.
                    if (charPosition - 1 >= 0) {
                        // If valid, the count from the current position is added to the
                        // leftward position in the `nextIterationCounts` array.
                        nextIterationCounts[charPosition - 1] += currentCounts[charPosition];
                    }
                } else if (moveDirection === 'R') {
                    // For a 'Right' movement:
                    // Verify that moving one position to the right is still within the array bounds.
                    if ((charPosition + 1 < arrayLength)) {
                        // If valid, the count from the current position is added to the
                        // rightward position in the *current* `currentCounts` array.
                        // This behavior is specific to the original code's implementation.
                        currentCounts[charPosition + 1] += currentCounts[charPosition];
                    }
                }
            }
        }
        // After processing all positions for the current operation, the `currentCounts` array
        // is updated with the values from `nextIterationCounts` for the subsequent operation.
        currentCounts = nextIterationCounts;
    }

    // A final sum is computed by aggregating all the counts remaining in the `currentCounts` array.
    let finalSum = 0;
    for (let sumIndex = 0; sumIndex < currentCounts.length; sumIndex++) {
        finalSum += currentCounts[sumIndex];
    }

    // The calculated total sum is then output to the standard console.
    console.log(finalSum);
}

// The `processInputString` function is invoked, reading its input from standard input,
// which is typically a file or piped data in a command-line environment.
processInputString(require('node:fs').readFileSync('/dev/stdin', 'utf8'));