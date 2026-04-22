const dataOrigin = require('node:fs').readFileSync(0, 'utf8');
const processedEntries = dataOrigin.trim().split('\n');

const categorizeDimensions = (valOne, valTwo, valThree) => {
    const isPythagorean = (valOne * valOne + valTwo * valTwo) === (valThree * valThree);
    const areFirstTwoEqual = (valOne === valTwo);

    if (isPythagorean) {
        return 'rightAngled';
    } else if (areFirstTwoEqual) {
        return 'equalSides';
    }
    return 'other';
};

const finalSummary = processedEntries.reduce((accumulator, currentLineContent) => {
    if (currentLineContent.trim() === '') {
        return accumulator;
    }

    const numericalValues = currentLineContent.split(',').map(Number);
    const [dimA, dimB, dimC] = numericalValues;

    const classification = categorizeDimensions(dimA, dimB, dimC);

    switch (classification) {
        case 'rightAngled':
            accumulator.rightFormations++;
            break;
        case 'equalSides':
            accumulator.symmetricalForms++;
            break;
    }
    return accumulator;
}, { rightFormations: 0, symmetricalForms: 0 });

console.log(finalSummary.rightFormations);
console.log(finalSummary.symmetricalForms);