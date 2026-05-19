function processInputData(rawData) {
    const lines = rawData.split("\n");
    let targetAmount = parseInt(lines[0]);

    let hundredsCount = 0;
    while (targetAmount >= 500) {
        targetAmount -= 500;
        hundredsCount++;
    }

    let fivesCount = 0;
    while (targetAmount >= 5) {
        targetAmount -= 5;
        fivesCount++;
    }

    console.log(hundredsCount + fivesCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
