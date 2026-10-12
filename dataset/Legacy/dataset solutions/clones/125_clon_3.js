const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const textEncoding = "utf8";
const whitespaceSplitter = /\s/;
const maxBitIndex = 8; // Corresponds to k from 0 to 8, inclusive (9 iterations)

const rawInputContent = fileSystemModule.readFileSync(standardInputPath, textEncoding);
const inputTokensArray = rawInputContent.split(whitespaceSplitter);

let tokenIteratorIndex = 0;
let currentInputToken;

// The outer loop processes each token from the input.
// It continues as long as there are tokens and the current token is not undefined.
// The assignment within the condition mimics the original's golfed 'i = ...[j++]'
while (tokenIteratorIndex < inputTokensArray.length && (currentInputToken = inputTokensArray[tokenIteratorIndex]) !== undefined) {
    let binaryComponentAccumulator = ''; // This string collects the powers of two for the current token

    // The inner loop checks bits from position 0 up to maxBitIndex (8).
    for (let bitPosition = 0; bitPosition <= maxBitIndex; bitPosition++) {
        const currentBitWeight = 1 << bitPosition; // Calculates 2^bitPosition

        // JavaScript implicitly converts currentInputToken (string) to a number for bitwise operations.
        // If the bitwise AND operation results in a non-zero value, it means the bit is set.
        if ((currentBitWeight & currentInputToken) !== 0) {
            binaryComponentAccumulator += currentBitWeight + ' ';
        }
    }

    // After processing all bits for the current token, print the accumulated components, trimmed.
    // This mirrors the original's 'console.log(a.trim())' which was in the outer loop's afterthought.
    console.log(binaryComponentAccumulator.trim());

    tokenIteratorIndex++; // Move to the next token in the input array
}
