function processInput(inputString) {
    // Split the input string into lines
    inputString = inputString.split("\n");

    // Parse the first line for N and X
    var lineParts = inputString[0].split(" ");
    var countElements = lineParts[0]; // N is not actually used in the logic, but parsed.
    var targetValue = lineParts[1];

    // Parse the second line for the array of numbers (xi)
    var coordinateList = inputString[1].split(" ");

    // Add the target value to the list of coordinates
    coordinateList.push(targetValue);

    // Convert all elements in the coordinate list to integers
    coordinateList = coordinateList.map(function(elementString) {
        return parseInt(elementString, 10);
    });

    // Sort the coordinate list numerically in ascending order
    coordinateList.sort(function(firstNum, secondNum) {
        if (firstNum > secondNum) {
            return 1; // firstNum comes after secondNum
        }
        return -1; // firstNum comes before secondNum
    });

    // Handle a special case where there are only two coordinates
    if (coordinateList.length === 2) {
        console.log(coordinateList[1] - coordinateList[0]);
        return; // Exit the function
    }

    // Initialize an array to store differences between adjacent coordinates
    var differenceSet = [];

    // Calculate differences between consecutive elements
    for (var idx = 1; idx < coordinateList.length; idx++) {
        differenceSet.push(coordinateList[idx] - coordinateList[idx - 1]);
    }

    // Filter out duplicate differences to get only unique values
    differenceSet = differenceSet.filter(function(currentDiff, idx, currentArray) {
        return currentArray.indexOf(currentDiff) === idx;
    });

    // If only one unique difference remains, print it and exit
    if (differenceSet.length === 1) {
        console.log(differenceSet[0]);
        return;
    } else {
        // If multiple unique differences exist, apply an iterative GCD-like process
        while (true) {
            var tempDifferences = []; // Temporary array for new differences

            // Sort the current set of differences (redundant if already sorted and unique positive)
            differenceSet = differenceSet.sort(function(firstNum, secondNum) {
                if (firstNum > secondNum) {
                    return 1;
                }
                return -1;
            });

            // Calculate differences between adjacent elements in the current difference set
            for (var idx = 1; idx < differenceSet.length; idx++) {
                tempDifferences.push(differenceSet[idx] - differenceSet[idx - 1]);
            }

            // Filter out duplicate differences from the temporary array
            tempDifferences = tempDifferences.filter(function(currentDiff, idx, currentArray) {
                return currentArray.indexOf(currentDiff) === idx;
            });

            // Update the main difference set with the new unique differences
            differenceSet = tempDifferences;

            // If only one unique difference remains, break the loop
            if (differenceSet.length === 1) {
                break;
            } else {
                // This assignment is redundant as differenceSet = tempDifferences already occurred.
                // Preserving for Type II clone rules.
                differenceSet = tempDifferences;
            }
        }
        // Print the final single unique difference
        console.log(differenceSet[0]);
    }
}

// Read input from standard input and pass it to the main processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
