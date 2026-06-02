function processInput(dataLines) {
    // The initial line of input specifies the total number of data entries to process.
    let numEntries = Number(dataLines[0]);

    // Initialize two primary variables, 'currentA' and 'currentB', both starting at one.
    let currentA = 1;
    let currentB = 1;

    // Iterate through each subsequent data entry, starting from the second line.
    for (let idx = 1; idx <= numEntries; idx++) {
        // Parse the current line, splitting it by space to get two temporary values.
        const lineParts = dataLines[idx].split(" ");
        let tempA = Number(lineParts[0]); // Convert the first part to a number.
        let tempB = Number(lineParts[1]); // Convert the second part to a number.

        // Scenario 1: If both temporary values are greater than or equal to the current values.
        if (tempA >= currentA && tempB >= currentB) {
            currentA = tempA; // Update 'currentA' to the new temporary 'tempA'.
            currentB = tempB; // Update 'currentB' to the new temporary 'tempB'.
        }
        // Scenario 2: If both current values are greater than or equal to their respective temporary values.
        else if (currentA >= tempA && currentB >= tempB) {
            // Calculate the minimum scaling factor needed for 'tempA' to reach 'currentA'.
            let factorA = Math.ceil(currentA / tempA);
            // Calculate the minimum scaling factor needed for 'tempB' to reach 'currentB'.
            let factorB = Math.ceil(currentB / tempB);

            // Apply the larger of the two factors to both temporary values to ensure both conditions are met.
            if (factorA > factorB) {
                currentA = factorA * tempA;
                currentB = factorA * tempB;
            } else {
                currentA = factorB * tempA;
                currentB = factorB * tempB;
            }
        }
        // Scenario 3: Only 'currentA' is greater than or equal to 'tempA'.
        else if (currentA >= tempA) {
            // Calculate the scaling factor for 'tempA'.
            let factorA = Math.ceil(currentA / tempA);
            currentA = factorA * tempA; // Scale 'tempA' up.
            currentB = factorA * tempB; // Apply the same factor to 'tempB'.
        }
        // Scenario 4: Only 'currentB' is greater than or equal to 'tempB' (the remaining case).
        else {
            // Calculate the scaling factor for 'tempB'.
            let factorB = Math.ceil(currentB / tempB);
            currentA = factorB * tempA; // Apply the factor to 'tempA'.
            currentB = factorB * tempB; // Scale 'tempB' up.
        }
    }

    // After processing all entries, print the sum of the final 'currentA' and 'currentB' values.
    console.log(currentA + currentB);
}

// Read the entire input from standard input, decode it as UTF-8,
// remove leading/trailing whitespace, and split it into an array of lines.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n'));
