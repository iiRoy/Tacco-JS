process.stdin.on("data", function(inputBuffer) {
    const processInputData = (dataChunk) => {
        const rawInputContent = String(dataChunk);
        const cleanedInputContent = rawInputContent.trim();
        const inputLineSegments = cleanedInputContent.split("\n");

        const initialArraySize = parseInt(inputLineSegments[0], 10);
        let dataElements = [];

        // Initialize dataElements array such that dataElements[i] = i
        dataElements = Array.from({ length: initialArraySize + 1 }, (_, currentIdx) => currentIdx);

        // Helper function to swap two elements in an array
        const swapArrayElements = (targetArray, indexA, indexB) => {
            const valueA = targetArray[indexA];
            targetArray[indexA] = targetArray[indexB];
            targetArray[indexB] = valueA;
        };

        // Process swap operations from input lines
        const swapOperationLines = inputLineSegments.slice(2);
        for (let i = 0; i < swapOperationLines.length; i++) {
            const operationString = swapOperationLines[i];
            const indicesToSwap = operationString.split(",");
            const firstSwapIndex = parseInt(indicesToSwap[0], 10);
            const secondSwapIndex = parseInt(indicesToSwap[1], 10);
            swapArrayElements(dataElements, firstSwapIndex, secondSwapIndex);
        }

        // Output the final state of the array, excluding the element at index 0
        const elementsForOutput = dataElements.slice(1);
        for (let i = 0; i < elementsForOutput.length; i++) {
            console.log(elementsForOutput[i]);
        }
    };

    processInputData(inputBuffer);
}).resume();
