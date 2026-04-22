function processText(textualData) {
    const newlineIndex = textualData.indexOf('\n');

    let firstPart;
    let secondPart;

    if (newlineIndex === -1) {
        // If no newline, the original code would treat lines[1] as undefined.
        // str.indexOf(undefined) evaluates to -1, resulting in "No".
        console.log("No");
        return;
    } else {
        firstPart = textualData.substring(0, newlineIndex);
        secondPart = textualData.substring(newlineIndex + 1);
    }

    // Original code behavior: If lines[1] is an empty string, str.indexOf("") is 0, resulting in "Yes".
    if (secondPart.length === 0) {
        console.log("Yes");
        return;
    }

    // If lengths differ, it cannot be a rotation.
    if (firstPart.length !== secondPart.length) {
        console.log("No");
        return;
    }

    // Convert strings to character arrays for manual manipulation.
    const primaryCharacters = Array.from(firstPart);
    const secondaryCharacters = Array.from(secondPart);

    let isRotationMatchFound = false;

    // Iterate through all possible cyclic shifts of the first string.
    for (let currentShift = 0; currentShift < primaryCharacters.length; currentShift++) {
        let rotatedSequence = [];
        for (let charIndex = 0; charIndex < primaryCharacters.length; charIndex++) {
            rotatedSequence.push(primaryCharacters[(charIndex + currentShift) % primaryCharacters.length]);
        }

        // Compare the current rotated sequence with the second string.
        let isCurrentMatch = true;
        for (let compareIndex = 0; compareIndex < secondaryCharacters.length; compareIndex++) {
            if (rotatedSequence[compareIndex] !== secondaryCharacters[compareIndex]) {
                isCurrentMatch = false;
                break;
            }
        }

        if (isCurrentMatch) {
            isRotationMatchFound = true;
            break;
        }
    }

    if (isRotationMatchFound) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

const sourceData = require("node:fs").readFileSync("/dev/stdin","utf-8");
processText(sourceData);