// This script processes numerical data from standard input to find combinations.
process.stdin.on("data", function (inputChunk) {
    // Convert the received data chunk to a string and then process each line.
    (String(inputChunk)).trim().split("\n").some(function (lineStr) {
        // Split the current line string by space to get individual numerical components.
        let components = lineStr.split(" ");

        // Extract and convert the numerical values for the total items and the desired sum.
        const totalItemsAllowed = Number(components[0]);
        const targetValueSum = Number(components[1]);
        let validCombinationCount = 0; // Initialize a counter for successful combinations.

        // If both input values are zero, it's a signal to terminate processing.
        if (!totalItemsAllowed && !targetValueSum) {
            return true; // Return true to stop the 'some' loop.
        }

        // Begin iterating through possible first numbers for the combination.
        // The first number 'firstVal' can range from 1 up to 'totalItemsAllowed - 2'.
        for (let firstVal = 1; firstVal <= totalItemsAllowed - 2; firstVal++) {
            // Iterate through possible second numbers 'secondVal'.
            // 'secondVal' must be greater than 'firstVal' and less than 'totalItemsAllowed'.
            for (let secondVal = firstVal + 1; secondVal <= totalItemsAllowed - 1; secondVal++) {
                // Iterate through possible third numbers 'thirdVal'.
                // 'thirdVal' must be greater than 'secondVal' and less than or equal to 'totalItemsAllowed'.
                for (let thirdVal = secondVal + 1; thirdVal <= totalItemsAllowed; thirdVal++) {
                    // Check if the sum of the three selected numbers equals the target value.
                    // If it does, increment the combination counter using short-circuit evaluation.
                    (firstVal + secondVal + thirdVal === targetValueSum) && (validCombinationCount++);
                }
            }
        }
        // Output the final count of valid combinations found for the current line's inputs.
        console.log(validCombinationCount);
    });
// Keep the standard input stream active to receive more data.
}).resume();