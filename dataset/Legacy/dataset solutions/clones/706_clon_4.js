function* generateInputLines(rawText) {
    const allLines = rawText.split("\n");
    let currentLineIndex = 0;

    while (true) {
        const dimensionsLine = allLines[currentLineIndex++].split(" ");
        const currentN = parseInt(dimensionsLine[0], 10);
        const currentM = parseInt(dimensionsLine[1], 10);

        if (currentN === 0 && currentM === 0) {
            return;
        }

        const collectionN = [];
        for (let i = 0; i < currentN; i++) {
            collectionN.push(parseInt(allLines[currentLineIndex++], 10));
        }

        const collectionM = [];
        for (let i = 0; i < currentM; i++) {
            collectionM.push(parseInt(allLines[currentLineIndex++], 10));
        }

        yield {
            countN: currentN,
            countM: currentM,
            dataN: collectionN,
            dataM: collectionM
        };
    }
}

function processDataSets(sourceText) {
    const dataSetIterator = generateInputLines(sourceText);

    for (const currentDataSet of dataSetIterator) {
        const { countN: numElementsA, countM: numElementsB, dataN: arrayA, dataM: arrayB } = currentDataSet;

        const sumOfA = arrayA.reduce((accumulator, value) => accumulator + value, 0);
        const sumOfB = arrayB.reduce((accumulator, value) => accumulator + value, 0);

        if ((sumOfA + sumOfB) % 2 !== 0) {
            console.log("-1");
            continue;
        }

        const requiredDifferenceForSwap = (sumOfA - sumOfB) / 2;

        const setOfBValues = new Set(arrayB);
        let foundOptimalPair = null;

        for (const elementA of arrayA) {
            const desiredElementB = elementA - requiredDifferenceForSwap;
            if (setOfBValues.has(desiredElementB)) {
                foundOptimalPair = { valA: elementA, valB: desiredElementB };
                break;
            }
        }

        if (foundOptimalPair) {
            console.log(`${foundOptimalPair.valA} ${foundOptimalPair.valB}`);
        } else {
            console.log("-1");
        }
    }
}

processDataSets(require("fs").readFileSync("/dev/stdin", "utf8"));
