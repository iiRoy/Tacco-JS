const journeyTariffs = {
    1: { 2: 300, 3: 500, 4: 600, 5: 700, 6: 1350, 7: 1650 },
    2: { 1: 6, 3: 350, 4: 450, 5: 600, 6: 1150, 7: 1500 },
    3: { 1: 13, 2: 7, 4: 250, 5: 400, 6: 1000, 7: 1350 },
    4: { 1: 18, 2: 12, 3: 5, 5: 250, 6: 850, 7: 1300 },
    5: { 1: 23, 2: 17, 3: 10, 4: 5, 6: 600, 7: 1150 },
    6: { 1: 43, 2: 37, 3: 30, 4: 25, 5: 20, 7: 500 },
    7: { 1: 58, 2: 52, 3: 45, 4: 40, 5: 35, 6: 15 }
};

function* parseTravelRequests(rawInputString) {
    const inputLines = rawInputString.replace(/\n$/, "").split("\n");
    let currentLineIndex = 0;

    while (true) {
        const startLocationIdentifier = parseInt(inputLines[currentLineIndex++], 10);
        if (startLocationIdentifier === 0) {
            break;
        }

        const [departureHour, departureMinute] = inputLines[currentLineIndex++].split(" ").map(Number);
        const endLocationIdentifier = parseInt(inputLines[currentLineIndex++], 10);
        const [arrivalHour, arrivalMinute] = inputLines[currentLineIndex++].split(" ").map(Number);

        yield {
            departurePoint: startLocationIdentifier,
            departureTimeComponents: { hour: departureHour, minute: departureMinute },
            arrivalPoint: endLocationIdentifier,
            arrivalTimeComponents: { hour: arrivalHour, minute: arrivalMinute }
        };
    }
}

const calculateTotalMinutesFromComponents = ({ hour, minute }) => (hour * 60) + minute;

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

for (const travelRequest of parseTravelRequests(rawInputContent)) {
    const totalArrivalMinutes = calculateTotalMinutesFromComponents(travelRequest.arrivalTimeComponents);

    let tripCost = journeyTariffs[travelRequest.departurePoint][travelRequest.arrivalPoint];

    const isArrivalBeforeCutoff = totalArrivalMinutes <= 1170;
    const isReverseRouteShort = journeyTariffs[travelRequest.arrivalPoint][travelRequest.departurePoint] <= 40;

    if (isArrivalBeforeCutoff && isReverseRouteShort) {
        let reducedCost = Math.floor(tripCost / 2);
        reducedCost = (reducedCost % 50 === 0) ? reducedCost : (Math.floor(reducedCost / 50) + 1) * 50;
        tripCost = reducedCost;
    }

    console.log(tripCost);
}
