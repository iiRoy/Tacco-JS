function obtainSourceMaterial() {
    const rawContent = require("fs").readFileSync("/dev/stdin", "utf8");
    let contentLines = rawContent.split(/\r?\n/);
    if (contentLines.length > 0 && contentLines[contentLines.length - 1] === '') {
        contentLines.pop();
    }
    let currentLineIndex = 0;

    const fetchNumericBlock = () => {
        if (currentLineIndex >= contentLines.length) {
            throw new Error("No more lines to read.");
        }
        const line = contentLines[currentLineIndex++];
        return line.split(' ').map(Number);
    };

    const fetchAllNumericBlocks = () => {
        const remaining = contentLines.slice(currentLineIndex).map(Number);
        currentLineIndex = contentLines.length;
        return remaining;
    };

    const fetchAllTextBlocks = () => {
        const remaining = contentLines.slice(currentLineIndex);
        currentLineIndex = contentLines.length;
        return remaining;
    };

    const fetchNTextBlocks = (count) => {
        const block = contentLines.slice(currentLineIndex, currentLineIndex + count);
        currentLineIndex += count;
        return block;
    };

    return {
        grabNumerics: fetchNumericBlock,
        grabAllNumerics: fetchAllNumericBlocks,
        grabAllTexts: fetchAllTextBlocks,
        grabNTexts: fetchNTextBlocks,
    };
}

function orchestrateProcess() {
    const dataFeeder = obtainSourceMaterial();

    const initialSettings = dataFeeder.grabNumerics();
    const countA = initialSettings[0];
    const thresholdB = initialSettings[1];
    const dataElementsC = dataFeeder.grabNumerics();

    const aggregateCollector = (sourceData) => {
        const resultingAggregates = [];
        function accumulateRecursive(remainingList, currentTotal) {
            if (remainingList.length === 0) return;
            const newTotal = currentTotal + remainingList[0];
            resultingAggregates.push(newTotal);
            accumulateRecursive(remainingList.slice(1), newTotal);
        }

        for (let i = 0; i < sourceData.length; i++) {
            accumulateRecursive(sourceData.slice(i), 0);
        }
        return resultingAggregates;
    };

    const allCalculatedSums = aggregateCollector(dataElementsC);

    allCalculatedSums.sort((val1, val2) => val2 - val1);

    const locateMaxBitwiseTarget = (candidateValues, requiredMinimum) => {
        const topBit = 41;
        function exploreBits(currentBitPosition, establishedResult) {
            if (currentBitPosition < 0) {
                return establishedResult;
            }

            const bitWeight = 1 << currentBitPosition;
            const prospectiveTarget = establishedResult | bitWeight;

            const countMatching = candidateValues.filter(val =>
                (val & prospectiveTarget) === prospectiveTarget
            ).length;

            if (countMatching >= requiredMinimum) {
                return exploreBits(currentBitPosition - 1, prospectiveTarget);
            } else {
                return exploreBits(currentBitPosition - 1, establishedResult);
            }
        }
        return exploreBits(topBit, 0);
    };

    const finalOutput = locateMaxBitwiseTarget(allCalculatedSums, thresholdB);

    console.log(finalOutput);
}

orchestrateProcess();