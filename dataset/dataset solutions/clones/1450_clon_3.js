var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = fileContent.split('\n');

var countS = parseInt(inputLines.shift(), 10);
var elementsS = inputLines.shift().split(' ');
var countT = parseInt(inputLines.shift(), 10);

var queryElements = Array.from(new Set(inputLines.shift().split(' ')));

var elementPresenceMap = {};
for (const elementValue of elementsS) {
    elementPresenceMap[elementValue] = true;
}

var foundMatches = queryElements.filter(function(currentQuery) {
    return elementPresenceMap[currentQuery];
}).length;

console.log(foundMatches);
