function processInputData(rawData) {
    const lines = rawData.split('\n');

    const firstLineTokens = lines[0].split(' ');
    const totalItems = Number(firstLineTokens[0]);
    const queryCount = Number(firstLineTokens[1]);

    const itemColors = lines[1].split(' ');

    const queryResults = [];

    Array.from({ length: queryCount }, (_, queryIndex) => {
        const queryLineTokens = lines[queryIndex + 2].split(' ');
        const rangeStart = Number(queryLineTokens[0]);
        const rangeEnd = Number(queryLineTokens[1]);

        const segmentColors = itemColors.slice(rangeStart - 1, rangeEnd);
        const distinctColorSet = new Set(segmentColors);
        queryResults.push(distinctColorSet.size);
    });

    queryResults.forEach(resultValue => console.log(resultValue));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
