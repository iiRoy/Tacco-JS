const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
let lines = rawData.trim().split("\n");

const calculateCube = (value) => Math.pow(value, 3);

while (true) {
    let currentNumString = lines.shift();
    let currentNum = Number(currentNumString);

    if (currentNum === 0) {
        break;
    }

    const targetCubeValue = calculateCube(currentNum);

    let smallestPositiveDifference = Infinity;

    for (let outerIterator = currentNum - 1; outerIterator > 0; outerIterator--) {
        const outerCube = calculateCube(outerIterator);

        for (let innerIterator = outerIterator; innerIterator > 0; innerIterator--) {
            const innerCube = calculateCube(innerIterator);

            const currentDifference = targetCubeValue - outerCube - innerCube;

            if (currentDifference > 0) {
                smallestPositiveDifference = Math.min(smallestPositiveDifference, currentDifference);
            }
        }
    }
    console.log(smallestPositiveDifference);
}
