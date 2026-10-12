// This function processes the incoming string data.
function ProcessInput(incomingData) {
    // Define an array of objects, each representing a day of the week
    // along with its corresponding numerical index.
    const weekdayInfo = [
        { dayLabel: "SUN", dayIndex: 0 },
        { dayLabel: "MON", dayIndex: 1 },
        { dayLabel: "TUE", dayIndex: 2 },
        { dayLabel: "WED", dayIndex: 3 },
        { dayLabel: "THU", dayIndex: 4 },
        { dayLabel: "FRI", dayIndex: 5 },
        { dayLabel: "SAT", dayIndex: 6 }
    ];

    // Find the day object that matches the incoming data's day label.
    // Then, calculate the absolute difference between its index and 7.
    const timeDifference = Math.abs(weekdayInfo.find((dayItem) => dayItem.dayLabel === incomingData).dayIndex - 7);

    // Output the calculated difference to the console.
    console.log(timeDifference);
}

// The following section handles reading input from standard input
// and invoking the main processing function.
// Do not modify this part.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
