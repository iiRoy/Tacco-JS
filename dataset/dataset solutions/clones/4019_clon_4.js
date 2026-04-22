process.stdin.setEncoding('utf8');

const acquireData = (handler) => {
    let collectedData = '';
    process.stdin.on('data', (segment) => {
        collectedData += segment.toString();
    });
    process.stdin.on('end', () => {
        const initialElement = collectedData.trim().split(/\s+/)[0];
        handler(initialElement);
    });
    process.stdin.resume();
};

const extractExtent = (phrase) => phrase.length;
const decrementValue = (figure) => figure - 1;
const scaleByNine = (amount) => amount * 9;
const retrieveLeadCharacter = (phrase) => phrase.charAt(0);
const interpretAsNumeric = (symbol) => parseInt(symbol, 10);
const sumComponents = (componentA, componentB) => componentA + componentB;

const processEntry = (sourceDatum) => {
    const adjustedExtent = decrementValue(extractExtent(sourceDatum));
    const adjustedLeadDigit = decrementValue(interpretAsNumeric(retrieveLeadCharacter(sourceDatum)));

    const firstQuantity = scaleByNine(adjustedExtent);
    const secondQuantity = adjustedLeadDigit;

    return sumComponents(firstQuantity, secondQuantity);
};

acquireData((incomingText) => {
    const finalOutcome = processEntry(incomingText);
    console.log(finalOutcome);
});