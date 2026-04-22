'use strict';

function Main(inputStringValue) {
    const processNumericalEntry = (textualData) => {
        const whitespaceRemoved = textualData.replace(/\s/g, '');
        const numericalForm = Number(whitespaceRemoved);
        return numericalForm;
    };

    const acquiredNumericConstraint = processNumericalEntry(inputStringValue);

    if (acquiredNumericConstraint < 1 || acquiredNumericConstraint !== acquiredNumericConstraint) {
        return;
    }

    const locateHighestSquare = (currentCandidateRoot, upperThreshold, previousFoundSquare) => {
        const squareOfCandidate = currentCandidateRoot * currentCandidateRoot;

        if (squareOfCandidate > upperThreshold) {
            return previousFoundSquare;
        } else {
            return locateHighestSquare(currentCandidateRoot + 1, upperThreshold, squareOfCandidate);
        }
    };

    const finalResultant = locateHighestSquare(1, acquiredNumericConstraint, null);

    if (finalResultant !== null) {
        console.log(`${finalResultant}`);
    }
}