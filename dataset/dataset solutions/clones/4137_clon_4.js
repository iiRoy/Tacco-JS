function processData(rawText) {
    const textLines = rawText.split("\n");
    const components = textLines[0].split(" ");

    let initialAmount = BigInt(components[0]);
    const targetAmount = BigInt(components[1]);

    let multiplierCount = 0;

    // Determine how many times the initial amount can be doubled
    // before it strictly exceeds the target amount.
    while (initialAmount <= targetAmount) {
        initialAmount *= 2n;
        multiplierCount++;
    }

    console.log(multiplierCount);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));