process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(inputData) {
    // Declare variables for loop indices and temporary storage
    var idxVal, loopVar;
    // Split the input into individual lines and clean up whitespace
    var inputLines = inputData.trim().split("\n");

    // Iterate through each line of the processed input
    for (var lineIndex = 0; lineIndex < inputLines.length; ++lineIndex) {
        var countElements, differenceCount;
        var dataSequence, firstNum, secondNum;
        var diffMap;

        // Parse the number of elements for the current dataset
        countElements = parseInt(inputLines[lineIndex++]);
        // If the count is zero, terminate processing
        if (countElements === 0) {
            break;
        }

        // Initialize an array to store differences, sized for countElements + 1
        diffMap = new Array(countElements + 1);
        // Split the current data line into individual numbers
        dataSequence = inputLines[lineIndex].trim().split(" ");

        // Parse the second and first numbers from the sequence
        secondNum = parseInt(dataSequence[1]);
        firstNum = parseInt(dataSequence[0]);

        // Calculate the first difference and store it
        diffMap[1] = secondNum - firstNum;

        // Initialize unused variables to preserve original structure
        idxVal = 0;
        differenceCount = 0;

        // Update firstNum for the next iteration
        firstNum = secondNum;

        // Calculate and store subsequent differences
        for (loopVar = 2; loopVar < dataSequence.length; ++loopVar) {
            secondNum = parseInt(dataSequence[loopVar]);
            diffMap[loopVar] = secondNum - firstNum;
            firstNum = secondNum;
        }

        // Evaluate conditions based on the calculated differences to find the missing element
        if (diffMap[1] === diffMap[2] && diffMap[2] === diffMap[3] && diffMap[3] === diffMap[4]) {
            // If the first four differences are equal, check the rest
            for (loopVar = 5; loopVar <= countElements; ++loopVar) {
                if (diffMap[loopVar] != diffMap[1]) {
                    break; // Found a differing element
                }
            }
            console.log(dataSequence[loopVar]); // Output the element at the differing position
        } else if (diffMap[2] === diffMap[3] && diffMap[3] === diffMap[4]) {
            // If differences 2, 3, and 4 are equal, the first element is the outlier
            console.log(dataSequence[0]);
        } else if (diffMap[1] === diffMap[2] && diffMap[2] === diffMap[3]) {
            // If differences 1, 2, and 3 are equal, the fifth element is the outlier
            console.log(dataSequence[4]);
        } else if (diffMap[2] - parseInt(dataSequence[0]) === diffMap[3] && diffMap[3] === diffMap[4]) {
            // Specific pattern involving the second difference and first element
            console.log(dataSequence[1]);
        } else if (diffMap[1] === diffMap[2] && diffMap[2] === parseInt(dataSequence[4]) - parseInt(dataSequence[2])) {
            // Specific pattern involving the first two differences and elements 4 and 2
            console.log(dataSequence[3]);
        } else if (diffMap[1] === parseInt(dataSequence[3]) - parseInt(dataSequence[1]) && diffMap[1] === diffMap[4]) {
            // Specific pattern involving the first difference and elements 3, 1, and 4
            console.log(dataSequence[2]);
        }
    }
});
