process.stdin.on("data", function(inputBuffer) {
    const rawInputString = inputBuffer.toString();
    const trimmedInputContent = rawInputString.trim();
    const inputLinesArray = trimmedInputContent.split("\n");

    const elementPresenceMap = {};
    let totalMatchCount = 0;

    const PRESENCE_MARKER = 1;

    const populateMapFromLine = (lineContent, targetMap, markerValue) => {
        const elementsInLine = lineContent.split(" ");
        for (const currentElement of elementsInLine) {
            targetMap[currentElement] = markerValue;
        }
    };

    const firstSetSourceLine = inputLinesArray[1];
    populateMapFromLine(firstSetSourceLine, elementPresenceMap, PRESENCE_MARKER);

    const secondSetCheckLine = inputLinesArray[3];
    const elementsToVerify = secondSetCheckLine.split(" ");

    for (const itemToMatch of elementsToVerify) {
        if (elementPresenceMap[itemToMatch]) {
            totalMatchCount++;
        }
    }

    console.log(totalMatchCount);
}).resume();
