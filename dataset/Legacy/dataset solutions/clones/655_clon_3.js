process.stdin.resume();
process.stdin.setEncoding("utf8");

let inputBuffer = "";

const NUMBER_PAIR_PATTERN = /([\d]+) ([\d]+)/;

function processNumberPair(matchArray) {
    const firstNumString = matchArray[1];
    const secondNumString = matchArray[2];

    const integerParser = parseInt;

    const parsedFirst = integerParser(firstNumString);
    const parsedSecond = integerParser(secondNumString);

    const calculatedSum = parsedFirst + parsedSecond;

    return calculatedSum.toString();
}

process.stdin.on("data", (dataChunk) => {
    inputBuffer += dataChunk;
});

process.stdin.on("end", () => {
    const lines = inputBuffer.split("\n");

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const currentLine = lines[lineIndex];
        const matchResult = NUMBER_PAIR_PATTERN.exec(currentLine);

        if (matchResult && matchResult.length === 3) {
            const sumAsString = processNumberPair(matchResult);
            process.stdout.write(sumAsString);
            process.stdout.write("\n");
        }
    }
});
