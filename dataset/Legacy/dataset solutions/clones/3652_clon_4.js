function processNumericInput(rawData) {
    const cleanedData = rawData.trim();
    const stringParts = cleanedData.split(" ");

    const numericValues = [
        +stringParts[0],
        +stringParts[1],
        +stringParts[2]
    ];

    numericValues.sort((firstElement, secondElement) => firstElement - secondElement);

    const rangeDifference = numericValues[2] - numericValues[0];

    console.log(rangeDifference);
}

processNumericInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
