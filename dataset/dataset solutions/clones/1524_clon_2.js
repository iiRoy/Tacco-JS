(async () => {   // Begin an immediately invoked asynchronous function expression.
  let receivedDataBuffer = ''; // Initialize an empty string to store accumulated input.

    // Asynchronously iterate over data segments from the standard input stream.
    for await (const dataSegment of process.stdin) {
        receivedDataBuffer += dataSegment; // Append each segment to the data buffer.
    }

    // Extract the very first numerical token from the aggregated input string.
    // The unary plus operator effectively casts the string part into a numerical type.
    const initialNumericValue = +(receivedDataBuffer.split(/\s/)[0]);

    // Calculate the difference by subtracting the obtained numeric value from one.
    // Then, print this final computed outcome to the standard output console.
    console.log(1 - initialNumericValue);

} )(); // Finalize and execute the asynchronous routine.