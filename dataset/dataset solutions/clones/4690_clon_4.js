function processInputAndCalculate(rawData) {
    const parts = rawData.trim().split(" ");
    const quantity = parseInt(parts[0]);

    const fullBlocks = Math.floor(quantity / 15);
    const remainingItems = quantity % 15;

    const blockValue = 11800 * fullBlocks;
    const itemValue = 800 * remainingItems;

    console.log(blockValue + itemValue);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
