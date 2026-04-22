((sourceStream) => {
    const cleansedContent = sourceStream.trimEnd();
    const contentSegments = cleansedContent.split('\n');

    const totalTrials = parseInt(contentSegments[0], 10);
    const inputLinesForTrials = contentSegments.slice(1);

    const checkCircleRelation = (x1, y1, r1, x2, y2, r2) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distSq = (dx * dx) + (dy * dy);
        const actualDist = Math.sqrt(distSq);

        const sumR = r1 + r2;
        const diffR_B_A = r2 - r1;
        const diffR_A_B = r1 - r2;

        if (actualDist > sumR) {
            return 0;
        } else if (actualDist < diffR_B_A) {
            return -2;
        } else if (actualDist < diffR_A_B) {
            return 2;
        } else {
            return 1;
        }
    };

    const trialOutcomes = inputLinesForTrials.map((currentTrialLine) => {
        const numericValues = currentTrialLine.split(' ').map(parseFloat);
        return checkCircleRelation(...numericValues);
    });

    trialOutcomes.forEach((finalResult) => {
        console.log(finalResult);
    });

})(require('node:fs').readFileSync('/dev/stdin', 'utf8'));