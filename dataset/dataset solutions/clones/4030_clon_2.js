let inputDataRows = [];

const standardInput = require('readline');

const inputHandler = standardInput.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputHandler.on('line', function (currentLineText) {
    // Store each line received from standard input
    inputDataRows.push(currentLineText);
});

inputHandler.on('close', function () {
    // Process all input lines once the input stream is closed
    const parsedMatrix = inputDataRows.map(rowStr => rowStr.split(" ").map(numStr => Number(numStr)));
    
    // Iterate through possible values for the first component (A_i)
    for (let firstVal = 0; firstVal <= 100; firstVal++) {
        // Calculate the differences based on the first column of the matrix
        let diffOne = parsedMatrix[0][0] - firstVal;
        let diffTwo = parsedMatrix[1][0] - firstVal;
        let diffThree = parsedMatrix[2][0] - firstVal;

        // Iterate through possible values for the second component (B_i)
        for (let secondVal = 0; secondVal <= 100; secondVal++) {
            // Check if the current combination satisfies the conditions for the second column
            if (secondVal + diffOne !== parsedMatrix[0][1]) {
                continue; // Move to the next secondVal if condition not met
            }
            if (secondVal + diffTwo !== parsedMatrix[1][1]) {
                continue; // Move to the next secondVal if condition not met
            }
            if (secondVal + diffThree !== parsedMatrix[2][1]) {
                continue; // Move to the next secondVal if condition not met
            }

            // Iterate through possible values for the third component (C_i)
            for (let thirdVal = 0; thirdVal <= 100; thirdVal++) {
                // Check if the current combination satisfies the conditions for the third column
                if (thirdVal + diffOne !== parsedMatrix[0][2]) {
                    continue; // Move to the next thirdVal if condition not met
                }
                if (thirdVal + diffTwo !== parsedMatrix[1][2]) {
                    continue; // Move to the next thirdVal if condition not met
                }
                if (thirdVal + diffThree !== parsedMatrix[2][2]) {
                    continue; // Move to the next thirdVal if condition not met
                }

                // If all conditions are met, a solution is found
                console.log("Yes");
                return (0); // Exit the program
            }
        }
    }
    // If no solution is found after checking all possibilities
    console.log("No");
});
