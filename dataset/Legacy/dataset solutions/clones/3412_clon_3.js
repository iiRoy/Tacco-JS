function processInputData(rawData) {
    const allInputLines = rawData.split('\n');

    const numberOfItemsStr = allInputLines[0];

    const priceStringList = allInputLines.slice(1);

    const itemPrices = priceStringList.map(priceStr => parseInt(priceStr, 10));

    let highestPrice = -Infinity;
    let highestPriceIndex = -1;
    for (let i = 0; i < itemPrices.length; i++) {
        const currentItemPrice = itemPrices[i];
        if (currentItemPrice > highestPrice) {
            highestPrice = currentItemPrice;
            highestPriceIndex = i;
        }
    }

    itemPrices.splice(highestPriceIndex, 1);

    const sumOfRemainingPrices = itemPrices.reduce((accumulator, currentVal) => accumulator + currentVal, 0);

    const discountedHighestPrice = highestPrice / 2;

    const finalTotalCost = sumOfRemainingPrices + discountedHighestPrice;

    console.log(Math.floor(finalTotalCost));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
