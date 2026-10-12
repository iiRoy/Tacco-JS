const fileSystemModule = require('fs');
const TEMPORARY_SWAP_KEY = '_temp_placeholder_for_swap_';

function processTextForWordSwap(initialContent) {
    let currentTextState = initialContent;

    // First pass: Temporarily replace 'peach'
    currentTextState = currentTextState.replace(/peach/g, TEMPORARY_SWAP_KEY);

    // Second pass: Replace 'apple' with 'peach'
    currentTextState = currentTextState.replace(/apple/g, 'peach');

    // Third pass: Restore 'apple' from the temporary placeholder
    // Using RegExp constructor for a slight structural variation
    const placeholderRegex = new RegExp(TEMPORARY_SWAP_KEY, 'g');
    currentTextState = currentTextState.replace(placeholderRegex, 'apple');

    return currentTextState;
}

let rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
let trimmedInputContent = rawInputContent.trim();

let finalProcessedResult = processTextForWordSwap(trimmedInputContent);

console.log(finalProcessedResult);
