const processData = (rawDataString) => {
    const inputLines = rawDataString.split('\n');

    const numericalElements = inputLines[0].split(' ').map(Number);
    const quantity = numericalElements[0];

    const valueArray = inputLines[1].split(' ').map(Number);

    const accumulateMinima = (currentIdx, dataSet, maxBound) => {
        if (currentIdx >= maxBound - 2) {
            return 0;
        }
        const currentMin = (dataSet[currentIdx] < dataSet[currentIdx + 1] ? dataSet[currentIdx] : dataSet[currentIdx + 1]);
        return currentMin + accumulateMinima(currentIdx + 1, dataSet, maxBound);
    };

    const initialElement = valueArray[0];
    const lastRelevantElement = valueArray[quantity - 2];

    const intermediateSum = accumulateMinima(0, valueArray, quantity);

    const finalComputedValue = initialElement + intermediateSum + lastRelevantElement;

    return finalComputedValue;
};

const retrieveSource = (pathIdentifier) => require("fs").readFileSync(pathIdentifier, "utf8");

const inputPath = "/dev/stdin";
const rawContent = retrieveSource(inputPath);

const finalResult = processData(rawContent);
console.log(finalResult);