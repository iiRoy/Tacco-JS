const determineDivisibilityStatus = (sourceMaterial) => {
    const modifiedSequence = Array.from(sourceMaterial).reduce((accumulator, currentCharacter) => {
        return accumulator + (currentCharacter === ' ' ? ',' : currentCharacter);
    }, '');

    const initialNumericSegment = modifiedSequence.match(/^\d+/);

    let numericalRepresentation;
    if (initialNumericSegment) {
        numericalRepresentation = Number(initialNumericSegment[0]);
    } else {
        numericalRepresentation = NaN;
    }

    const isDivisibleByFour = (numericalRepresentation % 4 === 0);

    const responseCatalog = {
        true: "YES\n",
        false: "NO\n"
    };

    return responseCatalog[isDivisibleByFour];
};

const acquiredData = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(determineDivisibilityStatus(acquiredData));
