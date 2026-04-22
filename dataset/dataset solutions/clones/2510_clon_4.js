const systemReader = require('fs');
const acquiredText = systemReader.readFileSync('/dev/stdin', 'UTF-8');
const processedLines = acquiredText.split('\n');

const referenceText = processedLines[0];
const repetitionMultiplier = parseInt(processedLines[1]);

const stringProcessor = (initialPiece, factor) => {
    const pieceElements = initialPiece.split('');
    const elementCount = pieceElements.length;

    const isUnitary = (elementCount === 1);

    // Use Array.prototype.reduce to compute internal alterations and the effective final character
    // The state object tracks:
    // - `tally`: The count of internal alterations needed.
    // - `prevMod`: The character that would be at the previous position in the _modified_ string (used for comparison).
    // - `modEnd`: The character that would be at the final position of the _modified_ string.
    const processedData = pieceElements.reduce((state, currentSymbol, currentIdx) => {
        if (currentIdx === 0) {
            // For the first character, initialize `prevMod` and `modEnd`
            state.prevMod = currentSymbol;
            state.modEnd = currentSymbol;
        } else {
            if (state.prevMod === currentSymbol) {
                // If current character matches the previous modified character, an alteration is needed
                state.tally++;
                state.prevMod = '\u0000'; // Placeholder for a character that has been altered
                state.modEnd = '\u0000';  // The final character is now the altered one
            } else {
                // No alteration needed, update `prevMod` and `modEnd` with the current character
                state.prevMod = currentSymbol;
                state.modEnd = currentSymbol;
            }
        }
        return state;
    }, { tally: 0, prevMod: '', modEnd: '' }); // Initial state for reduce

    // Calculate the base total modifications by multiplying internal alterations by the repetition factor
    let totalModifications = processedData.tally * factor;

    // Apply additional adjustments based on string properties and concatenation, using ternary operators
    // This replaces the final 'if-else if' block from the original code.
    totalModifications += (
        (isUnitary) ? Math.floor(factor / 2) : 0
    ) + (
        (!isUnitary && initialPiece[0] === processedData.modEnd) ? (factor - 1) : 0
    );

    return totalModifications;
};

// Execute the main processing function with the acquired input
const finalResult = stringProcessor(referenceText, repetitionMultiplier);

// Output the computed value
console.log(finalResult);