function extractDigitSequences(textInput) {
    const numericalValues = [];
    let currentSequence = '';
    let readingNumber = false;

    for (let charIndex = 0; charIndex < textInput.length; charIndex++) {
        const char = textInput.charAt(charIndex);
        if (char >= '0' && char <= '9') {
            currentSequence += char;
            readingNumber = true;
        } else {
            if (readingNumber) {
                numericalValues.push(Number(currentSequence));
                currentSequence = '';
                readingNumber = false;
            }
        }
    }
    if (readingNumber) { 
        numericalValues.push(Number(currentSequence));
    }
    return numericalValues;
}

function Main() {
    const inputDatum = next();
    const processedNumbers = extractDigitSequences(inputDatum);

    const quantity = processedNumbers[0];
    const unitCost = processedNumbers[1];
    const budget = processedNumbers[2];

    const totalCost = quantity * unitCost;
    let finalSelection;

    if (budget < totalCost) {
        finalSelection = budget;
    } else {
        finalSelection = totalCost;
    }

    console.log(finalSelection);
}