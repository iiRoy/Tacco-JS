function processInputData(dataString) {
    let currentTotal = 0;
    let countedItems = 0;
    let tempNumberBuffer = "";

    // Append a space to ensure the last number in the string is processed
    const paddedString = dataString + " ";

    for (let charIndex = 0; charIndex < paddedString.length; ++charIndex) {
        const currentCharacter = paddedString[charIndex];

        // Check if the character is a digit or a minus sign at the start of a potential number
        if ((currentCharacter >= '0' && currentCharacter <= '9') || (currentCharacter === '-' && tempNumberBuffer.length === 0)) {
            tempNumberBuffer += currentCharacter;
        } else if (/\s/.test(currentCharacter)) { // Check if the character is whitespace
            if (tempNumberBuffer.length > 0) {
                // Parse the accumulated buffer as an integer, matching original parseInt behavior
                const valueAsInteger = parseInt(tempNumberBuffer, 10);
                currentTotal += valueAsInteger;
                countedItems++;
                tempNumberBuffer = ""; // Reset buffer for the next number
            }
            // If it's whitespace and the buffer is empty, just continue (handles multiple spaces)
        } else {
            // For any other non-digit, non-whitespace character, accumulate it
            // This allows parseInt to handle cases like "123a" -> 123, or "1.5" -> 1
            tempNumberBuffer += currentCharacter;
        }
    }

    if (countedItems === 0) {
        // If no valid numbers were found, result should be NaN, matching original
        console.log(NaN);
    } else {
        console.log(Math.ceil(currentTotal / countedItems));
    }
}

const fileSystemAccess = require("node:fs");
const sourcePath = "/dev/stdin";
const rawPayload = fileSystemAccess.readFileSync(sourcePath, "utf8");

processInputData(rawPayload);