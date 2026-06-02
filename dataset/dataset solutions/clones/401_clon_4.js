const routeTariffs = new Map();

const establishRoute = (fromIdentifier, toIdentifier, tariffValue) => {
    if (!routeTariffs.has(fromIdentifier)) {
        routeTariffs.set(fromIdentifier, new Map());
    }
    routeTariffs.get(fromIdentifier).set(toIdentifier, tariffValue);
};

[
    [1, 2, 300], [1, 3, 500], [1, 4, 600], [1, 5, 700], [1, 6, 1350], [1, 7, 1650],
    [2, 1, 6], [2, 3, 350], [2, 4, 450], [2, 5, 600], [2, 6, 1150], [2, 7, 1500],
    [3, 1, 13], [3, 2, 7], [3, 4, 250], [3, 5, 400], [3, 6, 1000], [3, 7, 1350],
    [4, 1, 18], [4, 2, 12], [4, 3, 5], [4, 5, 250], [4, 6, 850], [4, 7, 1300],
    [5, 1, 23], [5, 2, 17], [5, 3, 10], [5, 4, 5], [5, 6, 600], [5, 7, 1150],
    [6, 1, 43], [6, 2, 37], [6, 3, 30], [6, 4, 25], [6, 5, 20], [6, 7, 500],
    [7, 1, 58], [7, 2, 52], [7, 3, 45], [7, 4, 40], [7, 5, 35], [7, 6, 15]
].forEach(([from, to, cost]) => establishRoute(from, to, cost));

const convertTimePartsToMinutes = (timeComponentArray) => {
    const [hours, minutes] = timeComponentArray.map(Number);
    return (hours * 60) + minutes;
};

const checkTimeWindowEligibility = (startMinutesTotal, endMinutesTotal) => {
    const firstBoundary = 1050;
    const secondBoundary = 1170;
    return (startMinutesTotal <= firstBoundary && endMinutesTotal < secondBoundary) ||
           (startMinutesTotal > firstBoundary && endMinutesTotal <= secondBoundary);
};

const checkReverseRouteEligibility = (originNode, destinationNode, tariffsMap) => {
    const reverseRouteValue = tariffsMap.get(destinationNode)?.get(originNode);
    return reverseRouteValue !== undefined && reverseRouteValue <= 40;
};

const calculateAdjustedFare = (initialFare, discountCount) => {
    if (discountCount === 2) {
        const reducedFare = Math.floor(initialFare / 2);
        return Math.ceil(reducedFare / 50) * 50;
    }
    return initialFare;
};

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedInputLines = rawInputData.replace(/\n$/, "").split("\n");

function* tripRecordGenerator(sourceLines) {
    let currentLinePointer = 0;
    while (true) {
        const currentOriginNode = Number(sourceLines[currentLinePointer++]);
        if (currentOriginNode === 0) break;

        const currentOriginTimeParts = sourceLines[currentLinePointer++].split(" ");
        const currentDestinationNode = Number(sourceLines[currentLinePointer++]);
        const currentDestinationTimeParts = sourceLines[currentLinePointer++].split(" ");

        yield {
            originNode: currentOriginNode,
            originTimeComponents: currentOriginTimeParts,
            destinationNode: currentDestinationNode,
            destinationTimeComponents: currentDestinationTimeParts
        };
    }
}

for (const tripDetails of tripRecordGenerator(processedInputLines)) {
    const departureTotalMinutes = convertTimePartsToMinutes(tripDetails.originTimeComponents);
    const arrivalTotalMinutes = convertTimePartsToMinutes(tripDetails.destinationTimeComponents);

    let totalDiscountQualifiers = 0;

    if (checkTimeWindowEligibility(departureTotalMinutes, arrivalTotalMinutes)) {
        totalDiscountQualifiers++;
    }

    if (checkReverseRouteEligibility(tripDetails.originNode, tripDetails.destinationNode, routeTariffs)) {
        totalDiscountQualifiers++;
    }

    const standardFare = routeTariffs.get(tripDetails.originNode).get(tripDetails.destinationNode);
    const finalComputedFare = calculateAdjustedFare(standardFare, totalDiscountQualifiers);

    console.log(finalComputedFare);
}
