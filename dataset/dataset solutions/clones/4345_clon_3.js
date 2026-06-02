const parseNumericString = (str) => parseInt(str, 10);

function calculateOptimalPath(rawInputString) {
    const inputLines = rawInputString.split('\n');

    const itemCountN = parseNumericString(inputLines[0]);
    const targetValueK = parseNumericString(inputLines[1]);
    const coordinateStrings = inputLines[2].split(' ');

    const calculateSegmentDistance = (accumulator, currentCoordStr, idx) => {
        const parsedCoord = parseNumericString(currentCoordStr);
        const distanceToTarget = Math.abs(targetValueK - parsedCoord);

        if (distanceToTarget < parsedCoord) {
            return accumulator + distanceToTarget;
        } else {
            return accumulator + parsedCoord;
        }
    };

    const totalDistance = coordinateStrings.reduce(calculateSegmentDistance, 0);

    console.log(totalDistance);
}

const readStandardInput = () => require("fs").readFileSync("/dev/stdin", "utf8");

calculateOptimalPath(readStandardInput());
