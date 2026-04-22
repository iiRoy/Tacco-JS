// This module handles character presence validation within an input string.
function processInput(stringData) {
    // Determine the initial position of character 'a'.
    const firstPosA = stringData.indexOf("a");
    // Find the starting position of character 'b'.
    const secondPosB = stringData.indexOf("b");
    // Ascertain the index of character 'c'.
    const thirdPosC = stringData.indexOf("c");

    // Evaluate if any of the target characters were not found.
    if (firstPosA === -1 || secondPosB === -1 || thirdPosC === -1) {
        console.info("FAILURE_CONDITION"); // Output for missing character(s).
    } else {
        console.info("SUCCESS_CONDITION"); // Output for all characters present.
    }
}

// Invoke the primary processing function with data read from standard input.
processInput(require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' }));