let equationLines = '';

function solveEquations() {
    const processedEquationTexts = equationLines.trim().split('\n');

    processedEquationTexts.forEach(currentEquationText => {
        const [leftHandSide, rightHandSide] = currentEquationText.split('=');
        const [firstTerm, secondTerm] = leftHandSide.split('+');

        const substituteAndParse = (segment, digitValue) => {
            return parseInt(segment.replace(/X/g, digitValue));
        };

        const checkLeadingX = (segmentToCheck) => segmentToCheck[0] === 'X';

        const potentialDigits = Array.from({ length: 10 }, (_, index) => index);

        const foundSolutionDigit = potentialDigits.find(currentCandidate => {
            if (currentCandidate === 0 && (checkLeadingX(firstTerm) || checkLeadingX(secondTerm) || checkLeadingX(rightHandSide))) {
                return false;
            }

            const parsedFirstTerm = substituteAndParse(firstTerm, currentCandidate);
            const parsedSecondTerm = substituteAndParse(secondTerm, currentCandidate);
            const parsedRightHandSide = substituteAndParse(rightHandSide, currentCandidate);

            return parsedFirstTerm + parsedSecondTerm === parsedRightHandSide;
        });

        console.log(foundSolutionDigit !== undefined ? foundSolutionDigit : "NA");
    });
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (dataChunk) {
    equationLines += dataChunk;
});
process.stdin.on('end', function () {
    solveEquations();
});
