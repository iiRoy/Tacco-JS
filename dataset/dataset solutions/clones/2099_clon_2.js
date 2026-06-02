// This function is designed to process the entire input data string.
function ProcessInput(rawData) {
    // Divide the incoming string into segments using a space as the delimiter.
    let segments = rawData.split(" ");

    // Convert the first three segments into integer values.
    let primaryValue = parseInt(segments[0], 10);
    let firstOperand = parseInt(segments[1], 10);
    let secondOperand = parseInt(segments[2], 10);

    // Compute the aggregate of the two operands.
    let operandSum = firstOperand + secondOperand;

    // Determine the remainder after dividing the primary value by the operand sum.
    let remainingPart = primaryValue % operandSum;

    // Calculate the integer quotient from the division.
    let integerQuotient = Math.floor(primaryValue / operandSum);

    // Initialize the ultimate calculation result.
    let ultimateResult = integerQuotient * firstOperand;

    // Adjust the ultimate result based on the remaining part.
    if (remainingPart > firstOperand) {
        ultimateResult += firstOperand;
    } else {
        ultimateResult += remainingPart;
    }

    // Display the final computed value.
    console.log(ultimateResult);
}

// The subsequent line is for handling standard input/output and should not be altered.
// It reads the entire content from standard input and passes it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
