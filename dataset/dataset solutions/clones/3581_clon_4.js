const obtainOutcome = (entryData) => {
    const trimmedEntry = entryData.replace(/^\s+|\s+$/g, '');

    const newlinePosition = trimmedEntry.indexOf('\n');
    const initialSegment = (newlinePosition === -1) ? trimmedEntry : trimmedEntry.substring(0, newlinePosition);

    let parsedValues = [];
    let currentSegment = initialSegment;
    let separatorLoc;

    while (parsedValues.length < 2 && (separatorLoc = currentSegment.indexOf(' ')) !== -1) {
        const numberStr = currentSegment.substring(0, separatorLoc).trim();
        parsedValues.push(Number(numberStr));
        currentSegment = currentSegment.substring(separatorLoc + 1);
    }
    
    if (parsedValues.length < 2) {
        const finalNumStr = currentSegment.trim();
        if (finalNumStr !== '' || parsedValues.length === 0) {
             parsedValues.push(Number(finalNumStr));
        }
    }

    const firstQuantity = parsedValues[0];
    const secondQuantity = parsedValues[1];

    const performSubtraction = (val1, val2) => val1 - val2;
    const performIncrement = (val) => val + 1;

    return performIncrement(performSubtraction(firstQuantity, secondQuantity));
};

const mainExecutor = () => {
    const inputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const finalResult = obtainOutcome(inputContent);
    console.log(finalResult);
};

mainExecutor();