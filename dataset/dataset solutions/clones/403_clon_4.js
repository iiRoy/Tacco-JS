const journeyDataMapping = [
  [1, 2, 300], [1, 3, 500], [1, 4, 600], [1, 5, 700], [1, 6, 1350], [1, 7, 1650],
  [2, 1, 6], [2, 3, 350], [2, 4, 450], [2, 5, 600], [2, 6, 1150], [2, 7, 1500],
  [3, 1, 13], [3, 2, 7], [3, 4, 250], [3, 5, 400], [3, 6, 1000], [3, 7, 1350],
  [4, 1, 18], [4, 2, 12], [4, 3, 5], [4, 5, 250], [4, 6, 850], [4, 7, 1300],
  [5, 1, 23], [5, 2, 17], [5, 3, 10], [5, 4, 5], [5, 6, 600], [5, 7, 1150],
  [6, 1, 43], [6, 2, 37], [6, 3, 30], [6, 4, 25], [6, 5, 20], [6, 7, 500],
  [7, 1, 58], [7, 2, 52], [7, 3, 45], [7, 4, 40], [7, 5, 35], [7, 6, 15]
];

const travelInformation = new Map(
  journeyDataMapping.map(([startPoint, endPoint, costValue]) => [`${startPoint}_${endPoint}`, costValue])
);

const timeConverter = (hours, minutes) => (hours * 60) + minutes;
const isWithinSpecialWindow = (minuteValue) => (minuteValue >= 1050 && minuteValue <= 1170);
const calculateAdjustedPrice = (initialPrice) => Math.ceil((Math.floor(initialPrice / 2)) / 50) * 50;

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = rawInputContent.trim().split("\n");

const transactionRequests = [];
let lineIndex = 0;

while (lineIndex < processedLines.length) {
    const primaryStation = parseInt(processedLines[lineIndex++], 10);
    if (primaryStation === 0) break;

    const [departureHrs, departureMins] = processedLines[lineIndex++].split(" ").map(Number);
    const secondaryStation = parseInt(processedLines[lineIndex++], 10);
    const [arrivalHrs, arrivalMins] = processedLines[lineIndex++].split(" ").map(Number);

    transactionRequests.push({
        commencePoint: primaryStation,
        terminalPoint: secondaryStation,
        departureTimestamp: { hr: departureHrs, min: departureMins },
        arrivalTimestamp: { hr: arrivalHrs, min: arrivalMins }
    });
}

transactionRequests.forEach(request => {
    let specialConditionCount = 0;

    const departureTotalMinutes = timeConverter(request.departureTimestamp.hr, request.departureTimestamp.min);
    const arrivalTotalMinutes = timeConverter(request.arrivalTimestamp.hr, request.arrivalTimestamp.min);

    if (isWithinSpecialWindow(departureTotalMinutes) || isWithinSpecialWindow(arrivalTotalMinutes)) {
        specialConditionCount++;
    }

    const reverseRouteKey = `${request.terminalPoint}_${request.commencePoint}`;
    if (travelInformation.get(reverseRouteKey) <= 40) {
        specialConditionCount++;
    }

    let finalAmount = travelInformation.get(`${request.commencePoint}_${request.terminalPoint}`);

    if (specialConditionCount === 2) {
        finalAmount = calculateAdjustedPrice(finalAmount);
    }

    console.log(finalAmount);
});