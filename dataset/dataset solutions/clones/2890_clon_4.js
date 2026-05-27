function processInputData(rawData) {
    const lineSegments = rawData.split("\n");
    const mainLine = lineSegments[0];

    const relevantCharacters = Array.from(mainLine).filter(
        (charElement) => charElement !== 'o'
    );

    const finalCount = relevantCharacters.length;

    console.log(finalCount >= 8 ? "NO" : "YES");
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
