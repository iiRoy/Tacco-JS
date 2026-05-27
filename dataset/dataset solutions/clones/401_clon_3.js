const costMap = {
  "1to2": 300, "1to3": 500, "1to4": 600, "1to5": 700, "1to6": 1350, "1to7": 1650,
  "2to1": 6, "2to3": 350, "2to4": 450, "2to5": 600, "2to6": 1150, "2to7": 1500,
  "3to1": 13, "3to2": 7, "3to4": 250, "3to5": 400, "3to6": 1000, "3to7": 1350,
  "4to1": 18, "4to2": 12, "4to3": 5, "4to5": 250, "4to6": 850, "4to7": 1300,
  "5to1": 23, "5to2": 17, "5to3": 10, "5to4": 5, "5to6": 600, "5to7": 1150,
  "6to1": 43, "6to2": 37, "6to3": 30, "6to4": 25, "6to5": 20, "6to7": 500,
  "7to1": 58, "7to2": 52, "7to3": 45, "7to4": 40, "7to5": 35, "7to6": 15
};

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = (rawInputData.replace(/\n$/, "")).split("\n");

const convertTimeToMinutes = (timeParts) => {
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  return (hours * 60) + minutes;
};

const EVENING_DISCOUNT_START_MINUTES = 1050; // 17:30
const EVENING_DISCOUNT_END_MINUTES = 1170;   // 19:30

while (true) {
  const currentStartStation = parseInt(inputLines.shift(), 10);
  if (currentStartStation === 0) {
    break;
  }

  const startTimeComponents = inputLines.shift().split(" ").map(Number);
  const currentEndStation = parseInt(inputLines.shift(), 10);
  const endTimeComponents = inputLines.shift().split(" ").map(Number);

  const startMinutesTotal = convertTimeToMinutes(startTimeComponents);
  const endMinutesTotal = convertTimeToMinutes(endTimeComponents);

  let discountConditionCount = 0;

  const isStartWithinEarlyEvening = startMinutesTotal <= EVENING_DISCOUNT_START_MINUTES;
  const isEndBeforeLateEvening = endMinutesTotal < EVENING_DISCOUNT_END_MINUTES;
  const isStartAfterEarlyEvening = startMinutesTotal > EVENING_DISCOUNT_START_MINUTES;
  const isEndWithinLateEvening = endMinutesTotal <= EVENING_DISCOUNT_END_MINUTES;

  if ((isStartWithinEarlyEvening && isEndBeforeLateEvening) || (isStartAfterEarlyEvening && isEndWithinLateEvening)) {
    discountConditionCount++;
  }

  const reverseRouteKey = currentEndStation + "to" + currentStartStation;
  if (costMap[reverseRouteKey] <= 40) {
    discountConditionCount++;
  }

  let tripFare = costMap[currentStartStation + "to" + currentEndStation];

  if (discountConditionCount === 2) {
    tripFare = Math.floor(tripFare / 2);
    tripFare = Math.ceil(tripFare / 50) * 50;
  }

  console.log(tripFare);
}
