'use strict';

function parseNumericInput(inputStringContent) {
    const tokenizedStrings = inputStringContent.split(/\n|\s/);
    const numericValuesArray = tokenizedStrings.map(currentStringToken => {
        // Using bitwise NOT twice (~~) to convert to integer,
        // replicating the original behavior including how it handles empty strings (~~'' is 0).
        return ~~currentStringToken;
    });
    return numericValuesArray;
}

function processInputData(rawInputContent) {
    const numericValues = parseNumericInput(rawInputContent);

    // Extracting individual components for clarity
    const firstValue = numericValues[0];
    const secondValue = numericValues[1];
    const thirdValue = numericValues[2];
    const fourthValue = numericValues[3];

    // Calculating the sum of the first pair
    const leftSideSum = firstValue + secondValue;

    // Calculating the sum of the second pair
    const rightSideSum = thirdValue + fourthValue;

    // Determining the overall difference
    const totalDifference = leftSideSum - rightSideSum;

    let outcomeMessage = 'Balanced'; // Default outcome

    // Applying conditional logic based on the total difference
    if (totalDifference > 0) {
        outcomeMessage = 'Left';
    } else if (totalDifference < 0) {
        outcomeMessage = 'Right';
    }
    // If totalDifference is 0, outcomeMessage remains 'Balanced'

    console.log(outcomeMessage);
}

// Read input from stdin and pass it to the processing function
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
