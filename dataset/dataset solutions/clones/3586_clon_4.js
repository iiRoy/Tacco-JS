const checkUniformity = (segmentValues, dotCharacter) => segmentValues.every(element => element === dotCharacter);

const transformGrid = (inputGrid) => {
    if (!inputGrid || inputGrid.length === 0 || inputGrid[0].length === 0) {
        return [];
    }
    return inputGrid.reduce((accumulatorArray, currentSlice) => {
        currentSlice.forEach((elementValue, indexPosition) => {
            if (!accumulatorArray[indexPosition]) {
                accumulatorArray[indexPosition] = [];
            }
            accumulatorArray[indexPosition].push(elementValue);
        });
        return accumulatorArray;
    }, []);
};

const processCharacterMatrix = (rawDataInput) => {
    const allLines = rawDataInput.split('\n');
    const contentLines = allLines.slice(1);

    const initialMatrix = contentLines.map(rowLine => rowLine.split(''));

    const filteredRows = initialMatrix.filter(rowSegment => !checkUniformity(rowSegment, '.'));

    const firstTransposition = transformGrid(filteredRows);

    const filteredColumns = firstTransposition.filter(columnSegment => !checkUniformity(columnSegment, '.'));

    const finalTransposition = transformGrid(filteredColumns);

    return finalTransposition.map(finalRow => finalRow.join(''));
};

const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");
const processedResult = processCharacterMatrix(sourceData);
processedResult.forEach(outputLine => console.log(outputLine));