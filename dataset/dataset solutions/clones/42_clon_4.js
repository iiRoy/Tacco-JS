const sourceReader = require("node:fs");

const processGeometry = (inputLine) => {
    const numericComponents = inputLine.split(' ').map(Number);
    
    if (numericComponents.length < 6) {
        return; 
    }

    const pointOne = { xA: numericComponents[0], yA: numericComponents[1] };
    const pointTwo = { xA: numericComponents[2], yA: numericComponents[3] };
    const pointThree = { xA: numericComponents[4], yA: numericComponents[5] };

    const distanceSquared = (vertexA, vertexB) => {
        const deltaX = vertexA.xA - vertexB.xA;
        const deltaY = vertexA.yA - vertexB.yA;
        return deltaX * deltaX + deltaY * deltaY;
    };

    const findCircumcenter = (vertexAlpha, vertexBeta, vertexGamma) => {
        // Equation for perpendicular bisector of vertexAlpha and vertexBeta:
        // 2*(x_beta - x_alpha)*X + 2*(y_beta - y_alpha)*Y = (x_beta^2 + y_beta^2) - (x_alpha^2 + y_alpha^2)
        const coefficientX_Line1 = 2 * (vertexBeta.xA - vertexAlpha.xA);
        const coefficientY_Line1 = 2 * (vertexBeta.yA - vertexAlpha.yA);
        const constantValue_Line1 = distanceSquared(vertexBeta, { xA: 0, yA: 0 }) - distanceSquared(vertexAlpha, { xA: 0, yA: 0 });

        // Equation for perpendicular bisector of vertexAlpha and vertexGamma:
        const coefficientX_Line2 = 2 * (vertexGamma.xA - vertexAlpha.xA);
        const coefficientY_Line2 = 2 * (vertexGamma.yA - vertexAlpha.yA);
        const constantValue_Line2 = distanceSquared(vertexGamma, { xA: 0, yA: 0 }) - distanceSquared(vertexAlpha, { xA: 0, yA: 0 });

        // Solve the system of linear equations using Cramer's rule:
        // A1*X + B1*Y = C1
        // A2*X + B2*Y = C2
        // X = (C1*B2 - C2*B1) / (A1*B2 - A2*B1)
        // Y = (A1*C2 - A2*C1) / (A1*B2 - A2*B1)

        const systemDeterminant = coefficientX_Line1 * coefficientY_Line2 - coefficientX_Line2 * coefficientY_Line1;

        const centralAbscissa = (constantValue_Line1 * coefficientY_Line2 - constantValue_Line2 * coefficientY_Line1) / systemDeterminant;
        const centralOrdinate = (coefficientX_Line1 * constantValue_Line2 - coefficientX_Line2 * constantValue_Line1) / systemDeterminant;

        return { xCoord: centralAbscissa, yCoord: centralOrdinate };
    };

    const circumcenterLocation = findCircumcenter(pointOne, pointTwo, pointThree);

    const circleRadius = Math.sqrt(distanceSquared(pointOne, { xA: circumcenterLocation.xCoord, yA: circumcenterLocation.yCoord }));

    console.log(
        circumcenterLocation.xCoord.toFixed(3),
        circumcenterLocation.yCoord.toFixed(3),
        circleRadius.toFixed(3)
    );
};

const rawInput = sourceReader.readFileSync("/dev/stdin", "utf8");
const inputLines = rawInput.trim().split('\n');

inputLines.forEach(lineEntry => {
    processGeometry(lineEntry);
});