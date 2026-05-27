function processInputData(rawData) {
    const contentLines = rawData.trim().split('\n');

    const nValue = Number.parseInt(contentLines[0], 10);

    const totalDays = contentLines[1]
        .split(' ')
        .map(Number.parseInt)
        .reduce((sumAccumulator, currentDayValue) => sumAccumulator + currentDayValue, 0);

    const remainingBalance = nValue - totalDays;
    console.log((remainingBalance < 0) ? -1 : remainingBalance);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
