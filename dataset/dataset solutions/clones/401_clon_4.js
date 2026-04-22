const tariffBook = new Map();

const addTariffEntry = (origin, destination, costValue) => {
    if (!tariffBook.has(origin)) {
        tariffBook.set(origin, new Map());
    }
    tariffBook.get(origin).set(destination, costValue);
};

// Populate the tariff book with all route costs
addTar TariffEntry(1, 2, 300); addTariffEntry(1, 3, 500); addTariffEntry(1, 4, 600); addTariffEntry(1, 5, 700); addTariffEntry(1, 6, 1350); addTariffEntry(1, 7, 1650);
addTariffEntry(2, 1, 6); addTariffEntry(2, 3, 350); addTariffEntry(2, 4, 450); addTariffEntry(2, 5, 600); addTariffEntry(2, 6, 1150); addTariffEntry(2, 7, 1500);
addTariffEntry(3, 1, 13); addTariffEntry(3, 2, 7); addTariffEntry(3, 4, 250); addTariffEntry(3, 5, 400); addTariffEntry(3, 6, 1000); addTariffEntry(3, 7, 1350);
addTariffEntry(4, 1, 18); addTariffEntry(4, 2, 12); addTariffEntry(4, 3, 5); addTariffEntry(4, 5, 250); addTariffEntry(4, 6, 850); addTariffEntry(4, 7, 1300);
addTariffEntry(5, 1, 23); addTariffEntry(5, 2, 17); addTariffEntry(5, 3, 10); addTariffEntry(5, 4, 5); addTariffEntry(5, 6, 600); addTariffEntry(5, 7, 1150);
addTariffEntry(6, 1, 43); addTariffEntry(6, 2, 37); addTariffEntry(6, 3, 30); addTariffEntry(6, 4, 25); addTariffEntry(6, 5, 20); addTariffEntry(6, 7, 500);
addTariffEntry(7, 1, 58); addTariffEntry(7, 2, 52); addTariffEntry(7, 3, 45); addTariffEntry(7, 4, 40); addTariffEntry(7, 5, 35); addTariffEntry(7, 6, 15);

const evaluateTimeWindow = (departInMinutes, arriveInMinutes) => {
    const afternoonBoundary = 1050; // Corresponds to 17:30
    const eveningBoundary = 1170;  // Corresponds to 19:30

    const firstPeriodCondition = (departInMinutes <= afternoonBoundary && arriveInMinutes < eveningBoundary);
    const secondPeriodCondition = (departInMinutes > afternoonBoundary && arriveInMinutes <= eveningBoundary);

    return (firstPeriodCondition || secondPeriodCondition) ? 1 : 0;
};

let allInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let processedLines = allInputContent.trim().split("\n");
let currentLineIndex = 0;

const getNextInputLine = () => processedLines[currentLineIndex++];

while (true) {
    let startingPoint = Number(getNextInputLine());
    if (startingPoint === 0) break;

    let departureTimeComponents = getNextInputLine().split(" ").map(Number);
    let endingPoint = Number(getNextInputLine());
    let arrivalTimeComponents = getNextInputLine().split(" ").map(Number);

    let totalDepartureMinutes = (departureTimeComponents[0] * 60) + departureTimeComponents[1];
    let totalArrivalMinutes = (arrivalTimeComponents[0] * 60) + arrivalTimeComponents[1];

    let discountEligibilityCounter = 0;
    discountEligibilityCounter += evaluateTimeWindow(totalDepartureMinutes, totalArrivalMinutes);

    let reverseRouteCost = tariffBook.get(endingPoint).get(startingPoint);
    discountEligibilityCounter += (reverseRouteCost <= 40) ? 1 : 0;

    let calculatedFare = tariffBook.get(startingPoint).get(endingPoint);

    if (discountEligibilityCounter === 2) {
        calculatedFare = Math.floor(calculatedFare / 2);
        // Round up to the nearest multiple of 50
        calculatedFare = Math.ceil(calculatedFare / 50) * 50;
    }
    console.log(calculatedFare);
}