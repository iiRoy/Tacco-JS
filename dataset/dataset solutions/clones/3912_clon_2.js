'use strict';

// This function processes the provided input string.
function ProcessInput(rawData) {
    // Split the input string into an array of individual characters.
    const charArray = rawData.split("");

    // Check if all three characters are distinct.
    // If charArray[0] is not equal to charArray[1], AND
    // if charArray[0] is not equal to charArray[2], AND
    // if charArray[1] is not equal to charArray[2],
    // then all characters are unique.
    const areAllDifferent = charArray[0] !== charArray[1] && charArray[0] !== charArray[2] && charArray[1] !== charArray[2];

    // Output "Yes" if all characters are distinct, otherwise output "No".
    console.log(areAllDifferent ? "Yes" : "No");
}

// Read the input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
