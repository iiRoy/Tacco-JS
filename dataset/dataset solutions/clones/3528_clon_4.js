const parseNumericLine = (textLine) => {
    const numeralSequence = [];
    let currentDigitString = "";
    for (let charIndex = 0; charIndex < textLine.length; charIndex++) {
        const character = textLine[charIndex];
        if (character === ' ') {
            if (currentDigitString.length > 0) {
                numeralSequence.push(Number(currentDigitString));
                currentDigitString = "";
            }
        } else {
            currentDigitString += character;
        }
    }
    if (currentDigitString.length > 0) {
        numeralSequence.push(Number(currentDigitString));
    }
    return numeralSequence;
};

const determineHighestValue = (collectionOfNumbers) => {
    if (collectionOfNumbers.length === 0) {
        return Number.NEGATIVE_INFINITY;
    }
    let maximumAchieved = collectionOfNumbers[0];
    for (let k = 1; k < collectionOfNumbers.length; k++) {
        if (collectionOfNumbers[k] > maximumAchieved) {
            maximumAchieved = collectionOfNumbers[k];
        }
    }
    return maximumAchieved;
};

const determineLowestValue = (collectionOfNumbers) => {
    if (collectionOfNumbers.length === 0) {
        return Number.POSITIVE_INFINITY;
    }
    let minimumAchieved = collectionOfNumbers[0];
    for (let k = 1; k < collectionOfNumbers.length; k++) {
        if (collectionOfNumbers[k] < minimumAchieved) {
            minimumAchieved = collectionOfNumbers[k];
        }
    }
    return minimumAchieved;
};

const evaluateWorldCondition = (inputPayload) => {
    const contentLines = inputPayload.split('\n');

    const firstParsedComponent = parseNumericLine(contentLines[0]);
    const limitAlpha = firstParsedComponent[2]; // Corresponds to original X
    const limitBeta = firstParsedComponent[3];   // Corresponds to original Y

    const alphaValues = parseNumericLine(contentLines[1]); // Corresponds to original x
    const betaValues = parseNumericLine(contentLines[2]);   // Corresponds to original y

    // Create new arrays with additional limits using spread syntax
    const augmentedAlphaValues = [...alphaValues, limitAlpha];
    const augmentedBetaValues = [...betaValues, limitBeta];

    const greatestAlpha = determineHighestValue(augmentedAlphaValues);
    const smallestBeta = determineLowestValue(augmentedBetaValues);

    const outcomeMessage = greatestAlpha < smallestBeta ? 'No War' : 'War';
    console.log(outcomeMessage);
};

evaluateWorldCondition(require('fs').readFileSync('/dev/stdin', 'utf8'));