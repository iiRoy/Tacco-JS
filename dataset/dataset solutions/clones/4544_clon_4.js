function processInputString(dataStream) {
    const cleansedStream = dataStream.trim();
    const seenSymbols = new Set();
    const codeA = 'a'.charCodeAt(0);
    const codeZ = 'z'.charCodeAt(0);

    const checkResult = Array.from(cleansedStream).every(currentSymbol => {
        const charValue = currentSymbol.charCodeAt(0);
        if (charValue < codeA || charValue > codeZ) {
            return false;
        }
        if (seenSymbols.has(currentSymbol)) {
            return false;
        }
        seenSymbols.add(currentSymbol);
        return true;
    });

    if (checkResult) {
        console.log("yes");
    } else {
        console.log("no");
    }
}

processInputString(require("fs").readFileSync("/dev/stdin", "utf8"));