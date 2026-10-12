function checkCyclicEquivalence(sourceText) {
    const textLines = sourceText.split('\n');
    const firstCharacterSequence = textLines[0].split('');
    const secondCharacterSequence = textLines[1].split('');

    if (firstCharacterSequence.length !== secondCharacterSequence.length) {
        return false;
    }

    const firstArrayRepresentation = firstCharacterSequence.toString();
    const secondArrayRepresentation = secondCharacterSequence.toString();

    if (firstArrayRepresentation === secondArrayRepresentation) {
        return true;
    }

    const extendedFirstRepresentation = firstArrayRepresentation + ',' + firstArrayRepresentation;

    return extendedFirstRepresentation.includes(secondArrayRepresentation);
}

const programInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const comparisonResult = checkCyclicEquivalence(programInput);

if (comparisonResult) {
    console.log('Yes');
} else {
    console.log('No');
}
