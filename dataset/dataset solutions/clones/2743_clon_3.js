function processInputData(rawData) {
    const parseInteger = (str) => parseInt(str, 10);

    const lines = rawData.split("\n");
    const totalElements = parseInteger(lines[0]);
    const numericValues = lines.slice(1).map(parseInteger);

    let stackAssignments = new Map();
    let nextStackIdentifier = 0;
    stackAssignments.set(nextStackIdentifier, numericValues[0]);

    const reorderStacksByValueDescending = (mapToReorder) => {
        return new Map([...mapToReorder.entries()].sort((entryA, entryB) => entryB[1] - entryA[1]));
    };

    for (let currentValIndex = 1; currentValIndex < totalElements; currentValIndex++) {
        const currentValue = numericValues[currentValIndex];
        let targetStackToUpdate = null;

        for (const [stackKey, stackValue] of stackAssignments.entries()) {
            if (stackValue < currentValue) {
                targetStackToUpdate = stackKey;
                break;
            }
        }

        if (targetStackToUpdate === null) {
            nextStackIdentifier++;
            stackAssignments.set(nextStackIdentifier, currentValue);
        } else {
            stackAssignments.set(targetStackToUpdate, currentValue);
        }

        stackAssignments = reorderStacksByValueDescending(stackAssignments);
    }

    console.log(nextStackIdentifier + 1);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
