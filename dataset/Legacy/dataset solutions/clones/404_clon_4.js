const routeTariffs = new Map([
    [1, new Map([[2, 300], [3, 500], [4, 600], [5, 700], [6, 1350], [7, 1650]])],
    [2, new Map([[1, 6], [3, 350], [4, 450], [5, 600], [6, 1150], [7, 1500]])],
    [3, new Map([[1, 13], [2, 7], [4, 250], [5, 400], [6, 1000], [7, 1350]])],
    [4, new Map([[1, 18], [2, 12], [3, 5], [5, 250], [6, 850], [7, 1300]])],
    [5, new Map([[1, 23], [2, 17], [3, 10], [4, 5], [6, 600], [7, 1150]])],
    [6, new Map([[1, 43], [2, 37], [3, 30], [4, 25], [5, 20], [7, 500]])],
    [7, new Map([[1, 58], [2, 52], [3, 45], [4, 40], [5, 35], [6, 15]])]
]);

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedInputLines = rawInputContent.trimEnd().split('\n');

let currentLineIndex = 0;

while (true) {
    const startLocationIdentifier = Number(processedInputLines[currentLineIndex++]);
    if (startLocationIdentifier === 0) {
        break;
    }

    const [startHourValue, startMinuteValue] = processedInputLines[currentLineIndex++].split(' ').map(Number);
    const endLocationIdentifier = Number(processedInputLines[currentLineIndex++]);
    const [endHourValue, endMinuteValue] = processedInputLines[currentLineIndex++].split(' ').map(Number);

    const totalStartMinutesFromMidnight = (startHourValue * 60) + startMinuteValue;
    const totalEndMinutesFromMidnight = (endHourValue * 60) + endMinuteValue;

    let discountEligibilityCounter = 0;

    if (totalEndMinutesFromMidnight <= 1170) {
        discountEligibilityCounter++;
    }

    const reverseRouteCost = routeTariffs.get(endLocationIdentifier)?.get(startLocationIdentifier);
    if (reverseRouteCost !== undefined && reverseRouteCost <= 40) {
        discountEligibilityCounter++;
    }

    let calculatedFare = routeTariffs.get(startLocationIdentifier)?.get(endLocationIdentifier);

    if (discountEligibilityCounter === 2) {
        calculatedFare = Math.floor(calculatedFare / 2);
        calculatedFare = Math.ceil(calculatedFare / 50) * 50;
    }

    console.log(calculatedFare);
}
