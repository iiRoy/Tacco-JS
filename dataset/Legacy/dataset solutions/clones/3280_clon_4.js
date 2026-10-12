function calculateGridPlacementOptions(inputStringData) {
    const parseAndConvert = (str) => str.split('\n').map(val => parseInt(val, 10));

    const [totalDimension, itemHeight, itemWidth] = parseAndConvert(inputStringData);

    const computeValidPositions = (total, item) => total - item + 1;

    const widthPositions = computeValidPositions(totalDimension, itemWidth);
    const heightPositions = computeValidPositions(totalDimension, itemHeight);

    return widthPositions * heightPositions;
}

function processStandardInput() {
    const inputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const finalResult = calculateGridPlacementOptions(inputContent);
    console.log(finalResult);
}

processStandardInput();
