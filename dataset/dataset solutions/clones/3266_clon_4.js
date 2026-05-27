function processInputData(rawData) {
    const requiredDigits = new Set(["1", "7", "4", "9"]);
    const initialTokens = rawData.split(" ").slice(0, 4);

    const foundUniqueDigits = new Set(
        initialTokens.filter(token => requiredDigits.has(token))
    );

    if (foundUniqueDigits.size === requiredDigits.size) {
        console.log('YES');
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
