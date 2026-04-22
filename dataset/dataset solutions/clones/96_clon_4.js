(function(sourceData) {
    const findInteractionType = (x1Coord, y1Coord, radius1, x2Coord, y2Coord, radius2) => {
        const diffX = x2Coord - x1Coord;
        const diffY = y2Coord - y1Coord;
        const squaredCenterDistance = diffX * diffX + diffY * diffY;

        const sumOfRadiiSquared = (radius1 + radius2) * (radius1 + radius2);
        const differenceOfRadiiSquared = (radius1 - radius2) * (radius1 - radius2);

        if (squaredCenterDistance === 0) {
            if (radius1 === radius2) {
                return 2;
            } else if (radius1 > radius2) {
                return 2;
            } else {
                return -2;
            }
        } else {
            if (squaredCenterDistance > sumOfRadiiSquared) {
                return 0;
            } else if (squaredCenterDistance < differenceOfRadiiSquared) {
                if (radius1 > radius2) {
                    return 2;
                } else {
                    return -2;
                }
            } else {
                return 1;
            }
        }
    };

    const processInputGeometry = (textInput) => {
        const dataLines = textInput.trim().split('\n');
        const totalCases = parseInt(dataLines[0], 10);

        const caseData = dataLines.slice(1, totalCases + 1);

        const computedResults = caseData.map(lineContent => {
            const numericValues = lineContent.split(' ').map(Number);

            const c1x = numericValues[0];
            const c1y = numericValues[1];
            const r1Val = numericValues[2];
            const c2x = numericValues[3];
            const c2y = numericValues[4];
            const r2Val = numericValues[5];

            return findInteractionType(c1x, c1y, r1Val, c2x, c2y, r2Val);
        });

        return computedResults.join('\n');
    };

    console.log(processInputGeometry(sourceData));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));