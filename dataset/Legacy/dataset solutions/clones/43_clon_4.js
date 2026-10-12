(function(rawInput) {
    const lines = rawInput.trimEnd().split('\n');
    const numCases = Number(lines.shift());

    const parsePoints = (lineData) => {
        const coordinateValues = lineData.split(' ').map(Number);
        return {
            pointAlpha: { x: coordinateValues[0], y: coordinateValues[1] },
            pointBeta: { x: coordinateValues[2], y: coordinateValues[3] },
            pointGamma: { x: coordinateValues[4], y: coordinateValues[5] }
        };
    };

    const calculateCircumcenter = (firstPoint, secondPoint, thirdPoint) => {
        const { x: xA, y: yA } = firstPoint;
        const { x: xB, y: yB } = secondPoint;
        const { x: xC, y: yC } = thirdPoint;

        const squareSumA = xA**2 + yA**2;
        const squareSumB = xB**2 + yB**2;
        const squareSumC = xC**2 + yC**2;

        // Equation for perpendicular bisector of segment AB:
        // 2x(xA - xB) + 2y(yA - yB) = squareSumA - squareSumB
        const factorX_AB = 2 * (xA - xB);
        const factorY_AB = 2 * (yA - yB);
        const constant_AB = squareSumA - squareSumB;

        // Equation for perpendicular bisector of segment BC:
        // 2x(xB - xC) + 2y(yB - yC) = squareSumB - squareSumC
        const factorX_BC = 2 * (xB - xC);
        const factorY_BC = 2 * (yB - yC);
        const constant_BC = squareSumB - squareSumC;

        const determinant = factorX_AB * factorY_BC - factorX_BC * factorY_AB;

        const centralX = (constant_AB * factorY_BC - constant_BC * factorY_AB) / determinant;
        const centralY = (factorX_AB * constant_BC - factorX_BC * constant_AB) / determinant;

        return { x: centralX, y: centralY };
    };

    lines.slice(0, numCases).forEach(currentLine => {
        const { pointAlpha, pointBeta, pointGamma } = parsePoints(currentLine);
        const circumcenterLocation = calculateCircumcenter(pointAlpha, pointBeta, pointGamma);

        const circumRadius = Math.hypot(pointAlpha.x - circumcenterLocation.x, pointAlpha.y - circumcenterLocation.y);

        console.log(circumcenterLocation.x.toFixed(3), circumcenterLocation.y.toFixed(3), circumRadius.toFixed(3));
    });

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
