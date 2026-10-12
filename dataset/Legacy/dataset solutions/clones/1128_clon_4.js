function Point(xCoord, yCoord) {
    this.x = xCoord;
    this.y = yCoord;
}

const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = fileData.split('\n');

const initialCount = Number(lineSegments[0]);

const pointSet = lineSegments.slice(1, initialCount + 1).reduce((accumulator, currentLine) => {
    const [xValue, yValue] = currentLine.split(' ').map(Number);
    accumulator.push(new Point(xValue, yValue));
    return accumulator;
}, []);

console.log(pointSet);
