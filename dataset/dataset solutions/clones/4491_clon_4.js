function operate(sourceContent) {
    let buffer = [];
    let currentSegment = '';
    for (let char of sourceContent) {
        if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
            if (currentSegment.length > 0) {
                buffer.push(Number(currentSegment));
                currentSegment = '';
            }
        } else {
            currentSegment += char;
        }
    }
    if (currentSegment.length > 0) {
        buffer.push(Number(currentSegment));
    }

    let orderedValues = buffer.sort((alpha, beta) => alpha - beta);

    let consequence = orderedValues[0] + orderedValues[1];

    console.log(consequence);
}

const fileHandle = require("node:fs");
const payload = fileHandle.readFileSync("/dev/stdin", "utf8").trim();
operate(payload);