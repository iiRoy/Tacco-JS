function processInputData(rawData) {
    const lines = rawData.split("\n");

    const totalElements = Number(lines[0]);
    const [limitOne, limitTwo] = lines[1].split(" ").map(Number);

    const numericValues = lines[2].split(" ").map(Number);
    numericValues.sort((valA, valB) => valA - valB);

    const categoryCounts = numericValues.reduce((acc, currentVal) => {
        if (currentVal <= limitOne) {
            acc.groupAlpha++;
        } else if (currentVal <= limitTwo) {
            acc.groupBeta++;
        } else {
            acc.groupGamma++;
        }
        return acc;
    }, { groupAlpha: 0, groupBeta: 0, groupGamma: 0 });

    console.log(Math.min(categoryCounts.groupAlpha, categoryCounts.groupBeta, categoryCounts.groupGamma));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
