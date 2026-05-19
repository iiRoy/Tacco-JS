let travelCosts = {}; // This object stores various travel costs or durations between different points.

// Initialize travel costs for various routes.
travelCosts["1to2"] = 300;
travelCosts["1to3"] = 500;
travelCosts["1to4"] = 600;
travelCosts["1to5"] = 700;
travelCosts["1to6"] = 1350;
travelCosts["1to7"] = 1650;

travelCosts["2to1"] = 6;
travelCosts["2to3"] = 350;
travelCosts["2to4"] = 450;
travelCosts["2to5"] = 600;
travelCosts["2to6"] = 1150;
travelCosts["2to7"] = 1500;

travelCosts["3to1"] = 13;
travelCosts["3to2"] = 7;
travelCosts["3to4"] = 250;
travelCosts["3to5"] = 400;
travelCosts["3to6"] = 1000;
travelCosts["3to7"] = 1350;

travelCosts["4to1"] = 18;
travelCosts["4to2"] = 12;
travelCosts["4to3"] = 5;
travelCosts["4to5"] = 250;
travelCosts["4to6"] = 850;
travelCosts["4to7"] = 1300;

travelCosts["5to1"] = 23;
travelCosts["5to2"] = 17;
travelCosts["5to3"] = 10;
travelCosts["5to4"] = 5;
travelCosts["5to6"] = 600;
travelCosts["5to7"] = 1150;

travelCosts["6to1"] = 43;
travelCosts["6to2"] = 37;
travelCosts["6to3"] = 30;
travelCosts["6to4"] = 25;
travelCosts["6to5"] = 20;
travelCosts["6to7"] = 500;

travelCosts["7to1"] = 58;
travelCosts["7to2"] = 52;
travelCosts["7to3"] = 45;
travelCosts["7to4"] = 40;
travelCosts["7to5"] = 35;
travelCosts["7to6"] = 15;

// Read all input data from standard input using Node.js 'fs' module.
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Pre-process the input: remove any trailing newline character and then split the string into an array of lines.
let inputLines = (rawInputData.replace(/\n$/, "")).split("\n");

// Begin the main processing loop. This loop continues indefinitely until an explicit break condition is met.
while (true) {
    // Extract the starting point identifier from the input lines and convert it to a numeric type.
    let currentStartPoint = inputLines.shift() - 0;

    // Check for the termination condition: if the starting point is 0, exit the loop.
    if (currentStartPoint === 0) {
        break;
    }

    // Retrieve the next line, split it by space, and convert parts to numbers to get start hour and minute.
    const startHourMinute = (inputLines.shift()).split(" ").map(Number);

    // Extract the destination point identifier and convert it to a numeric type.
    let currentEndPoint = inputLines.shift() - 0;

    // Retrieve the next line, split it by space, and convert parts to numbers to get end hour and minute.
    const endHourMinute = (inputLines.shift()).split(" ").map(Number);

    // Calculate the total number of minutes from midnight for the start time.
    const totalMinutesStart = (parseInt(startHourMinute[0], 10) * 60) + parseInt(startHourMinute[1], 10);

    // Calculate the total number of minutes from midnight for the end time.
    const totalMinutesEnd = (parseInt(endHourMinute[0], 10) * 60) + parseInt(endHourMinute[1], 10);

    // Initialize a counter to track specific conditions that might affect the fare.
    let specialConditionCounter = 0;

    // Evaluate the first condition based on start and end times.
    // This checks if the journey falls within certain time windows (e.g., peak/off-peak).
    if ((totalMinutesStart <= 1050 && totalMinutesEnd < 1170) || (totalMinutesStart > 1050 && totalMinutesEnd <= 1170)) {
        specialConditionCounter++;
    }

    // Evaluate the second condition based on the cost of the reverse route.
    // If the cost from end to start is 40 or less, increment the counter.
    if (travelCosts[currentEndPoint + "to" + currentStartPoint] <= 40) {
        specialConditionCounter++;
    }

    // Retrieve the base fare for the journey from the 'travelCosts' map.
    let finalFare = travelCosts[currentStartPoint + "to" + currentEndPoint];

    // If both special conditions are met (counter is 2), apply a discount and adjust the fare.
    if (specialConditionCounter === 2) {
        finalFare = Math.floor(finalFare / 2); // Halve the fare.
        // Adjust the fare upwards until it is a multiple of 50.
        while (finalFare % 50 !== 0) {
            finalFare++;
        }
    }

    // Output the final calculated fare to the console.
    console.log(finalFare);
}
