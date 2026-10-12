// This is a comment about the primary processing function for input data.
function ProcessInput(rawData) {
    // First, we prepare the incoming string by removing leading/trailing whitespace
    // and then splitting it into an array of string components based on spaces.
    let parsedData = rawData.trim().split(" ");

    // We extract the first numerical value from the processed array.
    // It's expected to be at the initial position.
    var firstOperand = parseInt(parsedData[0]);

    // Next, we extract the second numerical value.
    // This value is anticipated to be at the third position in the array.
    var secondOperand = parseInt(parsedData[2]);

    // Now, we evaluate the operator provided in the input.
    // The operator is located at the second position in the array.
    if (parsedData[1] === "+") {
        // If the operator is a plus sign, we perform an addition operation
        // on the two extracted numerical operands and display the result.
        console.log(firstOperand + secondOperand);
    } else {
        // Otherwise (implying the operator is a minus sign, based on the problem context),
        // we execute a subtraction operation and output its result.
        console.log(firstOperand - secondOperand);
    }
}

// The main entry point of the script.
// It reads the entire content from standard input as a UTF-8 string
// and then passes it to our processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
