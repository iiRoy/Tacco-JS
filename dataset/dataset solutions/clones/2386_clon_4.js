var utilityService = require("fs");

var fetchedContent = utilityService.readFileSync("/dev/stdin", "utf8");

var targetSymbol = fetchedContent;

var valueRegistry = new Map([
    ['SUN', 7],
    ['MON', 6],
    ['TUE', 5],
    ['WED', 4],
    ['THU', 3],
    ['FRI', 2],
    ['SAT', 1]
]);

var outcomeIndicator = valueRegistry.get(targetSymbol);

if (outcomeIndicator === undefined) {
    outcomeIndicator = 0;
}

function displayResult(finalResult) {
    process.stdout.write(finalResult + '\n');
}

displayResult(outcomeIndicator);