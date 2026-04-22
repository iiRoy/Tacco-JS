const processDataStream = (inputChunk) => {
    const cleanedChunk = inputChunk.replace(/^\s+|\s+$/g, '');

    let firstLineContent = '';
    let secondLineContent = '';
    let newlineEncountered = false;
    let temporaryStorage = [];

    for (let currentIdx = 0; currentIdx < cleanedChunk.length; currentIdx++) {
        const character = cleanedChunk[currentIdx];
        if (character === '\n') {
            firstLineContent = temporaryStorage.join('');
            temporaryStorage = [];
            newlineEncountered = true;
            continue;
        }
        if (newlineEncountered) {
            temporaryStorage.push(character);
        } else {
            temporaryStorage.push(character);
        }
    }
    secondLineContent = temporaryStorage.join('');

    const numericCriterion = +firstLineContent;
    const comparisonValue = 0x0C80; // Decimal 3200 in hexadecimal

    let outcomeMessage;
    if (numericCriterion >= comparisonValue) {
        outcomeMessage = secondLineContent;
    } else {
        outcomeMessage = "red";
    }

    return outcomeMessage;
};

const acquireInput = () => require('fs').readFileSync('/dev/stdin', 'utf8');
const computedResult = processDataStream(acquireInput());
console.log(computedResult);