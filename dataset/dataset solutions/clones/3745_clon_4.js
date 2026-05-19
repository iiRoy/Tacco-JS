'use strict';

const processInputData = (fullTextContent) => {
    const newlinePosition = fullTextContent.indexOf('\n');
    const firstLineSegment = newlinePosition !== -1 ? fullTextContent.substring(0, newlinePosition) : fullTextContent;

    const separatorPosition = firstLineSegment.indexOf(' ');

    let firstValueString = '';
    let secondValueString = '';

    if (separatorPosition !== -1) {
        firstValueString = firstLineSegment.substring(0, separatorPosition);
        secondValueString = firstLineSegment.substring(separatorPosition + 1);
    } else {
        firstValueString = firstLineSegment;
        secondValueString = '';
    }

    const numericValueA = Number(firstValueString);
    const numericValueB = Number(secondValueString);

    const determineOutcomeMessage = (valX, valY) => {
        const exceedsLimit = valX > 8 || valY > 8;
        return exceedsLimit ? ':(' : 'Yay!';
    };

    console.log(determineOutcomeMessage(numericValueA, numericValueB));
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
