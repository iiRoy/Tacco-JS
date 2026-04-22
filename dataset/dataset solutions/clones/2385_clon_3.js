// This program module is designed to compute the remaining number of days
// until the subsequent Sunday, based on a provided string indicating the current day.
// It supports standard three-letter English abbreviations for weekdays.

function ProcessDailySchedule(rawInputData) {
    // Extract the primary day indicator from the raw input.
    // The .trim() method is employed to remove any extraneous whitespace,
    // including newline characters, ensuring a clean and accurate match.
    const presentDayAbbreviation = rawInputData.trim();

    // Establish a canonical list of weekday abbreviations, ordered sequentially.
    // Sunday is assigned the initial position (index 0) for consistent calculations.
    const weeklyRotation = [
        "SUN", // Position 0: Sunday
        "MON", // Position 1: Monday
        "TUE", // Position 2: Tuesday
        "WED", // Position 3: Wednesday
        "THU", // Position 4: Thursday
        "FRI", // Position 5: Friday
        "SAT"  // Position 6: Saturday
    ];

    // Determine the numerical index corresponding to the current day's abbreviation.
    // If the abbreviation is not found within the 'weeklyRotation' array,
    // 'indexOf' will return -1, signifying an unrecognized input.
    const currentDayNumericalPosition = weeklyRotation.indexOf(presentDayAbbreviation);

    // Implement a preliminary validation step to handle malformed or invalid inputs.
    // If the day abbreviation is not recognized, an informative error message
    // is issued to the console, and the function terminates prematurely.
    if (currentDayNumericalPosition === -1) {
        console.error("Error: The provided day abbreviation is not valid. Please use one of SUN, MON, TUE, WED, THU, FRI, SAT.");
        return; // Halt execution for invalid input to prevent erroneous output.
    }

    // Calculate the precise number of days remaining until the next occurrence of Sunday.
    // The logic is based on the difference between the total days in a week (7)
    // and the numerical position of the current day. If today is Sunday (position 0),
    // the next Sunday is exactly 7 days away. For all other days, it's 7 minus their position.
    const daysUntilUpcomingWeekend = 7 - currentDayNumericalPosition;

    // Display the final computed result to the standard output stream.
    // This value represents the answer to the problem's core question.
    console.log(daysUntilUpcomingWeekend);
}

// This boilerplate section ensures the program can execute in a Node.js environment
// by reading input from standard in and passing it to the main processing function.
// It is typically left untouched in competitive programming contexts.
ProcessDailySchedule(require("fs").readFileSync("/dev/stdin", "utf8"));