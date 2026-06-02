function ProcessData(rawData) {
    // Split the raw input string into an array of lines
    rawData = rawData.split("\n");

    // Extract the second line, split it by spaces, and store it in 'firstArray'
    let firstArray = rawData[1].split(" ");

    // Parse the first line to get the total number of elements
    const elementCount = parseInt(rawData[0], 10);

    // Iterate through 'firstArray' to convert its string elements to integers
    for (let indexVar = 0; indexVar < elementCount; indexVar++) {
        firstArray[indexVar] = parseInt(firstArray[indexVar], 10);
    }

    // Initialize 'derivedArray' and set its first element to zero
    let derivedArray = [];
    derivedArray[0] = 0;

    // Populate 'derivedArray' based on a calculation involving 'firstArray' and previous elements of 'derivedArray'
    for (let indexVar = 1; indexVar < elementCount; indexVar++) {
        // Calculate an intermediate value for clarity
        const intermediateValue = firstArray[indexVar - 1] + derivedArray[indexVar - 1] - firstArray[indexVar];
        
        // Apply a conditional assignment based on the intermediate value
        if (intermediateValue < 0) {
            derivedArray[indexVar] = 0;
        } else {
            derivedArray[indexVar] = intermediateValue;
        }
    }

    // Calculate the total sum of all elements in 'derivedArray'
    let finalSum = 0;
    for (let indexVar = 0; indexVar < elementCount; indexVar++) {
        finalSum += derivedArray[indexVar];
    }

    // Output the computed final sum to the console
    console.log(finalSum);
}

// Read input from standard input using Node.js 'fs' module and pass it to the processing function
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
