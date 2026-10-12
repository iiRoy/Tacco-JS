'use strict';

const parseOfferDetails = (offerString) => {
    const components = offerString.split(" ");
    const itemPrice = Number(components[0]);
    const itemTime = Number(components[1]);
    return { price: itemPrice, time: itemTime };
};

function processInputData(rawData) {
    const allInputLines = rawData.split("\n");

    const headerLineParts = allInputLines[0].split(" ");
    const maximumAllowedTime = Number(headerLineParts[1]);

    const NO_VALID_OFFER_FOUND_SENTINEL = 9999;
    let currentCheapestPrice = NO_VALID_OFFER_FOUND_SENTINEL;

    const offerEntryLines = allInputLines.slice(1);

    for (const singleOfferLine of offerEntryLines) {
        const offerInfo = parseOfferDetails(singleOfferLine);
        const offerPrice = offerInfo.price;
        const offerCompletionTime = offerInfo.time;

        const isTimeWithinLimit = offerCompletionTime <= maximumAllowedTime;
        const isPriceLower = offerPrice < currentCheapestPrice;

        if (isTimeWithinLimit && isPriceLower) {
            currentCheapestPrice = offerPrice;
        }
    }

    const finalResult = (currentCheapestPrice === NO_VALID_OFFER_FOUND_SENTINEL) ? "TLE" : currentCheapestPrice;
    console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
