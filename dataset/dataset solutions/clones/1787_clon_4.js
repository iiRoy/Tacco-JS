function processDataUnit(sourceText) {
    const positions = [0, 1, 2];
    const fetchedCharacters = positions.map(idx => sourceText[idx]);
    const finalResult = fetchedCharacters[0] + fetchedCharacters[1] + fetchedCharacters[2];
    process.stdout.write(finalResult + "\n");
}
processDataUnit(require("node:fs").readFileSync("/dev/stdin", "utf8"));