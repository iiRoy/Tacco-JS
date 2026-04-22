function processInputData(sourceMaterial) {
    const dataLines = sourceMaterial.split("\n");
    const collectedResults = [];

    let lineCursor = 0;
    while (lineCursor < dataLines.length) {
        const sequenceLength = parseInt(dataLines[lineCursor], 10);
        lineCursor++;

        if (isNaN(sequenceLength) || sequenceLength <= 0) {
            if (lineCursor >= dataLines.length) break;
            continue;
        }

        const digitCharacterString = dataLines[lineCursor];
        lineCursor++;

        let currentNumericCollection = digitCharacterString.split("").map(Number);

        while (currentNumericCollection.length > 1) {
            currentNumericCollection = generateReducedCollection(currentNumericCollection);
        }

        collectedResults.push(currentNumericCollection[0]);
    }
    console.log(collectedResults.join("\n"));
}

function generateReducedCollection(incomingCollection) {
    const collectionSize = incomingCollection.length;
    if (collectionSize <= 1) {
        return incomingCollection;
    }

    const temporaryDifferences = incomingCollection.slice(0, collectionSize - 1).map((valueElement, indexPosition) => {
        return Math.abs(valueElement - incomingCollection[indexPosition + 1]);
    });

    temporaryDifferences.push(Math.abs(incomingCollection[collectionSize - 1] - incomingCollection[0]));

    temporaryDifferences.pop();

    return temporaryDifferences;
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));