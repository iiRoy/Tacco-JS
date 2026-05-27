const solveProblem = (inputContent) => {
    const [firstLineContent, secondLineContent] = inputContent.split('\n');
    const [, searchPointStr] = firstLineContent.split(' ');
    const initialPointsRaw = secondLineContent.split(' ');

    const allPoints = [...initialPointsRaw, searchPointStr].map(s => parseInt(s, 10)).sort((a, b) => a - b);

    const computeGCD = (valA, valB) => {
        if (isNaN(valA) || isNaN(valB)) {
            return NaN;
        }
        if (valB === 0) {
            return valA;
        }
        return computeGCD(valB, valA % valB);
    };

    const pointSpans = [];
    for (let k = 1; k < allPoints.length; k++) {
        pointSpans.push(allPoints[k] - allPoints[k - 1]);
    }

    let finalAnswer;
    if (pointSpans.length === 1) {
        finalAnswer = pointSpans[0];
    } else {
        finalAnswer = pointSpans.reduce(computeGCD);
    }

    console.log(finalAnswer);
};

solveProblem(require('fs').readFileSync('/dev/stdin', 'utf8'));
