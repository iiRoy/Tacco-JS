// This function processes the raw input string provided.
function ProcessInput(rawData) {
    // The input string is first split into an array of lines.
    rawData = rawData.split("\n");

    // The first line of the input is then split by spaces to get individual parts.
    let firstLineParts = rawData[0].split(" ");

    // These parts are parsed as integers and assigned to distinct variables.
    let valA = parseInt(firstLineParts[0]);
    let valB = parseInt(firstLineParts[1]);
    let valC = parseInt(firstLineParts[2]);

    // A constant array is created to temporarily hold the values during calculations.
    const currentValues = [valA, valB, valC];

    // A counter is initialized to track the number of operations performed.
    let operationCount = 0;

    // This block handles a specific edge case where all three initial values are identical.
    if (valA === valB && valB === valC) {
        // If all values are equal and at least one of them is odd, no operations can be performed.
        // The operationCount remains 0 in this scenario.
        if (valA % 2 === 1 || valB % 2 === 1 || valC % 2 === 1) {
            // No action needed; operationCount is already 0.
        } else {
            // If all values are equal and all are even, it implies an infinite loop of transformations.
            // In this case, the operationCount is set to -1 as per problem specification.
            operationCount = -1;
        }
    } else {
        // If the initial values are not all identical, the iterative transformation process begins.
        while (true) { // This loop continues indefinitely until a 'break' statement is encountered.
            // The following line was a debug comment in the original code, now removed.
            // console.log("Current count: " + operationCount + ", A: " + valA + ", B: " + valB + ", C: " + valC);

            // Check if any of the current values are odd. If so, the transformation process must stop.
            if (valA % 2 === 1 || valB % 2 === 1 || valC % 2 === 1) {
                break; // Exit the loop as an odd number has been reached.
            } else {
                // If all current values are even, proceed with the transformation step.
                // Store the current values in the temporary array before they are updated.
                currentValues[0] = valA;
                currentValues[1] = valB;
                currentValues[2] = valC;

                // Calculate the new values for A, B, and C based on the sums of pairs from the previous step.
                valA = (currentValues[1] + currentValues[2]) / 2;
                valB = (currentValues[0] + currentValues[2]) / 2;
                valC = (currentValues[1] + currentValues[0]) / 2;

                // Increment the counter to reflect that one operation has been completed.
                operationCount++;
            }
        }
    }

    // Finally, the total count of operations is printed to the console.
    console.log(operationCount);
}

// The following lines are responsible for reading input from standard input and invoking the main processing function.
// These lines should not be altered as they manage the interaction with the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
