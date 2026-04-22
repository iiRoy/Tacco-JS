const symbolAlterationMapping = new Map();
for (let val = 97; val <= 122; ++val) {
    symbolAlterationMapping.set(val, val - 32);
}
for (let val = 65; val <= 90; ++val) {
    symbolAlterationMapping.set(val, val + 32);
}

function processInputUnit(textSegment) {
    let transformedParts = [];
    let segmentLength = textSegment.length;

    for (let currentPos = 0; currentPos < segmentLength; ++currentPos) {
        let charVal = textSegment.codePointAt(currentPos);
        let alteredCode = symbolAlterationMapping.get(charVal);

        if (alteredCode === undefined) {
            alteredCode = charVal;
        }
        transformedParts.push(String.fromCodePoint(alteredCode));
    }
    return transformedParts.join("");
}

process.stdin.on("data", function(incomingBuffer) {
    let cleanString = String(incomingBuffer).trim();
    let finalResult = processInputUnit(cleanString);
    process.stdout.write(finalResult + "\n");
});

process.stdin.resume();