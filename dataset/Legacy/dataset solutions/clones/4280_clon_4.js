var inputLines = [];
var lineReader = require('readline');

var interfaceInstance = lineReader.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceInstance.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

interfaceInstance.on('close', function () {
    const sourceChars = inputLines[0].split("");
    const targetChars = inputLines[1].split("");

    let bestMatchStart = -1;

    // Core logic for finding the rightmost match:
    // Instead of an imperative loop iterating from right to left with breaks,
    // we generate all possible starting positions, filter them based on the match condition,
    // and then select the maximum (rightmost) valid starting position.
    if (targetChars.length <= sourceChars.length) {
        const possibleStartIndices = Array.from({ length: sourceChars.length - targetChars.length + 1 }, (_, index) => index);

        const confirmedMatches = possibleStartIndices.filter(startPosition => {
            // For each potential starting position, check if the substring matches the target.
            // This replaces the inner imperative loop with a functional 'every' method.
            return targetChars.every((targetChar, targetIndex) => {
                const sourceChar = sourceChars[startPosition + targetIndex];
                return targetChar === sourceChar || sourceChar === '?';
            });
        });

        if (confirmedMatches.length > 0) {
            bestMatchStart = Math.max(...confirmedMatches);
        }
    }

    // Core logic for constructing the output string:
    // Instead of an imperative loop with conditional assignments and index manipulation,
    // we use a 'map' operation to transform each character of the source string.
    if (bestMatchStart === -1) {
        console.log("UNRESTORABLE");
    } else {
        const finalStringComponents = sourceChars.map((originalChar, charPosition) => {
            // If the current character's position falls within the identified match segment,
            // replace it with the corresponding character from the target string.
            if (charPosition >= bestMatchStart && charPosition < bestMatchStart + targetChars.length) {
                return targetChars[charPosition - bestMatchStart];
            } else {
                // Otherwise, if the character is '?', replace it with 'a';
                // otherwise, keep the original character.
                return originalChar === '?' ? 'a' : originalChar;
            }
        });
        console.log(finalStringComponents.join(""));
    }
});
