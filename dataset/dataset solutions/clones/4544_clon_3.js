function processInputString(dataString) {
    dataString = dataString.trim();

    const charPool = new Set();
    for (let charCodeOffset = 0; charCodeOffset < 26; charCodeOffset++) {
        charPool.add(String.fromCharCode(97 + charCodeOffset));
    }

    let isValidSequence = true;

    for (let charIndex = 0; charIndex < dataString.length; charIndex++) {
        const currentSymbol = dataString[charIndex];

        if (charPool.has(currentSymbol)) {
            charPool.delete(currentSymbol);
        } else {
            isValidSequence = false;
            break;
        }
    }

    if (isValidSequence) {
        console.log("yes");
    } else {
        console.log("no");
    }
}

processInputString(require("fs").readFileSync("/dev/stdin", "utf8"));
