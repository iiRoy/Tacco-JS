const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

const extractNumericalValues = (text) => {
    return text.trim().match(/(\d+(\.\d+)?)/g).map(parseFloat);
};

const [firstDimension, secondDimension, angleInDegrees] = extractNumericalValues(rawInputContent);

const convertDegreesToRadians = (degrees) => degrees * (Math.PI / 180);

const angleInRadians = convertDegreesToRadians(angleInDegrees);

const calculateArea = (side1, side2, angleRad) => 0.5 * side1 * side2 * Math.sin(angleRad);
const triangleArea = calculateArea(firstDimension, secondDimension, angleInRadians);

const calculateThirdSide = (side1, side2, angleRad) => {
    const termA = Math.pow(side1, 2);
    const termB = Math.pow(side2, 2);
    const termC = 2 * side1 * side2 * Math.cos(angleRad);
    return Math.sqrt(termA + termB - termC);
};
const thirdSideLength = calculateThirdSide(firstDimension, secondDimension, angleInRadians);

const calculateHeight = (area, base) => (2 * area) / base;
const triangleHeight = calculateHeight(triangleArea, firstDimension);

const calculatePerimeter = (s1, s2, s3) => s1 + s2 + s3;
const totalPerimeter = calculatePerimeter(firstDimension, secondDimension, thirdSideLength);

const formatOutput = (value) => value.toFixed(8);

const outputComponents = [
    formatOutput(triangleArea),
    formatOutput(totalPerimeter),
    formatOutput(triangleHeight)
];

console.log(outputComponents.join(' '));
