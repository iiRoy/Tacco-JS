const deepCopy = (sourceObject) => JSON.parse(JSON.stringify(sourceObject));

const rotatePoints = (pointList) =>
  pointList.map(({ x, y }) => ({ x: -y, y: x }));

const areEquivalentPolylines = (pathOne, pathTwo) =>
  pathOne.length === pathTwo.length &&
  pathOne.every((point, idx) =>
    point.x === pathTwo[idx].x && point.y === pathTwo[idx].y
  );

((rawInput) => {
    const rawInputLines = rawInput.replace(/\r/g, '').split("\n");

    const getNextInt = () => parseInt(rawInputLines.shift());
    const getNextPoint = () => {
        const [xStr, yStr] = rawInputLines.shift().split(' ');
        return { x: parseInt(xStr), y: parseInt(yStr) };
    };

    while (true) {
        let currentN = getNextInt() + 1;
        if (currentN === 1) {
            break;
        }

        const polylineCollection = Array.from({ length: currentN - 1 }, () => {
            let segmentCount = getNextInt() - 1;
            const initialPoint = getNextPoint();
            const relativePoints = [{ x: 0, y: 0 }];

            Array.from({ length: segmentCount }).forEach(() => {
                const { x: coordX, y: coordY } = getNextPoint();
                relativePoints.push({ x: coordX - initialPoint.x, y: coordY - initialPoint.y });
            });
            return relativePoints;
        });

        const referencePolyline = polylineCollection.shift();

        const reversedReferencePolyline = (() => {
            const tempReversed = deepCopy(referencePolyline).reverse();
            const { x: firstX, y: firstY } = tempReversed[0];
            return tempReversed.map(pt => ({ x: pt.x - firstX, y: pt.y - firstY }));
        })();

        polylineCollection.forEach((currentPolyline, polylineIndex) => {
            let currentRotatedPolyline = currentPolyline;
            let matchFound = false;

            Array.from({ length: 4 }).some(() => {
                if (areEquivalentPolylines(currentRotatedPolyline, referencePolyline) ||
                    areEquivalentPolylines(currentRotatedPolyline, reversedReferencePolyline)) {
                    console.log(polylineIndex + 1);
                    matchFound = true;
                    return true;
                }
                currentRotatedPolyline = rotatePoints(currentRotatedPolyline);
                return false;
            });
        });
        console.log("+++++");
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
