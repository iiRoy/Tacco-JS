function processOperations(rawInput) {
    const inputLines = rawInput.split("\n");
    let currentOrientation = 1;
    const leadingSegments = [];
    const trailingSegments = [inputLines[0]];

    inputLines.slice(1).forEach(commandEntry => {
        const commandParts = commandEntry.split(" ");
        const actionIdentifier = parseInt(commandParts[0], 10);

        if (actionIdentifier === 1) {
            currentOrientation *= -1;
        } else {
            const operationKind = parseInt(commandParts[1], 10);
            const segmentContent = commandParts[2];

            const shouldAppend = (currentOrientation === 1 && operationKind === 1) || (currentOrientation === -1 && operationKind === 2);

            if (shouldAppend) {
                trailingSegments.push(segmentContent);
            } else {
                leadingSegments.push(segmentContent);
            }
        }
    });

    const finalStringRepresentation = leadingSegments.slice().reverse().join('') + trailingSegments.join('');

    if (currentOrientation === 1) {
        console.log(finalStringRepresentation.split('').reverse().join(''));
    } else {
        console.log(finalStringRepresentation);
    }
}
processOperations(require("fs").readFileSync("/dev/stdin", "utf8").trim());
