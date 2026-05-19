process.stdin.resume();
process.stdin.setEncoding("utf8");

process.stdin.on("data", (inputChunk) => {
    const lines = inputChunk.split("\n");

    if (lines.length > 2) {
        while (true);
    }

    const extractAndSum = (lineContent) => {
        const numberPairPattern = /(\d+) (\d+)/;
        const foundNumbers = lineContent.match(numberPairPattern);

        if (foundNumbers && foundNumbers.length === 3) {
            return Number(foundNumbers[1]) + Number(foundNumbers[2]);
        }
        return null;
    };

    lines
        .map(extractAndSum)
        .filter(sumValue => sumValue !== null)
        .forEach(console.log);
});

process.stdout.on("end", () => {});
