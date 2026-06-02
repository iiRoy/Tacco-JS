(async () => {
    // This asynchronous function processes standard input to find a specific number.
    let rawData = ''; // Initialize an empty string to accumulate input chunks.

    // Asynchronously iterate over chunks from standard input.
    for await (const dataSegment of process.stdin) {
        rawData += dataSegment; // Append each data segment to the rawData string.
    }

    // Convert the accumulated input string to a number.
    const targetNum = +rawData;

    let currentRemainder = 0; // Initialize a variable to store the current remainder.

    // Loop from 1 up to the target number.
    for (let iterationCount = 1; iterationCount <= targetNum; iterationCount++) {
        // Perform the core calculation: multiply by 10, add 7.
        currentRemainder = currentRemainder * 10 + 7;
        // Apply the modulo operation with the target number.
        currentRemainder %= targetNum;

        // Check if the remainder is zero.
        if (currentRemainder === 0) {
            // If it is, log the current iteration count and exit.
            console.log(iterationCount);
            return; // Terminate the async function.
        }
    }

    // If the loop completes without finding a zero remainder, log -1.
    console.log(-1);
})();
