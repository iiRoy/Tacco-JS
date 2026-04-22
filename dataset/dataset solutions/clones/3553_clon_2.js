// This function processes the given input string to find a specific numerical difference.
function processInput(rawData) {
    // Split the raw data into separate lines based on the newline character.
    rawData = rawData.split("\n");

    // Extract the first line and split it by space to obtain initial numerical parameters.
    var initialValues = rawData[0].split(" ");

    // The first parameter, `entryCount`, is the number of elements (N) from the input.
    var entryCount = initialValues[0];
    // The second parameter, `targetValue`, is a specific number (X) to be included in the list.
    var targetValue = initialValues[1];

    // Take the second line of the input and split it by space to form the initial list of numbers.
    var numberList = rawData[1].split(" ");

    // Add the `targetValue` to the collection of numbers.
    numberList.push(targetValue);
    // Convert all string elements in the `numberList` array to their integer representations.
    numberList = numberList.map(function(elementStr) {
        return parseInt(elementStr, 10);
    });

    // Sort the entire `numberList` in ascending numerical order.
    numberList.sort(function(firstNum, secondNum) {
        // Standard comparison function for numerical sorting:
        // Returns 1 if firstNum should come after secondNum, -1 otherwise.
        if (firstNum > secondNum) {
            return 1;
        }
        return -1;
    });

    // Check if the sorted list contains exactly two numbers.
    // If so, their absolute difference is the direct result.
    if (numberList.length === 2) {
        console.log(numberList[1] - numberList[0]);
        return; // Terminate execution as the result has been found.
    }


    // Initialize an array to store the differences between adjacent numbers.
    var uniqueDifferences = [];

    // Loop through the sorted `numberList` to calculate the difference between each adjacent pair.
    for (var idx = 1; idx < numberList.length; idx++) {
        uniqueDifferences.push(numberList[idx] - numberList[idx - 1]);
    }

    // Filter the `uniqueDifferences` array to keep only unique values.
    // The filter ensures that only the first occurrence of each difference is retained.
    uniqueDifferences = uniqueDifferences.filter(function (val, pos, currentArray) {
        return currentArray.indexOf(val) === pos;
    });

    // If, after uniqueness filtering, only one difference remains, that's the final answer.
    if (uniqueDifferences.length === 1) {
        console.log(uniqueDifferences[0]);
        return; // Exit the function.
    } else {
        // If there are multiple unique differences, we enter a loop to find their greatest common divisor (GCD) equivalent.
        // This process repeatedly calculates differences of differences until a single value is derived.
        while (true) {
            // A temporary array to hold the differences calculated in the current iteration.
            var tempDifferences = [];

            // Sort the current set of `uniqueDifferences` in ascending order.
            uniqueDifferences = uniqueDifferences.sort(function(firstNum, secondNum) {
                if (firstNum > secondNum) {
                    return 1;
                }
                return -1;
            })

            // Calculate the differences between adjacent elements in the sorted `uniqueDifferences` array.
            for (var idx = 1; idx < uniqueDifferences.length; idx++) {
                tempDifferences.push(uniqueDifferences[idx] - uniqueDifferences[idx - 1]);
            }

            // Filter `tempDifferences` to ensure only unique values are kept for the next iteration.
            tempDifferences = tempDifferences.filter(function (val, pos, currentArray) {
                return currentArray.indexOf(val) === pos;
            });
            
            // Update the `uniqueDifferences` array with the newly calculated unique differences.
            uniqueDifferences = tempDifferences;
            // If only one unique difference remains after this iteration, we have found our result.
            if (uniqueDifferences.length === 1) {
                break; // Exit the `while` loop.
            } else{
                // This line is redundant but kept to maintain the exact structural similarity of the original code.
                uniqueDifferences = tempDifferences;
            }
        }
        // Output the final single unique difference, which represents the GCD-like value.
        console.log(uniqueDifferences[0]);
    }
}

// Read the entire content of standard input, decode it as UTF-8, and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));