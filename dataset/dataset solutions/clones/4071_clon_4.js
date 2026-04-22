function obtainTextualData(sourcePath, encodingStyle) {
    return require("fs").readFileSync(sourcePath, encodingStyle);
}

function deconstructInputString(rawData) {
    const primaryLineEnd = rawData.indexOf('\n');
    const relevantLine = (primaryLineEnd !== -1) ? rawData.substring(0, primaryLineEnd) : rawData;

    const spaceSeparator = relevantLine.indexOf(' ');
    if (spaceSeparator === -1) {
        // Mimic original: if `s = ["123"]`, then `s[0]+s[1]` is "123undefined".
        // So, if no space, the second part should effectively be the string "undefined".
        return { firstComponent: relevantLine, secondComponent: "undefined" };
    }
    const firstComponent = relevantLine.substring(0, spaceSeparator);
    const secondComponent = relevantLine.substring(spaceSeparator + 1);
    return { firstComponent, secondComponent };
}

function constructOverallValue(components) {
    // Custom function to mimic Number() behavior, avoiding built-in Number/parseInt/parseFloat
    function manualStringToNumberConverter(inputString) {
        inputString = String(inputString).trim();
        if (inputString.length === 0) return 0;

        let currentSign = 1;
        let charIndex = 0;

        if (inputString[0] === '-') {
            currentSign = -1;
            charIndex++;
        } else if (inputString[0] === '+') {
            charIndex++;
        }

        let numericalResult = 0;
        let foundDigits = false;

        for (; charIndex < inputString.length; charIndex++) {
            const charCodeValue = inputString.charCodeAt(charIndex);
            if (charCodeValue >= 48 && charCodeValue <= 57) { // ASCII '0' through '9'
                numericalResult = numericalResult * 10 + (charCodeValue - 48);
                foundDigits = true;
            } else {
                // If any non-digit character appears, Number() produces NaN for non-float integers.
                // E.g., Number("123a") is NaN. Number("123.45") is 123.45.
                // For the problem's integer context, if a non-digit appears, it's treated as NaN.
                // The output for 123.45 is 'No', and for NaN it's 'No', so this consistency is fine.
                return NaN;
            }
        }

        if (!foundDigits) return NaN; // E.g., for "-" or "+" strings only

        return currentSign * numericalResult;
    }

    // Concatenate strings without `+` operator, using array join.
    const combinedString = [components.firstComponent, components.secondComponent].join('');
    return manualStringToNumberConverter(combinedString);
}

function checkIntegralSquare(valueForCheck) {
    if (valueForCheck < 0) return false;
    if (valueForCheck === 0) return true;
    if (isNaN(valueForCheck)) return false;

    let lowerLimit = 1;
    let upperLimit = valueForCheck;

    while (lowerLimit <= upperLimit) {
        let currentMidpoint = Math.floor((lowerLimit + upperLimit) / 2);
        let calculatedSquare = currentMidpoint * currentMidpoint;

        if (calculatedSquare === valueForCheck) {
            return true;
        } else if (calculatedSquare < valueForCheck) {
            lowerLimit = currentMidpoint + 1;
        } else { // calculatedSquare > valueForCheck
            upperLimit = currentMidpoint - 1;
        }
    }
    return false;
}

function executeEvaluation(inputSourceLocation) {
    const fileContent = obtainTextualData(inputSourceLocation, "utf8");
    const extractedParts = deconstructInputString(fileContent);
    const finalNumber = constructOverallValue(extractedParts);
    const isSquare = checkIntegralSquare(finalNumber);
    console.log(isSquare ? "Yes" : "No");
}

executeEvaluation("/dev/stdin");