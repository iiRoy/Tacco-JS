var gridDimensionX;
var gridDimensionY;
var itemRegistry;
var scoreRepository;

function evaluateGridPointOptimal(coordX, coordY) {
    if (coordX < 0 || coordY < 0) {
        return [0, 0, 0, 0];
    }
    if (coordX >= gridDimensionX || coordY >= gridDimensionY) {
        return [0, 0, 0, 0];
    }

    var cacheKey = coordX + "_" + coordY;
    if (scoreRepository.has(cacheKey)) {
        return scoreRepository.get(cacheKey);
    }

    var currentItemValue = itemRegistry.get(cacheKey) || 0;

    var scoresFromLeft = evaluateGridPointOptimal(coordX, coordY - 1);
    var scoresFromAbove = evaluateGridPointOptimal(coordX - 1, coordY);

    var cellScores = [0, 0, 0, 0];

    for (var segmentCount = 0; segmentCount < 4; segmentCount++) {
        cellScores[segmentCount] = Math.max(cellScores[segmentCount], scoresFromLeft[segmentCount]);
    }

    for (var previousSegmentCount = 0; previousSegmentCount < 4; previousSegmentCount++) {
        cellScores[0] = Math.max(cellScores[0], scoresFromAbove[previousSegmentCount]);
    }

    for (var currentSegmentCount = 2; currentSegmentCount >= 0; currentSegmentCount--) {
        cellScores[currentSegmentCount + 1] = Math.max(
            cellScores[currentSegmentCount + 1],
            cellScores[currentSegmentCount] + currentItemValue
        );
    }

    scoreRepository.set(cacheKey, cellScores);
    return cellScores;
}

function processInputAndCalculate(rawData) {
    var parts = rawData.split("\n");
    var gridInfoLine = parts.shift();
    var gridSpecs = gridInfoLine.split(" ");

    gridDimensionX = Number(gridSpecs[0]);
    gridDimensionY = Number(gridSpecs[1]);
    var totalItemCount = Number(gridSpecs[2]);

    itemRegistry = new Map();
    scoreRepository = new Map();

    for (var itemIndex = 0; itemIndex < totalItemCount; itemIndex++) {
        var itemData = parts[itemIndex].split(" ");
        var rowCoord = Number(itemData[0]) - 1;
        var colCoord = Number(itemData[1]) - 1;
        var itemVal = Number(itemData[2]);
        itemRegistry.set(rowCoord + "_" + colCoord, itemVal);
    }

    var finalScores = evaluateGridPointOptimal(gridDimensionX - 1, gridDimensionY - 1);

    var ultimateAnswer = 0;
    for (var finalK = 0; finalK < 4; finalK++) {
        ultimateAnswer = Math.max(ultimateAnswer, finalScores[finalK]);
    }

    console.log(ultimateAnswer);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));