var input = require("fs").readFileSync("/dev/stdin", "utf8");

var S = input;
var weeks = [
    'SUN',
    'MON',
    'TUE',
    'WED',
    'THU',
    'FRI',
    'SAT',
];

var result = weeks.reverse().indexOf(S) + 1;
console.log(result);
