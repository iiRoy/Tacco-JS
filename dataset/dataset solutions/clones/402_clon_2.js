let travelCosts = {}; // Stores travel costs between different stations

// Initialize the travel cost matrix
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

// Read all input data from standard input
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input: remove any trailing newline and split into an array of lines
let processedLines = rawInputData.replace(/\n$/, '').split('\n');

// Loop through each travel scenario provided in the input
while (true) {
    // Extract the starting station ID for the current scenario
    let originStationId = parseInt(processedLines.shift(), 10);

    // If the starting station ID is 0, it signifies the end of input
    if (originStationId === 0) {
        break;
    }

    // Parse the departure time components (hour and minute)
    const departureTimeComponents = processedLines.shift().split(' ').map(Number);

    // Extract the destination station ID for the current scenario
    let destinationStationId = parseInt(processedLines.shift(), 10);

    // Parse the arrival time components (hour and minute)
    const arrivalTimeComponents = processedLines.shift().split(' ').map(Number);

    // Calculate the total departure minutes from midnight
    const totalDepartureMinutes = (parseInt(departureTimeComponents[0], 10) * 60) + parseInt(departureTimeComponents[1], 10);

    // Calculate the total arrival minutes from midnight
    const totalArrivalMinutes = (parseInt(arrivalTimeComponents[0], 10) * 60) + parseInt(arrivalTimeComponents[1], 10);

    // Initialize a counter for special discount conditions
    let discountConditionCount = 0;

    // Check the first discount condition based on departure and arrival times
    if ((totalDepartureMinutes <= 1050 && totalArrivalMinutes <= 1170) || (totalDepartureMinutes >= 1050 && totalArrivalMinutes <= 1170)) {
        discountConditionCount++;
    }

    // Check the second discount condition based on the reverse route's cost
    if (travelCosts[destinationStationId + 'to' + originStationId] <= 40) {
        discountConditionCount++;
    }

    // Retrieve the base fare for the journey from the cost map
    let currentFare = travelCosts[originStationId + 'to' + destinationStationId];

    // Apply discount if both special conditions are met
    if (discountConditionCount === 2) {
        currentFare = Math.floor(currentFare / 2); // Halve the fare
        // Round the discounted fare up to the nearest multiple of 50
        while (currentFare % 50 !== 0) {
            currentFare++;
        }
    }

    // Output the final calculated fare for the current scenario
    console.log(currentFare);
}
