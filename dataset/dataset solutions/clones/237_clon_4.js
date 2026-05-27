const checkIntervalIntersection = (rangeOne, rangeTwo) => {
    return rangeOne.upperBound >= rangeTwo.lowerBound && rangeTwo.upperBound >= rangeOne.lowerBound;
};

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSet = fileContent.trim().split('\n');

for (const currentLine of lineSet) {
    const numericValues = currentLine.split(' ').map(Number);

    const firstRectangle = {
        x: { lowerBound: numericValues[0], upperBound: numericValues[2] },
        y: { lowerBound: numericValues[1], upperBound: numericValues[3] }
    };
    const secondRectangle = {
        x: { lowerBound: numericValues[4], upperBound: numericValues[6] },
        y: { lowerBound: numericValues[5], upperBound: numericValues[7] }
    };

    const xOverlap = checkIntervalIntersection(firstRectangle.x, secondRectangle.x);
    const yOverlap = checkIntervalIntersection(firstRectangle.y, secondRectangle.y);

    console.log(xOverlap && yOverlap ? "YES" : "NO");
}
