function processInputData(rawDataString) {
    // Split the incoming string by spaces to get an array of string representations of numbers.
    let parsedNumericData = rawDataString.split(" ");

    // Initialize a temporary array; this variable is not used in subsequent calculations.
    let temporaryStorage = [];

    // Iterate through the array elements to convert each string to a numerical value.
    for (let currentIndex in parsedNumericData) {
        parsedNumericData[currentIndex] = Number(parsedNumericData[currentIndex]);
    }

    // Evaluate the primary condition: if the first number is greater than the product of the second and third.
    if (parsedNumericData[0] > parsedNumericData[1] * parsedNumericData[2]) {
        // If the condition is met, output the difference.
        console.log(parsedNumericData[0] - parsedNumericData[1] * parsedNumericData[2]);
    } else {
        // If the primary condition is not met, proceed to a nested check.
        // Calculate the rounded division of the first by the third number, then check its parity against the second number's parity.
        if (Math.round(parsedNumericData[0] / parsedNumericData[2]) % 2 == parsedNumericData[1] % 2) {
            // If parities match, calculate and output the absolute difference involving the rounded value.
            console.log(
                Math.abs(parsedNumericData[0] - parsedNumericData[1] * Math.round(parsedNumericData[0] / parsedNumericData[2]))
            );
        } else {
            // If parities do not match, evaluate another condition based on a calculated difference.
            // Check if the difference between the first number and the product of the second and rounded division is negative.
            if (parsedNumericData[0] - parsedNumericData[1] * Math.round(parsedNumericData[0] / parsedNumericData[2]) < 0) {
                // If the difference is negative, adjust the multiplier upwards by one and output the absolute result.
                console.log(
                    Math.abs(
                        parsedNumericData[0] -
                            parsedNumericData[2] * (Math.round(parsedNumericData[0] / parsedNumericData[2]) + 1)
                    )
                );
            } else {
                // If the difference is not negative, adjust the multiplier downwards by one and output the absolute result.
                console.log(
                    Math.abs(
                        parsedNumericData[0] -
                            parsedNumericData[2] * (Math.round(parsedNumericData[0] / parsedNumericData[2]) - 1)
                    )
                );
            }
        }
    }
}

// Invoke the processing function with a sample string of numbers.
processInputData('10 4 3');
