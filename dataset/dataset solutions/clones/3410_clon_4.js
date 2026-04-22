function processInputText(textData) {
    let numericalEntities = [];
    let currentNumericalString = '';
    let isCurrentlyNegative = false;
    let omitFirst = true; 

    for (let charIndex = 0; charIndex < textData.length; charIndex++) {
        const character = textData[charIndex];

        if (character === '-') {
            isCurrentlyNegative = true;
        } else if (character >= '0' && character <= '9') {
            currentNumericalString += character;
        } else if (character === '\n' || character === '\r' || charIndex === textData.length - 1) {
            if (charIndex === textData.length - 1 && character >= '0' && character <= '9') {
                currentNumericalString += character;
            }

            if (currentNumericalString.length > 0) {
                if (omitFirst) {
                    omitFirst = false; 
                } else {
                    let value = Number(currentNumericalString);
                    if (isCurrentlyNegative) {
                        value = -value;
                    }
                    numericalEntities.push(value);
                }
            }
            currentNumericalString = '';
            isCurrentlyNegative = false;
        }
    }

    if (currentNumericalString.length > 0 && !omitFirst) {
        let value = Number(currentNumericalString);
        if (isCurrentlyNegative) {
            value = -value;
        }
        numericalEntities.push(value);
    }

    if (numericalEntities.length === 0) {
        console.log(0);
        return;
    }

    let largestFound = -Infinity;
    let largestPosition = -1;

    for (let i = 0; i < numericalEntities.length; i++) {
        if (numericalEntities[i] > largestFound) {
            largestFound = numericalEntities[i];
            largestPosition = i;
        }
    }

    if (largestPosition !== -1) {
        numericalEntities[largestPosition] = numericalEntities[largestPosition] / 2;
    }

    let totalAccumulation = 0;
    for (let i = 0; i < numericalEntities.length; i++) {
        totalAccumulation += numericalEntities[i];
    }

    console.log(totalAccumulation);
}

processInputText(require('fs').readFileSync('/dev/stdin', 'utf8'));