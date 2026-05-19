const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const numericValues = fileContent.match(/\d+/g).map(Number);

const [containerWidth, containerHeight, circleX, circleY, circleRadius] = numericValues;

const checkContainment = (rad, cX, cY, totalW, totalH) => {
    const leftBoundaryDistance = cX;
    const rightBoundaryDistance = totalW - cX;
    const topBoundaryDistance = cY;
    const bottomBoundaryDistance = totalH - cY;

    return rad <= leftBoundaryDistance &&
           rad <= rightBoundaryDistance &&
           rad <= topBoundaryDistance &&
           rad <= bottomBoundaryDistance;
};

const isContained = checkContainment(circleRadius, circleX, circleY, containerWidth, containerHeight);

console.log(isContained ? 'Yes' : 'No');
