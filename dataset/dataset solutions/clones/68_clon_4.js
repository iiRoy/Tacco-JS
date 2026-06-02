const initialPosition = { xCoord: 0, yCoord: 0, currentRotation: 0 };

const processSegment = (accumulator, lineData) => {
    const components = lineData.split(',');
    const segmentLength = +components[0];
    const rotationDelta = +components[1];

    if (segmentLength && rotationDelta) {
        const angleInRadians = accumulator.currentRotation * Math.PI / 180;
        accumulator.xCoord += segmentLength * Math.sin(angleInRadians);
        accumulator.yCoord += segmentLength * Math.cos(angleInRadians);
        accumulator.currentRotation += rotationDelta;
    }
    return accumulator;
};

const finalPosition = require("fs").readFileSync("/dev/stdin", "utf8")
    .trim()
    .split('\n')
    .reduce(processSegment, initialPosition);

console.log(~~finalPosition.xCoord);
console.log(~~finalPosition.yCoord);
