function processDayOffset(targetDayName) {
    const WEEK_LENGTH = 7;

    const dayMappingData = [
        { dayLabel: "SUN", numericIndex: 0 },
        { dayLabel: "MON", numericIndex: 1 },
        { dayLabel: "TUE", numericIndex: 2 },
        { dayLabel: "WED", numericIndex: 3 },
        { dayLabel: "THU", numericIndex: 4 },
        { dayLabel: "FRI", numericIndex: 5 },
        { dayLabel: "SAT", numericIndex: 6 }
    ];

    const foundDayEntry = dayMappingData.find((dayEntry) => dayEntry.dayLabel === targetDayName);

    const dayNumericIndex = foundDayEntry.numericIndex;

    const offsetValue = WEEK_LENGTH - dayNumericIndex;

    console.log(offsetValue);
}
processDayOffset(require("fs").readFileSync("/dev/stdin", "utf8"));
