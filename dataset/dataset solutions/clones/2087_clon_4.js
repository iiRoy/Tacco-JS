const acquireSourceData = () => require("node:fs").readFileSync(0, "utf8").trim();

const obtainString = (val) => val;
const convertToInteger = (val) => Number.parseInt(val, 10);
const separateBySpace = (val) => val.split(" ");
const separateByNewline = (val) => val.split("\n");
const mapSpaceToNumbers = (val) => val.split(" ").map(Number);
const mapNewlineToNumbers = (val) => val.split("\n").map(Number);
const decomposeString = (val) => val.split("");
const decomposeToNumbers = (val) => val.split("").map(Number);

const processApplication = (rawSource) => {
    const allLines = separateByNewline(rawSource);

    const [configurationLine, firstPriceListLine, secondPriceListLine, ...remainingOfferLines] = allLines;

    // The original code parses A, B, M from the first line, but A and B are not used later. M is implicitly used as the count of remaining lines.
    // We parse them here to reflect the original's initial input interpretation, even if not all values are directly utilized.
    const [numItemsA, numItemsB, numOffers] = mapSpaceToNumbers(configurationLine);

    const pricesForA = mapSpaceToNumbers(firstPriceListLine);
    const pricesForB = mapSpaceToNumbers(secondPriceListLine);

    // Find minimum prices for A and B using a functional reduction
    const minValA = pricesForA.reduce((accumulator, currentVal) => Math.min(accumulator, currentVal), Infinity);
    const minValB = pricesForB.reduce((accumulator, currentVal) => Math.min(accumulator, currentVal), Infinity);

    let finalMinimumCost = minValA + minValB; // Initial minimum without any discount offers

    // Iterate through discount offers using a functional reduction
    finalMinimumCost = remainingOfferLines.reduce((currentOverallMin, offerDetailsString) => {
        const [itemAIndex, itemBIndex, discountAmount] = mapSpaceToNumbers(offerDetailsString);
        // Adjust indices for 0-based array access
        const calculatedCostForOffer = pricesForA[itemAIndex - 1] + pricesForB[itemBIndex - 1] - discountAmount;
        return Math.min(currentOverallMin, calculatedCostForOffer);
    }, finalMinimumCost); // Start reduction with the initial combined minimum

    console.log(finalMinimumCost);
};

processApplication(acquireSourceData());