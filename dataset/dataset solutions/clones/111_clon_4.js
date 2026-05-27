const fileSystemModule = require("fs");

const dayNameRegistry = new Map([
    [0, "Sunday"],
    [1, "Monday"],
    [2, "Tuesday"],
    [3, "Wednesday"],
    [4, "Thursday"],
    [5, "Friday"],
    [6, "Saturday"]
]);

fileSystemModule.readFileSync("/dev/stdin", "utf8")
    .split('\n')
    .forEach(function(inputLineSegment) {
        const [monthIdentifier, dayIdentifier] = inputLineSegment.split(' ');

        if (Number(monthIdentifier) !== 0) {
            const calculatedDate = new Date(2004, Number(monthIdentifier) - 1, Number(dayIdentifier));
            const weekDayIndex = calculatedDate.getDay();
            console.log(dayNameRegistry.get(weekDayIndex));
        }
    });
