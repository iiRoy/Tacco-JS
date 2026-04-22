const routeDataSegments = [
    [1, 2, 300], [1, 3, 500], [1, 4, 600], [1, 5, 700], [1, 6, 1350], [1, 7, 1650],
    [2, 1, 6], [2, 3, 350], [2, 4, 450], [2, 5, 600], [2, 6, 1150], [2, 7, 1500],
    [3, 1, 13], [3, 2, 7], [3, 4, 250], [3, 5, 400], [3, 6, 1000], [3, 7, 1350],
    [4, 1, 18], [4, 2, 12], [4, 3, 5], [4, 5, 250], [4, 6, 850], [4, 7, 1300],
    [5, 1, 23], [5, 2, 17], [5, 3, 10], [5, 4, 5], [5, 6, 600], [5, 7, 1150],
    [6, 1, 43], [6, 2, 37], [6, 3, 30], [6, 4, 25], [6, 5, 20], [6, 7, 500],
    [7, 1, 58], [7, 2, 52], [7, 3, 45], [7, 4, 40], [7, 5, 35], [7, 6, 15]
];

const segmentTariffRegistry = new Map();
routeDataSegments.forEach(([origin, destination, cost]) => {
    if (!segmentTariffRegistry.has(origin)) {
        segmentTariffRegistry.set(origin, new Map());
    }
    segmentTariffRegistry.get(origin).set(destination, cost);
});

const journeyInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const journeyRecords = journeyInputContent.trim().split("\n");

const processAllJourneys = (records) => {
    const calculatedOutcomes = [];
    let recordIndex = 0;

    const convertTimeToMinutes = (timeString) => {
        return timeString.split(" ").reduce((totalMinutes, part, index) => {
            const num = Number(part);
            return totalMinutes + (index === 0 ? num * 60 : num);
        }, 0);
    };

    while (recordIndex < records.length) {
        const startPointIdentifier = Number(records[recordIndex++]);
        if (startPointIdentifier === 0) break;

        const departureTimeRaw = records[recordIndex++];
        const endPointIdentifier = Number(records[recordIndex++]);
        const arrivalTimeRaw = records[recordIndex++];

        const startMomentInMinutes = convertTimeToMinutes(departureTimeRaw);
        const endMomentInMinutes = convertTimeToMinutes(arrivalTimeRaw);

        let qualificationPoints = 0;

        const latestDiscountHour = 1170;
        if (endMomentInMinutes <= latestDiscountHour) {
            qualificationPoints++;
        }

        const reversePathThreshold = 40;
        const reversePathCost = segmentTariffRegistry.get(endPointIdentifier).get(startPointIdentifier);
        if (reversePathCost <= reversePathThreshold) {
            qualificationPoints++;
        }

        let currentJourneyFee = segmentTariffRegistry.get(startPointIdentifier).get(endPointIdentifier);

        if (qualificationPoints === 2) {
            currentJourneyFee = currentJourneyFee >> 1;
            currentJourneyFee = Math.ceil(currentJourneyFee / 50) * 50;
        }
        calculatedOutcomes.push(currentJourneyFee);
    }
    return calculatedOutcomes;
};

const finalResultList = processAllJourneys(journeyRecords);
finalResultList.forEach(costValue => console.log(costValue));