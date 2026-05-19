const LOWERCASE_A_CODE = 97;
const LOWERCASE_Z_CODE = 122;
const UPPERCASE_A_CODE = 65;
const UPPERCASE_Z_CODE = 90;
const CASE_DIFFERENCE = 32;

function transformCharacterCase(singleChar) {
    let charNumericCode = singleChar.charCodeAt(0);

    if (charNumericCode >= LOWERCASE_A_CODE && charNumericCode <= LOWERCASE_Z_CODE) {
        // It's a lowercase letter, convert to uppercase
        return String.fromCharCode(charNumericCode - CASE_DIFFERENCE);
    } else if (charNumericCode >= UPPERCASE_A_CODE && charNumericCode <= UPPERCASE_Z_CODE) {
        // It's an uppercase letter, convert to lowercase
        return String.fromCharCode(charNumericCode + CASE_DIFFERENCE);
    } else {
        // Not an English alphabet character, return as is
        return singleChar;
    }
}

process.stdin.on("data", function(inputBuffer) {
    let bufferAsString = String(inputBuffer);
    let trimmedInput = bufferAsString.trim();
    let characterArray = trimmedInput.split("");

    let mappedCharacters = characterArray.map(function(currentElement) {
        return transformCharacterCase(currentElement);
    });

    let finalResultString = mappedCharacters.join("");
    console.log(finalResultString);
});

process.stdin.resume();
