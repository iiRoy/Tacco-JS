const filesystemUtility = require("fs");
const standardInputLocation = "/dev/stdin";
const incomingStreamContent = filesystemUtility.readFileSync(standardInputLocation, "utf8");

const coordinateTransformer = (inputStringData) => {
    const stringComponents = inputStringData.trim().split(/\s*\n\s*/)[0].split(/\s+/);

    const sourcePoints = stringComponents.map(Number);
    const pointA = { valX: sourcePoints[0], valY: sourcePoints[1] };
    const pointB = { valX: sourcePoints[2], valY: sourcePoints[3] };

    const computeVector = (startPt, endPt) => ({
        dx: endPt.valX - startPt.valX,
        dy: endPt.valY - startPt.valY
    });

    const rotateVectorNinetyDegrees = (vec) => ({
        dx: -vec.dy,
        dy: vec.dx
    });

    const displacePoint = (basePt, vec) => ({
        valX: basePt.valX + vec.dx,
        valY: basePt.valY + vec.dy
    });

    const vectorAB = computeVector(pointA, pointB);
    const perpendicularVector = rotateVectorNinetyDegrees(vectorAB);

    const pointC = displacePoint(pointB, perpendicularVector);
    const pointD = displacePoint(pointA, perpendicularVector);

    return [pointC.valX, pointC.valY, pointD.valX, pointD.valY].map(String).join(" ");
};

console.log(coordinateTransformer(incomingStreamContent));