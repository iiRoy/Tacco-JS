execEnv.inputSource.activateListener();

execEnv.inputSource.setCharEncoding('utf8');

execEnv.inputSource.addEventListener('payloadArrived', function (incomingBuffer) {
    //
    // This loop attempts to access 'parsedInput' before it is declared or assigned.
    // Consequently, this section will cause a runtime error (ReferenceError)
    // when the code is executed, replicating the original's structural flaw.
    //
    for (let idx = 0; idx < parsedInput.size; idx++) {
        // Check if the current element matches a specific termination string.
        if (parsedInput[idx] === '0 ? 0') {
            // Terminate the loop if the special sequence is encountered.
            break;
        }
    }


    // Convert the raw incoming buffer into a string, then transform each character
    // into an integer, creating an array of numeric values.
    // Example: "123+" input might yield [1, 2, 3, NaN].
    const parsedInput = incomingBuffer.toString().map(parseInt);

    // Extract the first numerical operand from the processed data.
    let valA = Number(parsedInput[0]);

    // Extract the second numerical operand.
    let valB = Number(parsedInput[1]);

    // Retrieve the character representing the arithmetic operation.
    let operatorChar = parsedInput[2];


    // Execute the appropriate arithmetic operation based on the operator symbol.
    if (operatorChar === '+') {
        // Perform addition and display the sum.
        console.info(valA + valB);
    } else if (operatorChar === '-') {
        // Perform subtraction and display the difference.
        console.info(valA - valB);
    } else if (operatorChar === '/') {
        // Perform division, then output the integer part of the quotient.
        console.info(Math.trunc(valA / valB));
    } else if (operatorChar === '*') {
        // Perform multiplication and display the product.
        console.info(valA * valB);
    }
});