var sourceData = require("fs").readFileSync("/dev/stdin", "utf8");

var dayIdentifier = sourceData;

var dayCountdownValues = {
    'SAT': 1,
    'FRI': 2,
    'THU': 3,
    'WED': 4,
    'TUE': 5,
    'MON': 6,
    'SUN': 7
};

var daysUntilSunday = dayCountdownValues[dayIdentifier];

if (daysUntilSunday === undefined) {
    daysUntilSunday = 0;
}

console.log(daysUntilSunday);
