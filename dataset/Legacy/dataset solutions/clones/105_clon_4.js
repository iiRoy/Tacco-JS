const MIN_GRID_COORD = -2;
const MAX_GRID_COORD = 11;
const GRID_DIMENSION_SIZE = MAX_GRID_COORD - MIN_GRID_COORD + 1;

const levelOnePattern = [[0,0], [0,1], [0,-1], [1,0], [-1,0]];
const levelTwoPattern = [[1,-1], [1,1], [-1,-1], [-1,1]];
const levelThreePattern = [[2,0], [-2,0], [0,2], [0,-2]];

const dropEffectMap = {
    '1': levelOnePattern,
    '2': levelOnePattern.concat(levelTwoPattern),
    '3': levelOnePattern.concat(levelTwoPattern).concat(levelThreePattern)
};

function main() {
    let dropGrid = Array.from({ length: GRID_DIMENSION_SIZE }, () => Array(GRID_DIMENSION_SIZE).fill(0));

    const getArrayIndex = (coord) => coord - MIN_GRID_COORD;

    input.slice(0, -1).reverse().forEach(currentLine => {
        const inputX = parseInt(currentLine[0]);
        const inputY = parseInt(currentLine[2]);
        const dropLevelChar = currentLine[4];

        const currentOffsets = dropEffectMap[dropLevelChar];

        currentOffsets.forEach(([offsetX, offsetY]) => {
            const targetY = inputY + offsetY;
            const targetX = inputX + offsetX;
            dropGrid[getArrayIndex(targetY)][getArrayIndex(targetX)]++;
        });
    });

    const logicalGridValues = [];
    for (let gridY = 0; gridY < 10; gridY++) {
        for (let gridX = 0; gridX < 10; gridX++) {
            logicalGridValues.push(dropGrid[getArrayIndex(gridY)][getArrayIndex(gridX)]);
        }
    }

    const zeroCount = logicalGridValues.filter(val => val === 0).length;

    const peakDropValue = logicalGridValues.reduce((maxVal, currentVal) => Math.max(maxVal, currentVal), 0);

    console.log(zeroCount);
    console.log(peakDropValue);
}

let input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
    input += chunk;
});
process.stdin.on('end', function() {
    input = input.split('\n');
    main();
});
