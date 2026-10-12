var routePrices = {}; // This object stores the base prices for various routes between stations.

routePrices["1to2"] = 300;
routePrices["1to3"] = 500;
routePrices["1to4"] = 600;
routePrices["1to5"] = 700;
routePrices["1to6"] = 1350;
routePrices["1to7"] = 1650;

routePrices["2to1"] = 6;
routePrices["2to3"] = 350;
routePrices["2to4"] = 450;
routePrices["2to5"] = 600;
routePrices["2to6"] = 1150;
routePrices["2to7"] = 1500;

routePrices["3to1"] = 13;
routePrices["3to2"] = 7;
routePrices["3to4"] = 250;
routePrices["3to5"] = 400;
routePrices["3to6"] = 1000;
routePrices["3to7"] = 1350;

routePrices["4to1"] = 18;
routePrices["4to2"] = 12;
routePrices["4to3"] = 5;
routePrices["4to5"] = 250;
routePrices["4to6"] = 850;
routePrices["4to7"] = 1300;

routePrices["5to1"] = 23;
routePrices["5to2"] = 17;
routePrices["5to3"] = 10;
routePrices["5to4"] = 5;
routePrices["5to6"] = 600;
routePrices["5to7"] = 1150;

routePrices["6to1"] = 43;
routePrices["6to2"] = 37;
routePrices["6to3"] = 30;
routePrices["6to4"] = 25;
routePrices["6to5"] = 20;
routePrices["6to7"] = 500;

routePrices["7to1"] = 58;
routePrices["7to2"] = 52;
routePrices["7to3"] = 45;
routePrices["7to4"] = 40;
routePrices["7to5"] = 35;
routePrices["7to6"] = 15;

// Read all input from standard input as a string.
var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove trailing newline and split into an array of lines.
var lineSegments = (fileContent.replace(/\n$/, "")).split("\n");

// Loop indefinitely to process travel requests until a specific termination condition is met.
while (true) {
    // Extract the starting station identifier from the input lines.
    var originStation = lineSegments.shift() - 0;

    // If the starting station is 0, it signals the end of input, so break the loop.
    if (originStation === 0) {
        break;
    }

    // Parse the departure time components (hour and minute) from the next line.
    var departureDetails = (lineSegments.shift()).split(" ").map(Number);

    // Extract the destination station identifier.
    var destinationStation = lineSegments.shift() - 0;

    // Parse the arrival time components (hour and minute) from the subsequent line.
    var arrivalDetails = (lineSegments.shift()).split(" ").map(Number);

    // Convert the departure time from hour/minute format to total minutes past midnight.
    var departureInMinutes = (parseInt(departureDetails[0], 10) * 60) + parseInt(departureDetails[1], 10);

    // Convert the arrival time from hour/minute format to total minutes past midnight.
    var arrivalInMinutes = (parseInt(arrivalDetails[0], 10) * 60) + parseInt(arrivalDetails[1], 10);

    // Initialize a counter to track how many discount conditions are met.
    var discountQualifiers = 0;

    // Evaluate the first discount condition based on time windows.
    // This condition checks if the arrival time is within a specific range, regardless of departure.
    if ((departureInMinutes <= 1050 && arrivalInMinutes <= 1170) || (departureInMinutes >= 1050 && arrivalInMinutes <= 1170)) {
        discountQualifiers++;
    }

    // Evaluate the second discount condition based on the price of the reverse route.
    // If the cost from destination to origin is 40 or less, it contributes to a discount.
    if (routePrices[destinationStation + "to" + originStation] <= 40) {
        discountQualifiers++;
    }

    // Retrieve the base fare for the journey from the route prices object.
    var calculatedFare = routePrices[originStation + "to" + destinationStation];

    // If both discount conditions are satisfied, apply the special fare adjustment.
    if (discountQualifiers === 2) {
        // Halve the fare, rounding down to the nearest integer.
        calculatedFare = Math.floor(calculatedFare / 2);
        // Then, increment the fare until it is a multiple of 50.
        while (calculatedFare % 50 !== 0) {
            calculatedFare++;
        }
    }

    // Print the final calculated fare to the console.
    console.log(calculatedFare);
}
