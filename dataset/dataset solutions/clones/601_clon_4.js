process.stdin.resume();
process.stdin.setEncoding('utf8');

const computeFinalResult = (inputPayload) => {
    const extractNumericalElements = inputPayload.split('\n').reduce((accumulator, lineText) => {
        const numericalConversion = Number(lineText);
        if (numericalConversion !== 0) {
            accumulator.push(numericalConversion);
        }
        return accumulator;
    }, []);

    let initialValues = [];
    let subsequentValues = [];
    let currentPosition = 0;

    const quantityOne = 3;
    const quantityTwo = 2;

    for (let i = 0; i < quantityOne && currentPosition < extractNumericalElements.length; i++) {
        initialValues.push(extractNumericalElements[currentPosition]);
        currentPosition++;
    }

    for (let i = 0; i < quantityTwo && currentPosition < extractNumericalElements.length; i++) {
        subsequentValues.push(extractNumericalElements[currentPosition]);
        currentPosition++;
    }

    const findTheSmallestElement = (valueList) => {
        if (valueList.length === 0) {
            return Infinity;
        }
        return valueList.reduce((currentSmallest, item) => {
            if (isNaN(currentSmallest) || isNaN(item)) {
                return NaN;
            }
            return (item < currentSmallest) ? item : currentSmallest;
        });
    };

    const firstMinimumValue = findTheSmallestElement(initialValues);
    const secondMinimumValue = findTheSmallestElement(subsequentValues);

    const constantOffset = 50;
    const interimTotal = firstMinimumValue + secondMinimumValue;
    const finalOutcome = interimTotal - constantOffset;

    return finalOutcome;
};

let accumulatedInput = '';

process.stdin.on('data', function (receivedChunk) {
    accumulatedInput += receivedChunk.toString();
});

process.stdin.on('end', function () {
    const calculatedAnswer = computeFinalResult(accumulatedInput);
    console.log(calculatedAnswer);
});