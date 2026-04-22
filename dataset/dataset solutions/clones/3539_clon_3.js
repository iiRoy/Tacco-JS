const evaluateFulfillmentCapacity = (rawDataString) => {
    let successfulFulfillmentCount = 0;

    const dataLines = rawDataString.trim().split('\n');

    if (dataLines.length < 2) {
        console.error("Input format error: Expecting at least two lines of data.");
        return;
    }

    const parametersLine = dataLines[0].split(' ');
    const totalIndividualsConsidered = Number(parametersLine[0]);
    const maximumCandyBudget = Number(parametersLine[1]);

    if (isNaN(totalIndividualsConsidered) || isNaN(maximumCandyBudget)) {
        console.error("Data parsing error: Numeric parameters expected for participants and budget.");
        return;
    }

    let individualDemandQuantities = dataLines[1].split(' ').map(Number);

    individualDemandQuantities = individualDemandQuantities.filter(demand => !isNaN(demand) && demand >= 0);

    individualDemandQuantities.sort((valA, valB) => valA - valB);

    let cumulativeCandyConsumed = 0;
    let supplyHasBeenExceeded = false;

    for (let currentDemandIndex = 0; currentDemandIndex < totalIndividualsConsidered; ++currentDemandIndex) {
        if (currentDemandIndex >= individualDemandQuantities.length) {
            break;
        }

        const currentDemandAmount = individualDemandQuantities[currentDemandIndex];
        cumulativeCandyConsumed += currentDemandAmount;

        if (cumulativeCandyConsumed > maximumCandyBudget) {
            successfulFulfillmentCount = currentDemandIndex;
            supplyHasBeenExceeded = true;
            break;
        }
    }

    if (supplyHasBeenExceeded) {
        console.log(successfulFulfillmentCount);
    } else {
        console.log(totalIndividualsConsidered);
    }
};

evaluateFulfillmentCapacity(require('fs').readFileSync('/dev/stdin', 'utf8'));