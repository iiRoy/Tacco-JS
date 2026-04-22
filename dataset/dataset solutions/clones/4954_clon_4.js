function processDataEntry(dataString) {
    const numberSequenceMatch = dataString.match(/\n([\d\s]+)$/);

    if (!numberSequenceMatch || !numberSequenceMatch[1]) {
        console.log(0);
        return;
    }

    const rawNumbersText = numberSequenceMatch[1].trim();

    const numericCollection = [];
    let digitBuffer = '';
    for (let position = 0; position < rawNumbersText.length; position++) {
        const character = rawNumbersText[position];
        if (character === ' ') {
            if (digitBuffer !== '') {
                numericCollection.push(Number(digitBuffer));
                digitBuffer = '';
            }
        } else {
            digitBuffer += character;
        }
    }
    if (digitBuffer !== '') {
        numericCollection.push(Number(digitBuffer));
    }

    const qualifyingElements = numericCollection.filter((currentValue, currentIndex, entireCollection) => {
        const targetPosition = currentValue - 1;
        const expectedValue = currentIndex + 1;
        
        return entireCollection[targetPosition] === expectedValue;
    });

    const finalResult = qualifyingElements.length / 2;

    console.log(finalResult);
}

processDataEntry(require("fs").readFileSync("/dev/stdin", "utf8"));