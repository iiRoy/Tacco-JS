var fileSystemAccess = require('fs');

function createLexicographicStrings(targetSequenceLength) {
    const generatedResults = [];
    const processingUnitStack = [];

    // Initial state: empty prefix, depth 0, highest allowed char index 0 ('a' is the only option)
    // State object: { currentChars: character[], currentDepth: number, nextCharCeiling: number }
    // nextCharCeiling is the maximum character index (0 for 'a', 1 for 'b', etc.) that can be used for the current position.
    processingUnitStack.push({ currentChars: [], currentDepth: 0, nextCharCeiling: 0 });

    while (processingUnitStack.length > 0) {
        const currentContext = processingUnitStack.pop();

        if (currentContext.currentDepth === targetSequenceLength) {
            generatedResults.push(currentContext.currentChars.join(''));
            continue;
        }

        // Iterate from the highest allowed character index down to 'a' (index 0).
        // This ensures that when states are pushed to the stack, the state corresponding
        // to 'a' (index 0) is pushed last and thus processed first,
        // maintaining the lexicographical order of output consistent with the original recursive DFS.
        for (let charIndexValue = currentContext.nextCharCeiling; charIndexValue >= 0; --charIndexValue) {
            const nextCharacterSequence = [...currentContext.currentChars, String.fromCharCode('a'.charCodeAt(0) + charIndexValue)];
            
            // The new character ceiling for the next depth is the maximum of the current
            // ceiling and the chosen character's index plus one.
            const newNextCharCeiling = Math.max(currentContext.nextCharCeiling, charIndexValue + 1);

            processingUnitStack.push({
                currentChars: nextCharacterSequence,
                currentDepth: currentContext.currentDepth + 1,
                nextCharCeiling: newNextCharCeiling
            });
        }
    }

    return generatedResults;
}

function executeStringGeneration(inputContent) {
    const numericInput = parseInt(inputContent.trim(), 10);
    const finalSequences = createLexicographicStrings(numericInput);

    for (const sequenceOutput of finalSequences) {
        console.log(sequenceOutput);
    }
}

// Standard input/output handling for Node.js environment
if (require.main === module) {
    const inputData = fileSystemAccess.readFileSync("/dev/stdin", "utf8");
    executeStringGeneration(inputData);
}