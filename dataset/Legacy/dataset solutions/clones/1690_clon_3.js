function processInputData(rawData) {
    const linesArray = rawData.split("\n");
    const numCasesString = linesArray[0];
    const numCases = parseInt(numCasesString, 10);

    const resultCounts = {
        "AC": 0,
        "WA": 0,
        "TLE": 0,
        "RE": 0
    };

    const incrementStatusCount = (statusKey) => {
        resultCounts[statusKey]++;
    };

    const statusLines = linesArray.slice(1, numCases + 1);

    statusLines.forEach(currentStatus => {
        incrementStatusCount(currentStatus);
    });

    const orderedStatuses = ["AC", "WA", "TLE", "RE"];

    const displayFormattedResult = (statusType, countValue) => {
        console.log(`${statusType} x ${countValue}`);
    };

    orderedStatuses.forEach(status => {
        displayFormattedResult(status, resultCounts[status]);
    });
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
