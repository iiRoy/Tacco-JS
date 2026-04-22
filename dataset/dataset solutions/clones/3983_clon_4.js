function evaluateStreamContent(incomingPayload) {
    let initialSymbol = undefined;
    const firstMatch = incomingPayload.match(/^./s);
    if (firstMatch && firstMatch[0]) {
        initialSymbol = firstMatch[0];
    }

    let secondarySymbol = undefined;
    const secondMatch = incomingPayload.match(/\n.(.)/s);
    if (secondMatch && secondMatch[1]) {
        secondarySymbol = secondMatch[1];
    }

    let tertiarySymbol = undefined;
    const thirdMatch = incomingPayload.match(/\n[^\n]*\n..(.?)/s);
    if (thirdMatch && thirdMatch[1]) {
        tertiarySymbol = thirdMatch[1];
    }

    const compositeOutcome = String(initialSymbol) + String(secondarySymbol) + String(tertiarySymbol);
    console.log(compositeOutcome);
}

const acquiredDataChunk = require("node:fs").readFileSync("/dev/stdin", "utf-8");
evaluateStreamContent(acquiredDataChunk);