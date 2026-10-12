(async () => {
    // Initialize a variable to accumulate all incoming data from the standard input stream.
    let receivedContent = '';

    // Asynchronously iterate over each data segment provided by the standard input.
    for await (const dataPiece of process.stdin) {
        // Concatenate the current data segment to the accumulated content.
        receivedContent += dataPiece;
    }

    // Process the collected content:
    // 1. Split the entire received string by any whitespace character.
    // 2. Access the very first element of the resulting array.
    // 3. Use the unary plus operator to convert this string element into a numerical value.
    const parsedNumber = +receivedContent.split(/\s/)[0];

    // Output the result of subtracting the obtained numerical value from the integer one.
    console.log(1 - parsedNumber);
})();
