const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const allInputLines = fileContent.trim().split('\n');

const dimensionsStr = allInputLines.shift();
const [rawA, rawB, rawX] = dimensionsStr.split(' ');

const sideA = Number(rawA);
const sideB = Number(rawB);
const targetVolume = Number(rawX);

const DEG_TO_RAD_FACTOR = Math.PI / 180;
const MAX_ITERATION_LIMIT = 200;
const INITIAL_LOWER_BOUND = 0;
const INITIAL_UPPER_BOUND = 90;

const totalPrismVolume = sideA * sideA * sideB;
const halfPrismVolume = totalPrismVolume / 2;

let currentLowerBound = INITIAL_LOWER_BOUND;
let currentUpperBound = INITIAL_UPPER_BOUND;
let currentAngleGuess = (currentLowerBound + currentUpperBound) / 2;
let loopIterationCounter = 0;

if (halfPrismVolume < targetVolume) {
    while (currentLowerBound < currentUpperBound) {
        const angleInRadians = currentAngleGuess * DEG_TO_RAD_FACTOR;
        const tanOfAngle = Math.tan(angleInRadians);
        
        const emptySpaceTriangleHeight = sideA * tanOfAngle;
        const emptySpaceBaseArea = (sideA * emptySpaceTriangleHeight) / 2;
        const emptySpaceVolume = emptySpaceBaseArea * sideA;
        
        const waterVolume = totalPrismVolume - emptySpaceVolume;

        if (targetVolume < waterVolume) {
            currentLowerBound = currentAngleGuess;
        } else {
            currentUpperBound = currentAngleGuess;
        }
        
        currentAngleGuess = (currentLowerBound + currentUpperBound) / 2;
        loopIterationCounter++;

        if (loopIterationCounter > MAX_ITERATION_LIMIT) {
            break;
        }
    }
    console.log(currentAngleGuess.toFixed(10));
} else {
    while (currentLowerBound < currentUpperBound) {
        const angleInRadians = currentAngleGuess * DEG_TO_RAD_FACTOR;
        const tanOfAngle = Math.tan(angleInRadians);
        
        const waterTriangleHeight = sideB * tanOfAngle;
        const waterBaseArea = (sideB * waterTriangleHeight) / 2;
        const waterVolume = waterBaseArea * sideA;

        if (targetVolume < waterVolume) {
            currentUpperBound = currentAngleGuess;
        } else {
            currentLowerBound = currentAngleGuess;
        }
        
        currentAngleGuess = (currentLowerBound + currentUpperBound) / 2;
        loopIterationCounter++;

        if (loopIterationCounter > MAX_ITERATION_LIMIT) {
            break;
        }
    }
    const finalAngleFromTop = 90 - currentAngleGuess;
    console.log(finalAngleFromTop.toFixed(10));
}
