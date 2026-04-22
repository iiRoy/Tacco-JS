const travelCosts = {}; // Initialize an object to store travel costs between locations

travelCosts["firstToSecond"]=300;
travelCosts["firstToThird"]=500;
travelCosts["firstToFourth"]=600;
travelCosts["firstToFifth"]=700;
travelCosts["firstToSixth"]=1350;
travelCosts["firstToSeventh"]=1650;
travelCosts["secondToFirst"]=6;
travelCosts["secondToThird"]=350;
travelCosts["secondToFourth"]=450;
travelCosts["secondToFifth"]=600;
travelCosts["secondToSixth"]=1150;
travelCosts["secondToSeventh"]=1500;
travelCosts["thirdToFirst"]=13;
travelCosts["thirdToSecond"]=7;
travelCosts["thirdToFourth"]=250;
travelCosts["thirdToFifth"]=400;
travelCosts["thirdToSixth"]=1000;
travelCosts["thirdToSeventh"]=1350;
travelCosts["fourthToFirst"]=18;
travelCosts["fourthToSecond"]=12;
travelCosts["fourthToThird"]=5;
travelCosts["fourthToFifth"]=250;
travelCosts["fourthToSixth"]=850;
travelCosts["fourthToSeventh"]=1300;
travelCosts["fifthToFirst"]=23;
travelCosts["fifthToSecond"]=17;
travelCosts["fifthToThird"]=10;
travelCosts["fifthToFourth"]=5;
travelCosts["fifthToSixth"]=600;
travelCosts["fifthToSeventh"]=1150;
travelCosts["sixthToFirst"]=43;
travelCosts["sixthToSecond"]=37;
travelCosts["sixthToThird"]=30;
travelCosts["sixthToFourth"]=25;
travelCosts["sixthToFifth"]=20;
travelCosts["sixthToSeventh"]=500;
travelCosts["seventhToFirst"]=58;
travelCosts["seventhToSecond"]=52;
travelCosts["seventhToThird"]=45;
travelCosts["seventhToFourth"]=40;
travelCosts["seventhToFifth"]=35;
travelCosts["seventhToSixth"]=15;

// Read all input from standard input as a string
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input: remove a potential trailing newline and split into an array of lines
let inputLines = (rawInputContent.replace(/\n$/,"")).split("\n");

// Main processing loop for each set of travel queries
while (true) {
    // Extract the source location identifier and convert to a number
    let initialLocationID = inputLines.shift() - 0;

    // If the source ID is 0, it signals the end of input
    if (initialLocationID === 0) {
        break;
    }

    // Parse the first time string (e.g., departure time) into an array of numbers [hours, minutes]
    let firstTimeComponents = (inputLines.shift()).split(" ").map(Number);

    // Extract the target location identifier and convert to a number
    let finalLocationID = inputLines.shift() - 0;

    // Parse the second time string (e.g., arrival time) into an array of numbers [hours, minutes]
    let secondTimeComponents = (inputLines.shift()).split(" ").map(Number);

    // Calculate total minutes from midnight for the first time
    const totalFirstMinutes = (parseInt(firstTimeComponents[0], 10) * 60) + parseInt(firstTimeComponents[1], 10);

    // Calculate total minutes from midnight for the second time
    const totalSecondMinutes = (parseInt(secondTimeComponents[0], 10) * 60) + parseInt(secondTimeComponents[1], 10);

    let discountEligibilityCount = 0; // Counter for discount conditions met

    // Check the first discount condition based on time ranges
    if ((totalFirstMinutes <= 1050 && totalSecondMinutes <= 1170) || (totalFirstMinutes >= 1050 && totalSecondMinutes <= 1170)) {
        discountEligibilityCount++;
    }

    // Check the second discount condition based on the return trip cost/time
    // Note: the original code uses g+"to"+s, which translates to destination + "to" + source
    if (travelCosts[finalLocationID + "to" + initialLocationID] <= 40) {
        discountEligibilityCount++;
    }

    // Retrieve the base cost for the journey from source to destination
    let currentJourneyPrice = travelCosts[initialLocationID + "to" + finalLocationID];

    // Apply discount if both conditions are met
    if (discountEligibilityCount === 2) {
        currentJourneyPrice = Math.floor(currentJourneyPrice / 2); // Halve the price
        // Round up to the nearest multiple of 50
        while (currentJourneyPrice % 50 !== 0) {
            currentJourneyPrice++;
        }
    }

    // Output the calculated journey price
    console.log(currentJourneyPrice);
}