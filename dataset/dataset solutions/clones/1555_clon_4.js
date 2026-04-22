const initialInputString = `4
141421356 17320508 22360679 244949`;

const parsedTokens = initialInputString.match(/\d+/g).map(val => Number(val));
const elementCount = parsedTokens[0];
const numericSequence = parsedTokens.slice(1);

const modulusValue = 1000000007n;

const multiplyAndModulo = (valOne, valTwo) => {
    const bigValOne = BigInt(valOne);
    const bigValTwo = BigInt(valTwo);
    return (bigValOne * bigValTwo) % modulusValue;
};

const finalComputation = numericSequence.reduce((accumulatorPair, currentElementValue, currentIndexPosition) => {
    let [runningTotalOfPrevious, overallAccumulatedSum] = accumulatorPair;

    if (currentIndexPosition === 0) {
        runningTotalOfPrevious = (runningTotalOfPrevious + BigInt(currentElementValue)) % modulusValue;
    } else {
        const currentProductTerm = multiplyAndModulo(runningTotalOfPrevious, currentElementValue);
        overallAccumulatedSum = (overallAccumulatedSum + currentProductTerm) % modulusValue;
        runningTotalOfPrevious = (runningTotalOfPrevious + BigInt(currentElementValue)) % modulusValue;
    }
    return [runningTotalOfPrevious, overallAccumulatedSum];
}, [0n, 0n]);

console.log(Number(finalComputation[1]));