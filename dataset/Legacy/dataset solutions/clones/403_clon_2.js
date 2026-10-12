var routeCosts = {}; // Object to store various route costs or durations

// Initialize route costs for different segments
routeCosts["1to2"] = 300;
routeCosts["1to3"] = 500;
routeCosts["1to4"] = 600;
routeCosts["1to5"] = 700;
routeCosts["1to6"] = 1350;
routeCosts["1to7"] = 1650;
routeCosts["2to1"] = 6;
routeCosts["2to3"] = 350;
routeCosts["2to4"] = 450;
routeCosts["2to5"] = 600;
routeCosts["2to6"] = 1150;
routeCosts["2to7"] = 1500;
routeCosts["3to1"] = 13;
routeCosts["3to2"] = 7;
routeCosts["3to4"] = 250;
routeCosts["3to5"] = 400;
routeCosts["3to6"] = 1000;
routeCosts["3to7"] = 1350;
routeCosts["4to1"] = 18;
routeCosts["4to2"] = 12;
routeCosts["4to3"] = 5;
routeCosts["4to5"] = 250;
routeCosts["4to6"] = 850;
routeCosts["4to7"] = 1300;
routeCosts["5to1"] = 23;
routeCosts["5to2"] = 17;
routeCosts["5to3"] = 10;
routeCosts["5to4"] = 5;
routeCosts["5to6"] = 600;
routeCosts["5to7"] = 1150;
routeCosts["6to1"] = 43;
routeCosts["6to2"] = 37;
routeCosts["6to3"] = 30;
routeCosts["6to4"] = 25;
routeCosts["6to5"] = 20;
routeCosts["6to7"] = 500;
routeCosts["7to1"] = 58;
routeCosts["7to2"] = 52;
routeCosts["7to3"] = 45;
routeCosts["7to4"] = 40;
routeCosts["7to5"] = 35;
routeCosts["7to6"] = 15;

// Read all input from standard input
var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process input: remove trailing newline and split into an array of lines
var inputLines = (rawData.replace(/\n$/, "")).split("\n");

// Loop through input data until a termination condition is met
while (true) {
  // Extract the starting point identifier, converting it to a number
  var startPoint = inputLines.shift() - 0;

  // If the starting point is 0, terminate the processing loop
  if (startPoint === 0) {
    break;
  }

  // Parse the start time (hour and minute) from the next line
  var startTimeParts = (inputLines.shift()).split(" ").map(Number);

  // Extract the ending point identifier, converting it to a number
  var endPoint = inputLines.shift() - 0;

  // Parse the end time (hour and minute) from the next line
  var endTimeParts = (inputLines.shift()).split(" ").map(Number);

  // Calculate total minutes from midnight for the start time
  var totalStartMinutes = (parseInt(startTimeParts[0], 10) * 60) + parseInt(startTimeParts[1], 10);

  // Calculate total minutes from midnight for the end time
  var totalEndMinutes = (parseInt(endTimeParts[0], 10) * 60) + parseInt(endTimeParts[1], 10);

  // Initialize a counter for discount conditions
  var discountFactors = 0;

  // Check if either the start or end time falls within a specific window (1050-1170 minutes)
  if ((totalStartMinutes >= 1050 && totalStartMinutes <= 1170) || (totalEndMinutes >= 1050 && totalEndMinutes <= 1170)) {
    discountFactors++;
  }

  // Check if the reverse route cost (end to start) is less than or equal to 40
  if (routeCosts[endPoint + "to" + startPoint] <= 40) {
    discountFactors++;
  }

  // Retrieve the base fare for the current route (start to end)
  var calculatedFare = routeCosts[startPoint + "to" + endPoint];

  // Apply discount if both conditions are met
  if (discountFactors === 2) {
    // Halve the fare and round down
    calculatedFare = Math.floor(calculatedFare / 2);
    // Adjust the fare upwards until it's a multiple of 50
    while (calculatedFare % 50 !== 0) {
      calculatedFare++;
    }
  }

  // Output the final calculated fare
  console.log(calculatedFare);
}
