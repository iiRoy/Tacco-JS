// This object stores the calculated travel charges for various routes.
// Keys are formatted as "X_travel_Y" indicating a journey from station X to station Y.
var journeyCosts = {};

  journeyCosts["1_travel_2"] = 300;
  journeyCosts["1_travel_3"] = 500;
  journeyCosts["1_travel_4"] = 600;
  journeyCosts["1_travel_5"] = 700;
  journeyCosts["1_travel_6"] = 1350;
  journeyCosts["1_travel_7"] = 1650;

  journeyCosts["2_travel_1"] = 6;
  journeyCosts["2_travel_3"] = 350;
  journeyCosts["2_travel_4"] = 450;
  journeyCosts["2_travel_5"] = 600;
  journeyCosts["2_travel_6"] = 1150;
  journeyCosts["2_travel_7"] = 1500;

  journeyCosts["3_travel_1"] = 13;
  journeyCosts["3_travel_2"] = 7;
  journeyCosts["3_travel_4"] = 250;
  journeyCosts["3_travel_5"] = 400;
  journeyCosts["3_travel_6"] = 1000;
  journeyCosts["3_travel_7"] = 1350;

  journeyCosts["4_travel_1"] = 18;
  journeyCosts["4_travel_2"] = 12;
  journeyCosts["4_travel_3"] = 5;
  journeyCosts["4_travel_5"] = 250;
  journeyCosts["4_travel_6"] = 850;
  journeyCosts["4_travel_7"] = 1300;

  journeyCosts["5_travel_1"] = 23;
  journeyCosts["5_travel_2"] = 17;
  journeyCosts["5_travel_3"] = 10;
  journeyCosts["5_travel_4"] = 5;
  journeyCosts["5_travel_6"] = 600;
  journeyCosts["5_travel_7"] = 1150;

  journeyCosts["6_travel_1"] = 43;
  journeyCosts["6_travel_2"] = 37;
  journeyCosts["6_travel_3"] = 30;
  journeyCosts["6_travel_4"] = 25;
  journeyCosts["6_travel_5"] = 20;
  journeyCosts["6_travel_7"] = 500;

  journeyCosts["7_travel_1"] = 58;
  journeyCosts["7_travel_2"] = 52;
  journeyCosts["7_travel_3"] = 45;
  journeyCosts["7_travel_4"] = 40;
  journeyCosts["7_travel_5"] = 35;
  journeyCosts["7_travel_6"] = 15;

// Acquire the file system module for input operations.
var fileSystemModule = require('fs');

// Read all data from standard input, remove any final newline, and segment into an array of lines.
var rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
var processedLines = rawInputData.replace(/\n$/,"").split("\n");

// Loop through each scenario provided in the input data.
while (true) {
   // Extract the identifier for the starting location and convert it to a number.
   var departurePoint = Number(processedLines.shift());

   // A departure point of 0 indicates the end of the input stream.
   if (departurePoint === 0) {
      break;
   }

   // Get the time components (hour and minute) for the start time, converting them to numbers.
   var firstTimeComponents = (processedLines.shift()).split(" ").map(val => Number(val));

   // Extract the identifier for the destination and convert it to a number.
   var arrivalPoint = Number(processedLines.shift());

   // Get the time components (hour and minute) for the end time, converting them to numbers.
   var secondTimeComponents = (processedLines.shift()).split(" ").map(value => Number(value));

   // Compute the total minutes from midnight for the journey's start time.
   var startTotalMinutes = (parseInt(firstTimeComponents[0], 10) * 60) + parseInt(firstTimeComponents[1], 10);

   // Compute the total minutes from midnight for the journey's end time.
   var endTotalMinutes = (parseInt(secondTimeComponents[0], 10) * 60) + parseInt(secondTimeComponents[1], 10);

   // Initialize a counter for conditions met for a potential discount.
   var discountConditionMet = 0;

   // Evaluate the first condition: specific time windows for departure and arrival.
   if ( (startTotalMinutes <= 1050 && endTotalMinutes < 1170) || (startTotalMinutes > 1050 && endTotalMinutes <= 1170) ) {
      discountConditionMet++;
   }

   // Evaluate the second condition: a specific route cost threshold for the reverse journey.
   // This refers to the cost from the arrival point back to the departure point.
   if (journeyCosts[arrivalPoint + "_travel_" + departurePoint] <= 40) {
      discountConditionMet++;
   }

   // Fetch the initial fare for the journey from the departure to arrival point.
   var finalFareAmount = journeyCosts[departurePoint + "_travel_" + arrivalPoint];

   // Apply discount logic if both conditions are satisfied.
   if (discountConditionMet === 2) {
      // Halve the fare and round it down.
      finalFareAmount = Math.floor(finalFareAmount / 2);
      // Increment the fare until it is a multiple of 50.
      while (finalFareAmount % 50 !== 0) {
         finalFareAmount++;
      }
   }
   // Display the calculated final fare.
   console.log(finalFareAmount);
}