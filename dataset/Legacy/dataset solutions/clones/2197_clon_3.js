function processInput(rawData) {
    let currentValue = parseInt(rawData);
    let doubledCount = 1;
    let totalOutput = 1;

    while (true) {
        currentValue = currentValue / 2;

        if (currentValue < 1) {
            break;
        }

        doubledCount = doubledCount * 2;
        totalOutput = totalOutput + doubledCount;
    }

    console.log(totalOutput);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));