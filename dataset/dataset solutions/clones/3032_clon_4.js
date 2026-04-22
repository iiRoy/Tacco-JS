function obtainWholeNumber(textSegment) {
    let numericalValue = 0;
    let signModifier = 1;
    let currentPosition = 0;

    while (currentPosition < textSegment.length && textSegment[currentPosition] === ' ') {
        currentPosition++;
    }

    if (textSegment[currentPosition] === '-') {
        signModifier = -1;
        currentPosition++;
    } else if (textSegment[currentPosition] === '+') {
        currentPosition++;
    }

    let digitEncountered = false;
    while (currentPosition < textSegment.length) {
        const charOrdinal = textSegment.charCodeAt(currentPosition);
        if (charOrdinal >= 48 && charOrdinal <= 57) {
            numericalValue = numericalValue * 10 + (charOrdinal - 48);
            digitEncountered = true;
        } else {
            break;
        }
        currentPosition++;
    }

    if (!digitEncountered) return NaN;
    return signModifier * numericalValue;
}

function processInput(inputData) {
    const rawSegments = inputData.split(' ');
    const numeralCollection = rawSegments.map(obtainWholeNumber);

    const itemOne = numeralCollection[0];
    const itemTwo = numeralCollection[1];
    const itemThree = numeralCollection[2];

    const outcomeMap = ['No', 'Yes'];

    const decisionCondition = (itemThree >= itemTwo) || (itemOne <= itemThree && itemThree < itemTwo);

    const verdictIndex = decisionCondition ? 1 : 0;

    console.log(outcomeMap[verdictIndex]);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));