const getFileHandle = require('fs');
const stdinDescriptor = 0;
const encodingFormat = 'utf8';

const sourceText = getFileHandle.readFileSync(stdinDescriptor, encodingFormat);
const filteredContent = sourceText.split(',').join('').trim();
const wordFragments = filteredContent.split(/\s+/);

const startingPoint = {
    workingPhrase: '',
    resultCollection: []
};

const checkPunctuationPresence = (piece) => piece.replace(/\./g, '').length < piece.length;
const checkTrailingPunctuation = (piece) => piece.endsWith('.');
const checkBaseLengthValidity = (piece) => {
    const len = piece.replace(/\./g, '').length;
    return len >= 3 && len <= 6;
};
const checkFullLengthValidity = (piece) => piece.length >= 3 && piece.length <= 6;

const evaluateFragment = (stateInfo, itemPiece) => {
    let currentWorkingPhrase = stateInfo.workingPhrase;
    let currentResultCollection = [...stateInfo.resultCollection];

    const cleanedItem = itemPiece.replace(/\./g, '');

    if (checkPunctuationPresence(itemPiece)) {
        if (checkBaseLengthValidity(itemPiece)) {
            if (checkTrailingPunctuation(itemPiece)) {
                currentWorkingPhrase += cleanedItem;
                currentResultCollection.push(currentWorkingPhrase);
            } else {
                currentWorkingPhrase += itemPiece;
            }
        } else {
            currentWorkingPhrase = '';
        }
    } else {
        if (checkFullLengthValidity(itemPiece)) {
            currentWorkingPhrase += itemPiece + ' ';
        } else {
            currentWorkingPhrase = '';
        }
    }

    return {
        workingPhrase: currentWorkingPhrase,
        resultCollection: currentResultCollection
    };
};

const ultimateOutcome = wordFragments.reduce(evaluateFragment, startingPoint);

ultimateOutcome.resultCollection.forEach(finalOutputLine => {
    console.log(finalOutputLine);
});