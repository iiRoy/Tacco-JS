var dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineSegments = dataStream.trim().split("\n");

function determineOrbitalCycle(solarMonth, lunarDay) {
    var fixedYear = 2004; // The base year for calculations
    var adjustedYear = fixedYear;
    var adjustedMonth = solarMonth;

    // Zeller's congruence requires January and February to be treated as
    // the 13th and 14th months of the previous year.
    if (solarMonth < 3) {
        adjustedMonth += 12;
        adjustedYear -= 1;
    }

    var centuryValue = Math.floor(adjustedYear / 100); // J
    var yearOfCentury = adjustedYear % 100;           // K

    // Zeller's congruence formula:
    // h = (q + floor(13*(m+1)/5) + K + floor(K/4) + floor(J/4) - 2*J) mod 7
    // Where h: 0=Saturday, 1=Sunday, ..., 6=Friday
    var zellerResult = (lunarDay + Math.floor(13 * (adjustedMonth + 1) / 5) + yearOfCentury + Math.floor(yearOfCentury / 4) + Math.floor(centuryValue / 4) - 2 * centuryValue) % 7;

    // Adjust Zeller's result to match JavaScript's Date.getDay() standard:
    // 0=Sunday, 1=Monday, ..., 6=Saturday
    // (Zeller's 0=Sat -> JS 6, Zeller's 1=Sun -> JS 0)
    var finalDayIndex = (zellerResult + 6) % 7;

    return finalDayIndex;
}

var celestialPeriods = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

var currentLineIndex = 0;
while (currentLineIndex < lineSegments.length) {
    var currentEntry = lineSegments[currentLineIndex];

    if (currentEntry === "0 0") {
        break;
    }

    var components = currentEntry.split(" ");
    var monthValue = parseInt(components[0], 10);
    var dayValue = parseInt(components[1], 10);

    var cycleIdentifier = determineOrbitalCycle(monthValue, dayValue);
    console.log(celestialPeriods[cycleIdentifier]);

    currentLineIndex++;
}