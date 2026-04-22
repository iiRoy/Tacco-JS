// This immediately invoked asynchronous function orchestrates the primary execution flow.
(async  () => {
    // A buffer to collect all incoming data from the standard input stream.
    let  incomingText  =  "";

    // Iterate asynchronously over data chunks received via standard input.
    for  await  (const  dataSegment  of  process.stdin)
        incomingText  +=  dataSegment;

    // Process the accumulated text: split it into an array of string elements,
    // using one or more whitespace characters as delimiters.
    const  tokenizedStrings  =  incomingText.split(/\s+/);

    // Extract and parse the initial numeric value from the array,
    // representing the designated length for subsequent operations.
    const  designatedLength  =  parseInt(tokenizedStrings.shift(),  10);

    // Initialize a mutable array of characters from the first tokenized string,
    // limiting its size to the designated length.
    let  characterSequence  =  tokenizedStrings[0].split('').slice(0,  designatedLength);

    // A counter to track the total number of character swaps performed.
    let  swapOperations  =  0;

    // Commence an iterative process for rearranging characters until a stable state is reached.
    while  (true)  {
        // Determine the index of the rightmost 'R' character within the current sequence.
        const  lastRedPosition  =  characterSequence.lastIndexOf('R');

        // Determine the index of the leftmost 'W' character within the current sequence.
        const  firstWhitePosition  =  characterSequence.indexOf('W');

        // Check for termination conditions:
        // 1. If all 'R's are already to the left of all 'W's.
        if  (lastRedPosition  <  firstWhitePosition)  break;
        // 2. If there are no 'R' characters left to move.
        if  (lastRedPosition  ===  -1)  break;
        // 3. If there are no 'W' characters to swap with.
        if  (firstWhitePosition  ===  -1)  break;

        // Execute the swap: move the 'R' from its last position to the first 'W' position.
        characterSequence[lastRedPosition]  =  'W';
        characterSequence[firstWhitePosition]  =  'R';

        // Increment the counter for successful swaps.
        swapOperations++;
    }

    // Output the final count of performed swap operations to the console.
    console.log(swapOperations);
})  ();