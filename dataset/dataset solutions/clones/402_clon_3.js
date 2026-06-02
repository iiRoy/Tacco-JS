const travelCosts = {
  "1to2": 300, "1to3": 500, "1to4": 600, "1to5": 700, "1to6": 1350, "1to7": 1650,
  "2to1": 6, "2to3": 350, "2to4": 450, "2to5": 600, "2to6": 1150, "2to7": 1500,
  "3to1": 13, "3to2": 7, "3to4": 250, "3to5": 400, "3to6": 1000, "3to7": 1350,
  "4to1": 18, "4to2": 12, "4to3": 5, "4to5": 250, "4to6": 850, "4to7": 1300,
  "5to1": 23, "5to2": 17, "5to3": 10, "5to4": 5, "5to6": 600, "5to7": 1150,
  "6to1": 43, "6to2": 37, "6to3": 30, "6to4": 25, "6to5": 20, "6to7": 500,
  "7to1": 58, "7to2": 52, "7to3": 45, "7to4": 40, "7to5": 35, "7to6": 15
};

const convertTimePartsToMinutes = (timePartsArray) => {
  const [hours, minutes] = timePartsArray;
  return (hours * 60) + minutes;
};

const evaluateDiscountConditions = (startMins, goalMins, reverseRouteCost) => {
  let conditionsMetCount = 0;

  const isGoalTimeWithinWindow = goalMins <= 1170;
  if (isGoalTimeWithinWindow) {
    conditionsMetCount++;
  }

  const isReverseRouteShort = reverseRouteCost <= 40;
  if (isReverseRouteShort) {
    conditionsMetCount++;
  }

  return conditionsMetCount === 2;
};

const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');

let inputLines = rawInput.trimEnd().split("\n");

while (true) {
  const startLocation = parseInt(inputLines.shift(), 10);

  if (startLocation === 0) {
    break;
  }

  const startTimeParts = inputLines.shift().split(" ").map(Number);
  const goalLocation = parseInt(inputLines.shift(), 10);
  const goalTimeParts = inputLines.shift().split(" ").map(Number);

  const startMinutesTotal = convertTimePartsToMinutes(startTimeParts);
  const goalMinutesTotal = convertTimePartsToMinutes(goalTimeParts);

  const reverseRouteKey = `${goalLocation}to${startLocation}`;
  const reverseRouteCost = travelCosts[reverseRouteKey];

  const applyDiscount = evaluateDiscountConditions(
    startMinutesTotal,
    goalMinutesTotal,
    reverseRouteCost
  );

  let calculatedFare = travelCosts[`${startLocation}to${goalLocation}`];

  if (applyDiscount) {
    const discountedFareValue = Math.floor(calculatedFare / 2);
    calculatedFare = Math.ceil(discountedFareValue / 50) * 50;
  }

  console.log(calculatedFare);
}
