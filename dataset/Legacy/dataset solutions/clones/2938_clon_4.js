function processInputData(rawData) {
    const lines = rawData.split("\n");

    const [targetQuantity, additionalOfferTypes] = lines[0].split(" ").map(Number);

    const initialOffers = lines[1].split(" ").map(Number).map(singleItemPrice => [1, singleItemPrice]);

    const supplementaryOffers = lines.slice(2, 2 + additionalOfferTypes).map(line => {
        const [offerBatchSize, offerBatchPrice] = line.split(" ").map(Number);
        return [offerBatchSize, offerBatchPrice];
    });

    const availableOffers = initialOffers.concat(supplementaryOffers);

    availableOffers.sort((offerA, offerB) => offerB[1] - offerA[1]);

    const calculateOptimalValue = (offers, remainingTarget, currentOfferIndex, accumulatedValue) => {
        if (remainingTarget <= 0 || currentOfferIndex >= offers.length) {
            return accumulatedValue;
        }

        const [offerBatchSize, offerBatchPrice] = offers[currentOfferIndex];

        const itemsToTake = Math.min(offerBatchSize, remainingTarget);

        const newAccumulatedValue = accumulatedValue + itemsToTake * offerBatchPrice;
        const newRemainingTarget = remainingTarget - itemsToTake;

        return calculateOptimalValue(offers, newRemainingTarget, currentOfferIndex + 1, newAccumulatedValue);
    };

    const totalAcquiredValue = calculateOptimalValue(availableOffers, targetQuantity, 0, 0);

    console.log(totalAcquiredValue.toString());
    return totalAcquiredValue;
}

function testSolution(n) {
    const inputElement = document.getElementById("input" + n);
    if (!inputElement) {
        console.error(`Input element "input${n}" not found.`);
        return;
    }
    const inputVal = inputElement.value;
    const result = processInputData(inputVal);

    const outputElement = document.getElementById("output" + n);
    if (!outputElement) {
        console.error(`Output element "output${n}" not found.`);
        return;
    }
    const expectedOutput = outputElement.value.split("\n")[0];

    let status = "WA";
    if (result.toString() === expectedOutput) {
        status = "AC";
    }
    const resultElement = document.getElementById("result" + n);
    if (resultElement) {
        resultElement.innerHTML = status;
    } else {
        console.error(`Result element "result${n}" not found.`);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
