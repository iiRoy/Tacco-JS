const processData = (rawContent) => {
    let charIndex = 0;
    let currentNumberString = '';
    const collectedNumbers = [];
    const sourceLength = rawContent.length;

    while (charIndex <= sourceLength) {
        const charCode = (charIndex < sourceLength) ? rawContent.charCodeAt(charIndex) : -1; // -1 for end of string
        if (charCode >= 48 && charCode <= 57) { // Is a digit (ASCII '0' through '9')
            currentNumberString += rawContent[charIndex];
        } else { // Not a digit or end of string
            if (currentNumberString.length > 0) {
                collectedNumbers.push(Number(currentNumberString));
                currentNumberString = '';
                if (collectedNumbers.length === 2) { // We only need two numbers
                    break;
                }
            }
        }
        charIndex++;
    }

    const firstValue = collectedNumbers[0];
    const secondValue = collectedNumbers[1];

    // Functional check for number range without 'if'
    const validateBoundary = (num) => (num >= 1) && (num <= 10);

    // Combine all conditions into a single truthy/falsy value (1 or 0)
    // This replaces 'if' statements and handles edge cases like insufficient numbers or non-numeric input
    const evaluationScore = (
        (collectedNumbers.length === 2) &&
        (!Number.isNaN(firstValue)) &&
        (!Number.isNaN(secondValue)) &&
        validateBoundary(firstValue) &&
        validateBoundary(secondValue)
    ) ? 1 : 0;

    // Use an object as a lookup table for the final outcome
    const outcomeRegistry = {
        0: -1, // If any condition failed
        1: firstValue * secondValue // If all conditions passed
    };

    return outcomeRegistry[evaluationScore];
};

console.log(processData(require('fs').readFileSync('/dev/stdin', 'utf8')));