function detonateSequence(initialString) {
    let currentStringRepresentation = initialString;
    let sequenceModified = true;

    while (sequenceModified) {
        sequenceModified = false;
        const processedCharacters = [];
        let currentIndex = 0;

        while (currentIndex < currentStringRepresentation.length) {
            const currentChar = currentStringRepresentation[currentIndex];
            let charCount = 0;
            let tempIndex = currentIndex;

            // Count consecutive identical characters
            while (tempIndex < currentStringRepresentation.length && currentStringRepresentation[tempIndex] === currentChar) {
                charCount++;
                tempIndex++;
            }

            // Check if the sequence forms a 'bomb' (4 or more '1', '2', or '3')
            if ((currentChar === '1' || currentChar === '2' || currentChar === '3') && charCount >= 4) {
                sequenceModified = true; // A bomb was found and removed
            } else {
                // If not a bomb, append the characters to the new sequence
                for (let k = 0; k < charCount; k++) {
                    processedCharacters.push(currentChar);
                }
            }
            currentIndex = tempIndex; // Move to the next distinct character sequence
        }
        currentStringRepresentation = processedCharacters.join('');
    }
    return currentStringRepresentation.length;
}

function* generateNumberBlocks(allInputLines) {
    let linePointer = 0;
    while (linePointer < allInputLines.length) {
        const blockLength = parseInt(allInputLines[linePointer++], 10);
        if (blockLength === 0) break;

        const blockNumbers = [];
        for (let i = 0; i < blockLength; i++) {
            blockNumbers.push(parseInt(allInputLines[linePointer++], 10));
        }
        yield blockNumbers;
    }
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputData.trim().split('\n');

for (const currentNumericBlock of generateNumberBlocks(inputLines)) {
    let minimumResultLength = Infinity;

    // Generate all possible modified sequences for the current block
    const allModifiedSequences = Array.from({ length: currentNumericBlock.length }, (_, elementIndex) => {
        const baseSequenceCopy = [...currentNumericBlock];
        const forwardShiftedSequence = [...baseSequenceCopy];
        const backwardShiftedSequence = [...baseSequenceCopy];

        // Apply forward shift modification
        if (elementIndex < currentNumericBlock.length - 1) {
            forwardShiftedSequence[elementIndex] = forwardShiftedSequence[elementIndex + 1];
        }
        // Apply backward shift modification
        if (elementIndex > 0) {
            backwardShiftedSequence[elementIndex] = backwardShiftedSequence[elementIndex - 1];
        }
        return [forwardShiftedSequence, backwardShiftedSequence];
    }).flat(); // Flatten the array of pairs into a single list of sequences

    // Process each modified sequence and update the minimum length
    for (const transformedNumericSequence of allModifiedSequences) {
        const sequenceAsString = transformedNumericSequence.join('');
        const finalLengthAfterDetonation = detonateSequence(sequenceAsString);
        minimumResultLength = Math.min(minimumResultLength, finalLengthAfterDetonation);
    }
    console.log(minimumResultLength);
}
