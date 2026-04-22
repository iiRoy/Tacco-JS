function processInputData(payload) {
    const firstBreak = payload.indexOf('\n');
    const firstComponent = payload.substring(0, firstBreak);
    const secondComponent = payload.substring(firstBreak + 1);

    const ensureInteger = (textValue) => {
        const parsedValue = Number(textValue);
        if (Number.isNaN(parsedValue)) {
            return 0;
        }
        return Math.trunc(parsedValue);
    };

    const initialFactor = -1 * ensureInteger(firstComponent);

    const numericalSegments = secondComponent.split(' ').map(s => s.trim()).filter(Boolean);

    const recursivelySum = (itemsCollection, runningTotal = 0) => {
        if (itemsCollection.length === 0) {
            return runningTotal;
        }
        return recursivelySum(itemsCollection.slice(1), runningTotal + ensureInteger(itemsCollection[0]));
    };

    const accumulatedSumForSecondLine = recursivelySum(numericalSegments);

    const finalComputation = initialFactor + accumulatedSumForSecondLine;

    console.log(finalComputation);
}

const osModule = require("fs");
const retrieveContents = osModule.readFileSync;
const targetPath = "/dev/stdin";
const charset = "utf8";

processInputData(retrieveContents(targetPath, charset));