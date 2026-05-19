function processInput(rawData) {
  const lines = rawData.split("\n");

  const firstLineParts = lines[0].split(" ");
  const itemCount = Number.parseInt(firstLineParts[0], 10);
  const discountTickets = Number.parseInt(firstLineParts[1], 10);

  const priceStrings = lines[1].split(" ");
  let itemPrices = priceStrings.map(priceStr => Number.parseInt(priceStr, 10));

  const findMaxPriceAndIndex = (pricesArray) => {
    if (pricesArray.length === 0) {
      return { maxVal: -1, idx: -1 };
    }
    let currentMaxVal = pricesArray[0];
    let currentMaxIdx = 0;
    for (let k = 1; k < pricesArray.length; k++) {
      if (pricesArray[k] > currentMaxVal) {
        currentMaxVal = pricesArray[k];
        currentMaxIdx = k;
      }
    }
    return { maxVal: currentMaxVal, idx: currentMaxIdx };
  };

  let ticketUsedCount = 0;

  if (itemCount > 1) {
    while (ticketUsedCount < discountTickets) {
      const { maxVal: currentMaxPrice, idx: maxPriceIndex } = findMaxPriceAndIndex(itemPrices);

      const currentTotalSum = itemPrices.reduce((accumulator, currentPrice) => accumulator + currentPrice, 0);
      let calculatedDiscountFactor = Math.ceil(currentMaxPrice / currentTotalSum);

      const remainingTickets = discountTickets - ticketUsedCount;
      if (calculatedDiscountFactor > remainingTickets) {
        calculatedDiscountFactor = remainingTickets;
      }

      const divisor = Math.pow(2, calculatedDiscountFactor);
      itemPrices[maxPriceIndex] = Math.floor(itemPrices[maxPriceIndex] / divisor);
      ticketUsedCount += calculatedDiscountFactor;
    }
  } else {
    const finalDivisorForSingleItem = Math.pow(2, discountTickets);
    itemPrices[0] = Math.floor(itemPrices[0] / finalDivisorForSingleItem);
  }

  console.log(itemPrices.reduce((accumulator, currentPrice) => accumulator + currentPrice, 0));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
