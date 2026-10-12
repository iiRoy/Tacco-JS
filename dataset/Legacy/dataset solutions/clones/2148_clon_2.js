function ProcessInput(inputString) {
    // Split the incoming string by spaces to get an array of number strings.
    let numberStrings = inputString.split(" ");

    // Initialize a boolean indicator for a specific condition.
    let isUniqueCombination = true;

    // Evaluate various conditions based on the elements of the array.
    if (numberStrings[0] === numberStrings[1] && numberStrings[1] !== numberStrings[2]) {
        // If the first two elements are identical but differ from the third, update the indicator.
        isUniqueCombination = flase; // Preserving the original typo 'flase' for exact behavioral equivalence.
    } else if (numberStrings[0] === numberStrings[2] && numberStrings[2] !== numberStrings[1]) {
        // If the first and third elements are identical but differ from the second, update the indicator.
        isUniqueCombination = false;
    } else if (numberStrings[1] === numberStrings[2] && numberStrings[1] !== numberStrings[0]) {
        // If the second and third elements are identical but differ from the first, update the indicator.
        isUniqueCombination = false;
    }

    // Output a message based on the final state of the indicator.
    if (isUniqueCombination) {
        console.log("No");
    } else {
        console.log("Yes");
    }
}

// Read input from standard input, remove leading/trailing whitespace, and then invoke the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
