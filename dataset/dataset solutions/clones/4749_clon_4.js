const obtainInputLines = () => {
    return require("node:fs").readFileSync("/dev/stdin", "utf8").trim().split("\n").filter(Boolean);
};

let inputLineBuffer = obtainInputLines();
let currentLineIndex = 0;

const fetchNextLine = () => {
    if (currentLineIndex >= inputLineBuffer.length) {
        throw new Error("InputConsumptionError: Attempted to read past end of input.");
    }
    return inputLineBuffer[currentLineIndex++];
};

const parseNumericValue = (textSegment) => Number.parseInt(textSegment, 10);

const parseNumericArray = (textLine) => textLine.split(" ").map(parseNumericValue);

const presentResult = (outcome) => console.log(outcome);

const performCalculation = () => {
    const dataPairCount = parseNumericValue(fetchNextLine());

    const dataPairs = [];
    for (let i = 0; i < dataPairCount; i++) {
        const [componentA, componentB] = parseNumericArray(fetchNextLine());
        dataPairs.push({ componentA, componentB });
    }

    const finalState = dataPairs.reduceRight((accumulator, currentEntry) => {
        const currentComponentA = currentEntry.componentA;
        const currentComponentB = currentEntry.componentB;
        const previousCumulativeAdjustment = accumulator.cumulativePriorAdjustment;

        const requiredFactor = Math.ceil((currentComponentA + previousCumulativeAdjustment) / currentComponentB);

        const currentEntryCorrection = (requiredFactor * currentComponentB) - (currentComponentA + previousCumulativeAdjustment);

        return {
            totalAccumulatedCorrection: accumulator.totalAccumulatedCorrection + currentEntryCorrection,
            cumulativePriorAdjustment: previousCumulativeAdjustment + currentEntryCorrection,
        };
    }, { totalAccumulatedCorrection: 0, cumulativePriorAdjustment: 0 });

    presentResult(finalState.totalAccumulatedCorrection);
};

performCalculation();