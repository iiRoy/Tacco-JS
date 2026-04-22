let routePricing = {};

// This object stores the base travel costs between various locations.
// Keys represent routes, e.g., "1to2" for a journey from location 1 to 2.
// Values are numerical representing the fare.

routePricing["1to2"] = 300;
routePricing["1to3"] = 500;
routePricing["1to4"] = 600;
routePricing["1to5"] = 700;
routePricing["1to6"] = 1350;
routePricing["1to7"] = 1650;

routePricing["2to1"] = 6;
routePricing["2to3"] = 350;
routePricing["2to4"] = 450;
routePricing["2to5"] = 600;
routePricing["2to6"] = 1150;
routePricing["2to7"] = 1500;

routePricing["3to1"] = 13;
routePricing["3to2"] = 7;
routePricing["3to4"] = 250;
routePricing["3to5"] = 400;
routePricing["3to6"] = 1000;
routePricing["3to7"] = 1350;

routePricing["4to1"] = 18;
routePricing["4to2"] = 12;
routePricing["4to3"] = 5;
routePricing["4to5"] = 250;
routePricing["4to6"] = 850;
routePricing["4to7"] = 1300;

routePricing["5to1"] = 23;
routePricing["5to2"] = 17;
routePricing["5to3"] = 10;
routePricing["5to4"] = 5;
routePricing["5to6"] = 600;
routePricing["5to7"] = 1150;

routePricing["6to1"] = 43;
routePricing["6to2"] = 37;
routePricing["6to3"] = 30;
routePricing["6to4"] = 25;
routePricing["6to5"] = 20;
routePricing["6to7"] = 500;

routePricing["7to1"] = 58;
routePricing["7to2"] = 52;
routePricing["7to3"] = 45;
routePricing["7to4"] = 40;
routePricing["7to5"] = 35;
routePricing["7to6"] = 15;

// Helper function to print the final computed value.
const outputResult = (value) => {
  console.log(value);
};

// Read all incoming data from the standard input stream.
const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Prepare the input data: remove any trailing newline character
// and then split the entire string into an array of individual lines.
let processedLines = (inputData.replace(/\n$/, "")).split("\n");

// Begin processing each travel request set from the input lines.
// This loop continues until a specific termination condition is met.
while (true) {
  // Extract the identifier for the starting location.
  // The `- 0` converts the string to a number.
  let startPointId = processedLines.shift() - 0;

  // If the starting location ID is 0, it signals the end of input,
  // so the loop terminates.
  if (startPointId === 0) {
    break;
  }

  // Parse the hour and minute components for the departure time.
  // The string is split by space and each part is converted to an integer.
  const firstTimeParts = (processedLines.shift()).split(" ").map(strVal => parseInt(strVal, 10));

  // Extract the identifier for the ending location.
  let endPointId = processedLines.shift() - 0;

  // Parse the hour and minute components for the arrival time.
  const secondTimeParts = (processedLines.shift()).split(" ").map(strVal => parseInt(strVal, 10));

  // Calculate the total number of minutes from midnight for the departure time.
  const totalStartMinutes = (firstTimeParts[0] * 60) + firstTimeParts[1];

  // Calculate the total number of minutes from midnight for the arrival time.
  const totalEndMinutes = (secondTimeParts[0] * 60) + secondTimeParts[1];

  // Initialize a counter to track conditions met for a potential discount.
  let discountCounter = 0;

  // Check the first condition for discount eligibility:
  // if both start and end times fall within specific time windows.
  if ((totalStartMinutes <= 1050 && totalEndMinutes <= 1170) || (totalStartMinutes >= 1050 && totalEndMinutes <= 1170)) {
    discountCounter++;
  }

  // Check the second condition for discount eligibility:
  // if the fare for the reverse route (destination to origin) is below a certain threshold.
  if (routePricing[endPointId + "to" + startPointId] <= 40) {
    discountCounter++;
  }

  // Retrieve the base fare for the specified direct route.
  let calculatedAmount = routePricing[startPointId + "to" + endPointId];

  // If both discount conditions are met (discountCounter is 2), apply the discount.
  if (discountCounter === 2) {
    // Halve the calculated amount, rounding down to the nearest whole number.
    calculatedAmount = Math.floor(calculatedAmount / 2);
    // Adjust the discounted amount to be the next multiple of 50.
    while (calculatedAmount % 50 !== 0) {
      calculatedAmount++;
    }
  }

  // Output the final computed fare for the current travel request.
  outputResult(calculatedAmount);
}