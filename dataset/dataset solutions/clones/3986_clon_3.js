function checkNumericPalindrome(valueToCheck) {
    const stringRepresentation = String(valueToCheck);
    const charArray = Array.from(stringRepresentation);
    const reversedCharArray = [...charArray].reverse();
    return charArray.join("") === reversedCharArray.join("");
}

function processRangeData(inputLines) {
    const SPACE_DELIMITER = " ";
    const firstLineContent = inputLines[0];

    const parts = firstLineContent.split(SPACE_DELIMITER);
    const rangeStart = parseInt(parts[0], 10);
    const rangeEnd = parseInt(parts[1], 10);

    let totalPalindromes = 0;

    for (let currentValue = rangeStart; currentValue <= rangeEnd; currentValue++) {
        if (checkNumericPalindrome(currentValue)) {
            totalPalindromes++;
        }
    }
    console.log(totalPalindromes);
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const allInputLines = fileContent.split("\n");
processRangeData(allInputLines);
