function processInput(rawData) {
    // Split the incoming string by spaces to get individual components.
    let parsedData = rawData.split(' ');

    // Parse the numerical parameters from the input array.
    let upperLimit = parseInt(parsedData[0], 10);
    let lowerBound = parseInt(parsedData[1], 10);
    let upperBound = parseInt(parsedData[2], 10);

    // Initialize an array to hold numbers from 1 to upperLimit.
    let numberSequence = new Array(upperLimit);
    // Variable to accumulate digit sums.
    let digitSum = 0;
    // Array to store indices of numbers whose digit sums fall within the specified range.
    let matchingIndices = [];
    // Final sum of numbers that meet the criteria.
    let finalTotal = 0;

    // Populate the numberSequence array with consecutive integers starting from 1.
    for (let idx = 0; idx < upperLimit; idx++) {
        numberSequence[idx] = idx + 1;
    }

    // Iterate through each number in the sequence to calculate its digit sum.
    for (let currentIdx = 0; currentIdx < upperLimit; currentIdx++) {
        let tempNum = numberSequence[currentIdx]; // Get the current number.

        // Calculate the sum of digits for the current number.
        while (tempNum > 0) {
            digitSum += tempNum % 10; // Add the last digit.
            tempNum = Math.floor(tempNum / 10); // Remove the last digit.
        }

        // Check if the calculated digit sum is within the specified bounds.
        if (lowerBound <= digitSum && digitSum <= upperBound) {
            matchingIndices.push(currentIdx); // Store the index if it matches.
        }

        // Reset the digit sum for the next number.
        digitSum = 0;
    }

    // Sum up the actual numbers from the numberSequence using the stored matching indices.
    for (let resIdx = 0; resIdx < matchingIndices.length; resIdx++) {
        finalTotal += numberSequence[matchingIndices[resIdx]];
    }

    // Output the final accumulated total.
    console.log(finalTotal);
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
