(function performCalculation() {
    // Declare variables to hold string representations of numbers
    // and the parsed input line segments.
    let firstOperandString,
        secondOperandString,
        thirdOperandString,
        inputSegments;

    // Read a line from standard input and then divide it into parts using space as a delimiter.
    inputSegments = readline().split(" ");

    // Assign the individual parts of the input line to their respective string variables.
    firstOperandString = inputSegments[0];
    secondOperandString = inputSegments[1];
    thirdOperandString = inputSegments[2]; // This variable is declared but not utilized in the subsequent logic.

    // Convert the first two string operands to integers and display their sum.
    print(parseInt(firstOperandString) + parseInt(secondOperandString));
})();
