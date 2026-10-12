const fileSystem = require("fs");

const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");

const allInputTokens = rawInputContent.split(/\s/);

// The original code iterates through tokens starting from the second one (index 1),
// including any empty strings that result from multiple spaces or leading/trailing whitespace.
const tokensForProcessing = allInputTokens.slice(1);

tokensForProcessing.forEach(currentLexeme => {
    // Convert the current token into an array of characters and sort them alphabetically.
    // Using Array.from() instead of split('') for character array creation.
    const orderedCharacterArray = Array.from(currentLexeme).sort();

    // To replicate the original's `eval` behavior with `a.reverse().join("")` twice:
    // The first `a.reverse()` modifies `a` in place and returns the reversed array.
    // The second `a.reverse()` then operates on the *already reversed* array,
    // effectively reversing it back to its original sorted state.

    // First part of the output string: sorted characters, then reversed, then joined.
    // We use .slice() to create a shallow copy before reversing,
    // so the original `orderedCharacterArray` remains sorted for the next step.
    const firstOutputSegment = orderedCharacterArray.slice().reverse().join('');

    // Second part of the output string: the array that was reversed by the first operation
    // is then reversed *again*. This brings it back to the sorted state.
    // So, this is equivalent to just joining the original sorted characters.
    const secondOutputSegment = orderedCharacterArray.join('');

    // Output the concatenated string with a hyphen.
    console.log(`${firstOutputSegment}-${secondOutputSegment}`);
});
