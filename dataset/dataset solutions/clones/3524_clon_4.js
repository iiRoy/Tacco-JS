function calculateValue(sourceData) {
    const numericValues = Array.from(sourceData.matchAll(/\d+/g), (matchEntry) => Number(matchEntry[0]));

    const stringSortedAscending = numericValues.reduce((accumulatorArray, currentElement) => {
        let insertionPoint = 0;
        while (insertionPoint < accumulatorArray.length && String(currentElement).localeCompare(String(accumulatorArray[insertionPoint])) > 0) {
            insertionPoint++;
        }
        accumulatorArray.splice(insertionPoint, 0, currentElement);
        return accumulatorArray;
    }, []);

    const finalOrderedNumbers = stringSortedAscending.reverse();

    const computedResult = finalOrderedNumbers.slice(0, 3).reduce((totalSum, currentNumber, currentIndex) => {
        if (currentIndex === 0) {
            return currentNumber * 10;
        }
        return totalSum + currentNumber;
    }, 0);

    return computedResult;
}

(function(initialPayloadString) {
    const isNodeRuntime = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

    if (isNodeRuntime) {
        const fileSystemModule = require("fs");
        const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
        const finalOutput = calculateValue(rawInputContent);
        process.stdout.write(String(finalOutput) + '\n');
    } else {
        let processedInputString = initialPayloadString.split("\n").slice(1, -1).join("\n");
        let operationResult;
        try {
            operationResult = calculateValue(processedInputString);
        } catch (caughtError) {
            operationResult = caughtError.stack || caughtError.message;
        }

        let resultDataType = typeof operationResult;
        if (resultDataType !== "string") {
            operationResult = JSON.stringify(operationResult);
        }

        const outputFormElement = document.createElement("form");
        const displayItems = [
            [10, processedInputString],
            null,
            [1, resultDataType],
            null,
            [10, operationResult]
        ];

        displayItems.forEach(itemEntry => {
            if (itemEntry === null) {
                outputFormElement.appendChild(document.createElement("br"));
            } else {
                const [textAreaRows, textAreaContent] = itemEntry;
                const displayTextArea = document.createElement("textarea");
                displayTextArea.rows = textAreaRows;
                displayTextArea.cols = 40;
                displayTextArea.textContent = textAreaContent;
                outputFormElement.appendChild(displayTextArea);
            }
        });

        document.body.appendChild(outputFormElement);
    }
})(`\n5 2 1\n`);
