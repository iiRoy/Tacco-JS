const sourceText = require('fs').readFileSync('/dev/stdin', 'utf8');
const textLines = sourceText.split('\n');
const inputString = textLines.shift();

let resultString = '';

if (inputString.length === 26) {
    let matchFound = false;
    let nextCandidate = '';

    // Iterate from the end of the input string backwards, using Array.from and .some for control flow
    Array.from({ length: inputString.length }, (_, currentIdxOffset) => inputString.length - 1 - currentIdxOffset)
        .some(currentIdx => {
            const prefixPart = inputString.substring(0, currentIdx);
            
            // Collect characters from the current index to the end, then sort them lexicographically
            const suffixElements = Array.from(inputString.substring(currentIdx)).sort();

            // Iterate through the sorted suffix characters, using .some for early exit
            return suffixElements.some(charFromSuffix => {
                const potentialResult = prefixPart + charFromSuffix;
                if (potentialResult > inputString) {
                    nextCandidate = potentialResult;
                    matchFound = true;
                    return true; // Break the inner .some loop
                }
                return false;
            });
        });

    if (matchFound) {
        resultString = nextCandidate;
    } else {
        resultString = -1;
    }

} else {
    // Use a Set to efficiently track characters present in the input string
    const presentLetters = new Set(inputString);
    let firstMissingChar = '';

    // Generate an array of lowercase English alphabet characters ('a' through 'z')
    const alphabetChars = Array.from({ length: 26 }, (_, k) => String.fromCharCode(97 + k)); // ASCII 'a' is 97

    // Find the first character in the alphabet that is not present in the input string
    const foundMissing = alphabetChars.some(char => {
        if (!presentLetters.has(char)) {
            firstMissingChar = char;
            return true; // Break the .some loop once the first missing character is found
        }
        return false;
    });

    if (!foundMissing) {
        // If all 'a' through 'z' are present in the input string, the original code appends 'z'
        firstMissingChar = 'z';
    }
    
    resultString = inputString + firstMissingChar;
}

console.log(resultString);
