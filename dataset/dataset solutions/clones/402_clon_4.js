const fareMatrix = Array(8).fill(null).map(() => Array(8).fill(0));

fareMatrix[1][2] = 300; fareMatrix[1][3] = 500; fareMatrix[1][4] = 600; fareMatrix[1][5] = 700; fareMatrix[1][6] = 1350; fareMatrix[1][7] = 1650;
fareMatrix[2][1] = 6; fareMatrix[2][3] = 350; fareMatrix[2][4] = 450; fareMatrix[2][5] = 600; fareMatrix[2][6] = 1150; fareMatrix[2][7] = 1500;
fareMatrix[3][1] = 13; fareMatrix[3][2] = 7; fareMatrix[3][4] = 250; fareMatrix[3][5] = 400; fareMatrix[3][6] = 1000; fareMatrix[3][7] = 1350;
fareMatrix[4][1] = 18; fareMatrix[4][2] = 12; fareMatrix[4][3] = 5; fareMatrix[4][5] = 250; fareMatrix[4][6] = 850; fareMatrix[4][7] = 1300;
fareMatrix[5][1] = 23; fareMatrix[5][2] = 17; fareMatrix[5][3] = 10; fareMatrix[5][4] = 5; fareMatrix[5][6] = 600; fareMatrix[5][7] = 1150;
fareMatrix[6][1] = 43; fareMatrix[6][2] = 37; fareMatrix[6][3] = 30; fareMatrix[6][4] = 25; fareMatrix[6][5] = 20; fareMatrix[6][7] = 500;
fareMatrix[7][1] = 58; fareMatrix[7][2] = 52; fareMatrix[7][3] = 45; fareMatrix[7][4] = 40; fareMatrix[7][5] = 35; fareMatrix[7][6] = 15;

const parseClockToMinutes = (clockString) => {
    const [hours, minutes] = clockString.split(" ").map(Number);
    return hours * 60 + minutes;
};

const qualifiesForEveningDiscount = (arrivalMinutes) => {
    const eveningThreshold = 1170; // 19:30
    return arrivalMinutes <= eveningThreshold;
};

const qualifiesForShortReverseDiscount = (initialNode, finalNode, matrix) => {
    const reverseTripValue = matrix[finalNode][initialNode];
    const shortTripThreshold = 40;
    return reverseTripValue <= shortTripThreshold;
};

const adjustToNearestFiftyUp = (value) => {
    return Math.ceil(value / 50) * 50;
};

const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = sourceData.trim().split("\n");

let travelSegments = [];
let currentLineIndex = 0;

while (currentLineIndex < dataLines.length) {
    const startingPoint = Number(dataLines[currentLineIndex]);
    if (startingPoint === 0) break;

    travelSegments.push({
        startingPoint: startingPoint,
        departureClockString: dataLines[currentLineIndex + 1],
        endingPoint: Number(dataLines[currentLineIndex + 2]),
        arrivalClockString: dataLines[currentLineIndex + 3]
    });
    currentLineIndex += 4;
}

const computedFares = travelSegments.map(segment => {
    const origin = segment.startingPoint;
    const destination = segment.endingPoint;
    const arrivalTimeInMins = parseClockToMinutes(segment.arrivalClockString);

    const baseCharge = fareMatrix[origin][destination];

    const isEveningTrip = qualifiesForEveningDiscount(arrivalTimeInMins);
    const isShortReturn = qualifiesForShortReverseDiscount(origin, destination, fareMatrix);

    let finalCharge = baseCharge;

    if (isEveningTrip && isShortReturn) {
        finalCharge = Math.floor(baseCharge / 2);
        finalCharge = adjustToNearestFiftyUp(finalCharge);
    }
    return finalCharge;
});

computedFares.forEach(charge => console.log(charge));