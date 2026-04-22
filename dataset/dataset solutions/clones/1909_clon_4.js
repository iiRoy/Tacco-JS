const dataRetriever = require("fs").readFileSync;
const rawInputContent = dataRetriever("/dev/stdin", "utf8");
const dataLines = rawInputContent.trim().split("\n");

const parameterSegment = dataLines.shift().trim().split(" ");
const operationCount = Number(parameterSegment[0]);
const initialAssetAlpha = Number(parameterSegment[1]);
const initialAssetBeta = Number(parameterSegment[2]);
const initialAssetGamma = Number(parameterSegment[3]);

const operationSequence = dataLines;

const charToIdx = new Map([['A', 0], ['B', 1], ['C', 2]]);

function exploreTransfers(currentStep, currentHoldings, accumulatedChoices) {
    if (currentStep === operationCount) {
        return accumulatedChoices;
    }

    const currentOperationString = operationSequence[currentStep];
    const originChar = currentOperationString[0];
    const destinationChar = currentOperationString[1];

    const originIndex = charToIdx.get(originChar);
    const destinationIndex = charToIdx.get(destinationChar);

    let newHoldings;
    let potentialResultPath;

    if (currentHoldings[originIndex] > 0) {
        newHoldings = [...currentHoldings];
        newHoldings[originIndex]--;
        newHoldings[destinationIndex]++;
        
        potentialResultPath = exploreTransfers(currentStep + 1, newHoldings, accumulatedChoices.concat([destinationChar]));
        if (potentialResultPath !== null) {
            return potentialResultPath;
        }
    }

    if (currentHoldings[destinationIndex] > 0) {
        newHoldings = [...currentHoldings];
        newHoldings[destinationIndex]--;
        newHoldings[originIndex]++;

        potentialResultPath = exploreTransfers(currentStep + 1, newHoldings, accumulatedChoices.concat([destinationChar]));
        if (potentialResultPath !== null) {
            return potentialResultPath;
        }
    }

    return null;
}

const initialHoldings = [initialAssetAlpha, initialAssetBeta, initialAssetGamma];

const finalPathOutcome = exploreTransfers(0, initialHoldings, []);

if (finalPathOutcome !== null) {
    console.log("Yes");
    console.log(finalPathOutcome.join("\n"));
} else {
    console.log("No");
}