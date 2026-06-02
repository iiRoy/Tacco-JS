const generateTravelKey = (originNode, destinationNode) => `${originNode}to${destinationNode}`;

const convertHourMinuteArrayToMinutes = (timeComponents) => {
  const [hourValue, minuteValue] = timeComponents;
  return (parseInt(hourValue, 10) * 60) + parseInt(minuteValue, 10);
};

const travelCostRegistry = {
  [generateTravelKey(1, 2)]: 300,
  [generateTravelKey(1, 3)]: 500,
  [generateTravelKey(1, 4)]: 600,
  [generateTravelKey(1, 5)]: 700,
  [generateTravelKey(1, 6)]: 1350,
  [generateTravelKey(1, 7)]: 1650,
  [generateTravelKey(2, 1)]: 6,
  [generateTravelKey(2, 3)]: 350,
  [generateTravelKey(2, 4)]: 450,
  [generateTravelKey(2, 5)]: 600,
  [generateTravelKey(2, 6)]: 1150,
  [generateTravelKey(2, 7)]: 1500,
  [generateTravelKey(3, 1)]: 13,
  [generateTravelKey(3, 2)]: 7,
  [generateTravelKey(3, 4)]: 250,
  [generateTravelKey(3, 5)]: 400,
  [generateTravelKey(3, 6)]: 1000,
  [generateTravelKey(3, 7)]: 1350,
  [generateTravelKey(4, 1)]: 18,
  [generateTravelKey(4, 2)]: 12,
  [generateTravelKey(4, 3)]: 5,
  [generateTravelKey(4, 5)]: 250,
  [generateTravelKey(4, 6)]: 850,
  [generateTravelKey(4, 7)]: 1300,
  [generateTravelKey(5, 1)]: 23,
  [generateTravelKey(5, 2)]: 17,
  [generateTravelKey(5, 3)]: 10,
  [generateTravelKey(5, 4)]: 5,
  [generateTravelKey(5, 6)]: 600,
  [generateTravelKey(5, 7)]: 1150,
  [generateTravelKey(6, 1)]: 43,
  [generateTravelKey(6, 2)]: 37,
  [generateTravelKey(6, 3)]: 30,
  [generateTravelKey(6, 4)]: 25,
  [generateTravelKey(6, 5)]: 20,
  [generateTravelKey(6, 7)]: 500,
  [generateTravelKey(7, 1)]: 58,
  [generateTravelKey(7, 2)]: 52,
  [generateTravelKey(7, 3)]: 45,
  [generateTravelKey(7, 4)]: 40,
  [generateTravelKey(7, 5)]: 35,
  [generateTravelKey(7, 6)]: 15,
};

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedInputLines = rawInputContent.trimEnd().split("\n");

const ARRIVAL_TIME_DISCOUNT_THRESHOLD = 1170; // 19:30 in minutes
const REVERSE_ROUTE_COST_DISCOUNT_THRESHOLD = 40;
const FARE_ROUNDING_INCREMENT = 50;

let currentOriginNode;
do {
  currentOriginNode = Number(processedInputLines.shift());
  if (currentOriginNode === 0) {
    break;
  }

  const departureTimeParts = processedInputLines.shift().split(" ").map(Number);
  const currentDestinationNode = Number(processedInputLines.shift());
  const arrivalTimeParts = processedInputLines.shift().split(" ").map(Number);

  const totalDepartureMinutes = convertHourMinuteArrayToMinutes(departureTimeParts);
  const totalArrivalMinutes = convertHourMinuteArrayToMinutes(arrivalTimeParts);

  let discountEligibilityCounter = 0;

  // Check for arrival time condition
  // Original condition: (S<=1050 && G<=1170) || (S>=1050 && G<=1170)
  // This simplifies to G<=1170, as S's value doesn't affect the outcome if G is <= 1170.
  if (totalArrivalMinutes <= ARRIVAL_TIME_DISCOUNT_THRESHOLD) {
    discountEligibilityCounter++;
  }

  // Check for reverse route cost condition
  const reverseRouteKey = generateTravelKey(currentDestinationNode, currentOriginNode);
  if (travelCostRegistry[reverseRouteKey] <= REVERSE_ROUTE_COST_DISCOUNT_THRESHOLD) {
    discountEligibilityCounter++;
  }

  let finalCalculatedFare = travelCostRegistry[generateTravelKey(currentOriginNode, currentDestinationNode)];

  if (discountEligibilityCounter === 2) {
    // Apply 50% discount
    finalCalculatedFare = Math.floor(finalCalculatedFare / 2);
    // Round up to the nearest multiple of FARE_ROUNDING_INCREMENT
    finalCalculatedFare = Math.ceil(finalCalculatedFare / FARE_ROUNDING_INCREMENT) * FARE_ROUNDING_INCREMENT;
  }

  console.log(finalCalculatedFare);

} while (true);
