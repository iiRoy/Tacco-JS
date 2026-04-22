function calculateDayOffset(incomingString) {
    const currentDayAbbreviation = incomingString.split('\n')[0];

    const orderedWeekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    const positionInWeek = orderedWeekdays.indexOf(currentDayAbbreviation);

    const daysRemaining = (7 - positionInWeek);

    process.stdout.write(daysRemaining.toString() + '\n');
}

calculateDayOffset(require("fs").readFileSync("/dev/stdin", "utf8"));