process.stdin.on("data", function(inputChunkBuffer) {
    const rawInputString = String(inputChunkBuffer).trim();
    const parsedInputLines = rawInputString.split("\n");

    const uniqueElementsRegistry = {};
    let commonElementCount = 0;

    const PRESENCE_INDICATOR = true;

    if (parsedInputLines.length >= 2) {
        const firstElementSequence = parsedInputLines[1];
        const elementsForRegistry = firstElementSequence.split(" ");

        elementsForRegistry.forEach(function(currentElement) {
            if (currentElement !== "") {
                uniqueElementsRegistry[currentElement] = PRESENCE_INDICATOR;
            }
        });
    }

    if (parsedInputLines.length >= 4) {
        const secondElementSequence = parsedInputLines[3];
        const elementsForComparison = secondElementSequence.split(" ");

        for (let idx = 0; idx < elementsForComparison.length; idx++) {
            const candidateElement = elementsForComparison[idx];
            if (candidateElement === "") {
                continue;
            }

            if (Object.prototype.hasOwnProperty.call(uniqueElementsRegistry, candidateElement)) {
                commonElementCount = commonElementCount + 1;
            }
        }
    }

    console.log(commonElementCount);
}).resume();