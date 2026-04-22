let calculateSolutions = function (receivedText) {
    // This function processes the provided text data to find specific numeric combinations.

    let textLines = receivedText.split('\n'); // Split the incoming text by newline characters.

    const desiredSum = Number.parseInt(textLines[0]); // Parse the first line as the target integer value.
    let validCombinations = 0; // Initialize a counter for successful combinations that meet the criteria.

    for (let factorX = 1; factorX < 1000; factorX++) { // Iterate through possible values for the first factor, from 1 up to 999.
        for (let factorY = 1; factorY < 1000; factorY++) { // Iterate through possible values for the second factor, from 1 up to 999.
            for (let additiveTerm = 1; additiveTerm < 1000; additiveTerm++) { // Iterate through possible values for the additive term, from 1 up to 999.
                // Check if the current combination of factorX * factorY + additiveTerm equals the desired sum.
                if (desiredSum === (factorX * factorY + additiveTerm)) {
                    validCombinations++; // If a match is found, increment the counter.
                }
            }
        }
    }

    console.log(String(validCombinations)); // Output the total number of valid combinations found.
};

// The following segment is for handling standard I/O; modifications are generally not advised for execution environment compatibility.
calculateSolutions( require('node:fs').readFileSync('/dev/stdin', 'utf8') );