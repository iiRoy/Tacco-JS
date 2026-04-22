const processInputSequence = (sourceContent) => {
    const dataLines = sourceContent.toString().trim().split(/\r?\n/);
    let currentPosition = 0;

    const retrieveNextDatum = () => {
        if (currentPosition >= dataLines.length) {
            return undefined;
        }
        return dataLines[currentPosition++];
    };

    const collectedOutputs = [];

    while (true) {
        if (currentPosition >= dataLines.length) {
            break;
        }
        if (dataLines[currentPosition] === "0") {
            currentPosition++;
            break;
        }

        const mapEntryCount = parseInt(retrieveNextDatum(), 10);
        const replacementRegister = new Map();

        for (let idxA = 0; idxA < mapEntryCount; idxA++) {
            const entryComponents = retrieveNextDatum().split(" ");
            replacementRegister.set(entryComponents[0], entryComponents[1]);
        }

        const transformItemCount = parseInt(retrieveNextDatum(), 10);
        const resultantSegments = [];

        for (let idxB = 0; idxB < transformItemCount; idxB++) {
            const itemKey = retrieveNextDatum();
            resultantSegments.push(
                replacementRegister.has(itemKey)
                    ? replacementRegister.get(itemKey)
                    : itemKey
            );
        }
        collectedOutputs.push(resultantSegments.join(''));
    }
    return collectedOutputs.join('\n');
};

const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(processInputSequence(fileData));