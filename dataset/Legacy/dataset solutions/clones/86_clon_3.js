const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

const allInputLines = rawInputData.trim().split("\n");

const dataLines = allInputLines.slice(1);

dataLines.forEach(function(currentLineString) {
    const rawCoordStrings = currentLineString.split(" ");
    const scaledCoordinates = rawCoordStrings.map(valStr => Number(valStr) * 100000);

    const [
        point1X, point1Y,
        point2X, point2Y,
        point3X, point3Y,
        point4X, point4Y
    ] = scaledCoordinates;

    let parallelStatus = "NO";

    const deltaX_AB = point2X - point1X;
    const deltaY_AB = point2Y - point1Y;

    const deltaX_CD = point4X - point3X;
    const deltaY_CD = point4Y - point3Y;

    if (deltaX_AB !== 0 && deltaX_CD !== 0) {
        const slopeOfAB = deltaY_AB / deltaX_AB;
        const slopeOfCD = deltaY_CD / deltaX_CD;

        if (slopeOfAB === slopeOfCD) {
            parallelStatus = "YES";
        }
    }

    console.log(parallelStatus);
});
