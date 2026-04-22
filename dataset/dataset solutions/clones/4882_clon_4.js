const processSequenceData = (incomingText) => {
    const linesOfText = incomingText.split('\n');
    const numericElements = linesOfText[1].split(' ').map(Number);

    const computationResult = numericElements.reduce((state, currentElement) => {
        const updatedLowest = Math.min(state.lowestSeenYet, currentElement);
        const potentialMargin = currentElement - updatedLowest;

        let newGreatestMargin = state.greatestMarginFound;
        let newCountForMargin = state.countOfGreatestMargin;

        if (potentialMargin > newGreatestMargin) {
            newGreatestMargin = potentialMargin;
            newCountForMargin = 1;
        } else if (potentialMargin === newGreatestMargin) {
            newCountForMargin++;
        }

        return {
            lowestSeenYet: updatedLowest,
            greatestMarginFound: newGreatestMargin,
            countOfGreatestMargin: newCountForMargin
        };
    }, { lowestSeenYet: Infinity, greatestMarginFound: 0, countOfGreatestMargin: 0 });

    return computationResult.countOfGreatestMargin;
};

const rawSystemInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const finalOutputValue = processSequenceData(rawSystemInput);
console.log(String(finalOutputValue));