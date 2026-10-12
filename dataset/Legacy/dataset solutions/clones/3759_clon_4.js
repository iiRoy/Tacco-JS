const processInputData = (rawData) => {
    const parsedLines = rawData.split('\n');

    const [countItems, topCount] = parsedLines[0].split(' ').map(Number);

    const absoluteSums = parsedLines.slice(1, countItems + 1).map(line => {
        const currentLineValues = line.split(' ').map(Number);
        const lineTotal = currentLineValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        return Math.abs(lineTotal);
    });

    const sortedSums = absoluteSums.sort((first, second) => second - first);

    const finalResult = sortedSums.slice(0, topCount).reduce((accumulator, current) => accumulator + current, 0);

    console.log(finalResult);

    return 0;
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
