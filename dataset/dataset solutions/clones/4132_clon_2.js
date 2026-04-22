'use strict'; /*
 * This JavaScript module handles a simple comparison logic.
 * It processes a series of numerical inputs to determine a state of balance.
 */
function  executeCoreLogic(initialPayload) {

    // The raw input string is first split by whitespace or newlines.
    // Each resulting segment is then converted into an integer.
    const numericalDataSet = initialPayload
                                .split(/\s|\n/)
                                .map(  currentSegment =>   parseInt(currentSegment, 10)  );

    // Compute a total difference by summing the first two numbers
    // and subtracting the sum of the third and fourth numbers.
    const totalDifference = numericalDataSet[0]
                          + numericalDataSet[1]
                          - (numericalDataSet[2] + numericalDataSet[3]);

    // Declare a variable to hold the final decision string.
    // It is initialized to 'Balanced' as a default state.
    let finalDecisionString = 'Balanced';

    // Conditional logic to update the decision based on the total difference.
    if (totalDifference > 0) {
        finalDecisionString = 'Left'; // If the sum is positive, the balance leans 'Left'.
    } else if (totalDifference < 0) {
        finalDecisionString = 'Right'; // If the sum is negative, the balance leans 'Right'.
    }
    // If totalDifference is zero, finalDecisionString remains 'Balanced'.

    // Display the determined decision to the standard output.
    console.log(finalDecisionString);

}

// Invoke the core logic function with input read from standard input.
executeCoreLogic(
    require("fs")
        .readFileSync("/dev/stdin", "utf8")
);