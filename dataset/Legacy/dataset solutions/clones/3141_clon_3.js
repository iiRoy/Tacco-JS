'use strict';

const parseLineToNumbers = (lineStr) => lineStr.split(" ").map(Number);

function processInput(rawData) {
    const inputLines = rawData.trim().split("\n");

    const firstLineValues = parseLineToNumbers(inputLines[0]);
    const numberOfShops = firstLineValues[0];
    let drinksToAcquire = firstLineValues[1];

    const shopOfferings = new Array(numberOfShops);
    for (let shopIndex = 0; shopIndex < numberOfShops; shopIndex++) {
        shopOfferings[shopIndex] = parseLineToNumbers(inputLines[shopIndex + 1]);
    }

    shopOfferings.sort((offerA, offerB) => offerA[0] - offerB[0]);

    let accumulatedCost = 0;

    for (let shopIndex = 0; shopIndex < numberOfShops; shopIndex++) {
        if (drinksToAcquire <= 0) {
            break;
        }

        const currentShopOffer = shopOfferings[shopIndex];
        const unitPrice = currentShopOffer[0];
        const availableStock = currentShopOffer[1];

        const quantityToBuy = Math.min(availableStock, drinksToAcquire);

        accumulatedCost += unitPrice * quantityToBuy;
        drinksToAcquire -= quantityToBuy;
    }

    console.log(accumulatedCost);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
