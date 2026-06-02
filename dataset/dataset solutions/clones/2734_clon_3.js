function processInput(rawData) {
    const lines = rawData.split("\n");
    const iterationCount = parseInt(lines[0], 10);
    const dataElements = lines.slice(1);

    const findLexicographicalMax = (valuesArray) => {
        return valuesArray.reduce((accumulator, currentValue) => accumulator > currentValue ? accumulator : currentValue);
    };

    const createModifiedArray = (sourceArray, indexToExclude) => {
        const temporaryCopy = sourceArray.slice();
        temporaryCopy.splice(indexToExclude, 1);
        return temporaryCopy;
    };

    for (let currentIdx = 0; currentIdx < iterationCount; currentIdx++) {
        const subsetForProcessing = createModifiedArray(dataElements, currentIdx);
        const maxElementInSubset = findLexicographicalMax(subsetForProcessing);
        console.log(maxElementInSubset);
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
