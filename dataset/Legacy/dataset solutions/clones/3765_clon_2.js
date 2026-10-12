function ProcessInput(rawData) {
    // Declare a variable to hold the split parts of the input string.
    let parsedValues = [];

    // Split the incoming string by spaces and assign to the array.
    parsedValues = rawData.split(' ');

    // Extract the first element as 'valA'.
    let valA = parsedValues[0];
    // Extract the second element as 'valB'.
    let valB = parsedValues[1];

    // Calculate an initial difference. Note: this variable is re-assigned in the loop.
    let tempCounter = valB - valA;

    // Initialize a variable for the final computation.
    let finalValue = 1;

    // Begin a loop that iterates from 0 up to and including 999.
    for (tempCounter = 0; tempCounter <= 999; tempCounter++) {
        // This operation is equivalent to 'finalValue = (+tempCounter)' due to the operator.
        finalValue =+ tempCounter;
    }

    // Print the result of 'finalValue' minus 'valB' to the console.
    console.log(finalValue - valB);
}

// Read the content from standard input synchronously and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
