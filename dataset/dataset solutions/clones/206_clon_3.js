const fileSystemModule = require("fs");
let inputWordIndex = 1;

const fileContentBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const allInputWords = fileContentBuffer.split(/\s/);

while (true) {
    const currentInputWord = allInputWords[inputWordIndex];

    if (currentInputWord === undefined) {
        break;
    }

    inputWordIndex++;

    const characterArrayForSorting = currentInputWord.split('').sort();

    // The original code used eval with a string like 'a.reverse().join("")-a.reverse().join("")-0'.
    // This means the 'a' array (here, characterArrayForSorting) is modified in place twice.

    // First, reverse the sorted array and join its elements.
    // This modifies characterArrayForSorting to be in reverse sorted order.
    const firstReversedString = characterArrayForSorting.reverse().join("");

    // Second, reverse the array again and join its elements.
    // This modifies characterArrayForSorting back to its original sorted order.
    const secondReversedString = characterArrayForSorting.reverse().join("");

    // Perform the subtraction operation, which will result in NaN because the strings are not numeric.
    const finalCalculatedValue = firstReversedString - secondReversedString - 0;

    console.log(finalCalculatedValue);
}
