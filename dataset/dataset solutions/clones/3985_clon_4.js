const makeMirrorNumber = (f, s, t) => {
    return (f * 10000) + (s * 1000) + (t * 100) + (s * 10) + f;
};

const processNumericalRange = (passage) => {
    const numericalBounds = passage.trim().split(/\s+/).map(Number);
    const lowerBound = numericalBounds[0];
    const upperBound = numericalBounds[1];

    const firstDigits = Array.from({ length: 9 }, (_, i) => i + 1);

    const middleDigits = Array.from({ length: 10 }, (_, i) => i);

    const allPossibleMirroredNumbers = firstDigits.flatMap(d1 =>
        middleDigits.flatMap(d2 =>
            middleDigits.map(d3 => makeMirrorNumber(d1, d2, d3))
        )
    );

    const qualifyingNumbers = allPossibleMirroredNumbers.filter(value =>
        value >= lowerBound && value <= upperBound
    );

    console.log(qualifyingNumbers.length);
};

processNumericalRange(require('fs').readFileSync('/dev/stdin', 'utf8'));