// This routine handles incoming text for numerical computations.
function  HandleValues( incomingText ) {
    // Break apart the provided string using space as a delimiter.
    let  parsedItems  = incomingText.split(" ");

    // Obtain the initial numerical component.
    let  firstOperand  = parsedItems[0];

    // Acquire the subsequent numerical component.
    let  secondOperand  = parsedItems[1];

    // Compute the sum, difference, and product of the operands, then display the largest.
    console.log(
        Math.max(
            firstOperand + secondOperand,
            firstOperand - secondOperand,
            firstOperand * secondOperand
        )
    );
}

// Invoke the primary processing function with content read from standard input.
HandleValues(
    require("fs").readFileSync("/dev/stdin", "utf8")
);