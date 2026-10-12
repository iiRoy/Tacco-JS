const tripCosts = {};

tripCosts["1to2"] = 300;
tripCosts["1to3"] = 500;
tripCosts["1to4"] = 600;
tripCosts["1to5"] = 700;
tripCosts["1to6"] = 1350;
tripCosts["1to7"] = 1650;
tripCosts["2to1"] = 6;
tripCosts["2to3"] = 350;
tripCosts["2to4"] = 450;
tripCosts["2to5"] = 600;
tripCosts["2to6"] = 1150;
tripCosts["2to7"] = 1500;
tripCosts["3to1"] = 13;
tripCosts["3to2"] = 7;
tripCosts["3to4"] = 250;
tripCosts["3to5"] = 400;
tripCosts["3to6"] = 1000;
tripCosts["3to7"] = 1350;
tripCosts["4to1"] = 18;
tripCosts["4to2"] = 12;
tripCosts["4to3"] = 5;
tripCosts["4to5"] = 250;
tripCosts["4to6"] = 850;
tripCosts["4to7"] = 1300;
tripCosts["5to1"] = 23;
tripCosts["5to2"] = 17;
tripCosts["5to3"] = 10;
tripCosts["5to4"] = 5;
tripCosts["5to6"] = 600;
tripCosts["5to7"] = 1150;
tripCosts["6to1"] = 43;
tripCosts["6to2"] = 37;
tripCosts["6to3"] = 30;
tripCosts["6to4"] = 25;
tripCosts["6to5"] = 20;
tripCosts["6to7"] = 500;
tripCosts["7to1"] = 58;
tripCosts["7to2"] = 52;
tripCosts["7to3"] = 45;
tripCosts["7to4"] = 40;
tripCosts["7to5"] = 35;
tripCosts["7to6"] = 15;

const convertToTotalMinutes = (hourStr, minuteStr) => {
    const hours = parseInt(hourStr, 10);
    const minutes = parseInt(minuteStr, 10);
    return (hours * 60) + minutes;
};

const isWithinPeakWindow = (timeInMinutes) => {
    const PEAK_START_MINUTES = 1050; // Corresponds to 17:30
    const PEAK_END_MINUTES = 1170;   // Corresponds to 19:30
    return timeInMinutes >= PEAK_START_MINUTES && timeInMinutes <= PEAK_END_MINUTES;
};

const REVERSE_TRIP_THRESHOLD = 40;
const FARE_ROUNDING_UNIT = 50;
const INPUT_FILE_PATH = '/dev/stdin';

const rawInputContent = require('fs').readFileSync(INPUT_FILE_PATH, 'utf8');
let inputLines = rawInputContent.replace(/\n$/, "").split("\n");

while (true) {
    const startStationId = Number(inputLines.shift());
    if (startStationId === 0) {
        break;
    }

    const startTimeParts = inputLines.shift().split(" ").map(Number);
    const endStationId = Number(inputLines.shift());
    const endTimeParts = inputLines.shift().split(" ").map(Number);

    const totalStartMinutes = convertToTotalMinutes(startTimeParts[0], startTimeParts[1]);
    const totalEndMinutes = convertToTotalMinutes(endTimeParts[0], endTimeParts[1]);

    let discountConditionMetCount = 0;

    const isTimeBasedDiscountEligible = isWithinPeakWindow(totalStartMinutes) || isWithinPeakWindow(totalEndMinutes);
    if (isTimeBasedDiscountEligible) {
        discountConditionMetCount++;
    }

    const reverseTripKey = `${endStationId}to${startStationId}`;
    const reverseTripCost = tripCosts[reverseTripKey];
    const isReverseTripCostLow = reverseTripCost <= REVERSE_TRIP_THRESHOLD;
    if (isReverseTripCostLow) {
        discountConditionMetCount++;
    }

    let currentFare = tripCosts[`${startStationId}to${endStationId}`];

    if (discountConditionMetCount === 2) {
        const halfFare = Math.floor(currentFare / 2);
        currentFare = Math.ceil(halfFare / FARE_ROUNDING_UNIT) * FARE_ROUNDING_UNIT;
    }

    console.log(currentFare);
}
