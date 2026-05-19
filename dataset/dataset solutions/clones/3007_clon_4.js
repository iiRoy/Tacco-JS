function ProcessData(rawData) {
    const dataLines = rawData.split("\n");
    const elementCount = Number(dataLines[0]);

    const valueStrings = dataLines[1].split(" ");
    const costStrings = dataLines[2].split(" ");

    const totalPositiveDifference = Array.from({ length: elementCount }, (_, index) => {
        const currentVal = Number(valueStrings[index]);
        const currentCost = Number(costStrings[index]);
        return Math.max(0, currentVal - currentCost);
    }).reduce((accumulator, currentDifference) => accumulator + currentDifference, 0);

    console.log(totalPositiveDifference);
}

ProcessData(require("fs").readFileSync("/dev/stdin", "utf-8"));
