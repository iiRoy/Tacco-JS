function computeResult(dataSource) {
    const allLines = dataSource.split("\n");

    const elementCount = Number(allLines[0]);

    const paramStrings = allLines[1].split(" ");
    const totalSpan = Number(paramStrings[0]);
    const initialValue = Number(paramStrings[1]);

    const intervalList = allLines
        .slice(2, 2 + elementCount)
        .map(item => Number(item));

    const finalOutcome = intervalList.reduce((accumulator, currentInterval) => {
        return accumulator + (1 + Math.floor((totalSpan - 1) / currentInterval));
    }, initialValue);

    console.log(finalOutcome);
}

computeResult(require("fs").readFileSync("/dev/stdin", "utf8"));