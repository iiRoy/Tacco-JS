const maxSafeNum = Number.MAX_SAFE_INTEGER;

const processInputData = (rawContent) => {
    const contentLines = rawContent.split('\n');

    const finalPair = contentLines.slice(1).reduce((accumulatorPair, currentLine) => {
        const lineParts = currentLine.split(' ');

        if (accumulatorPair[0] < lineParts[0]) {
            return lineParts;
        } else {
            return accumulatorPair;
        }
    }, [0, maxSafeNum]);

    const sumResult = Number(finalPair[0]) + Number(finalPair[1]);
    console.log(sumResult);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
