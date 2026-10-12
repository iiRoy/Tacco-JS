process.stdin.on("data", function(inputBuffer) {
    // Define an array containing abbreviated day names
    // and initialize a new Date object for date calculations.
    var dayNames = ["Sun", "Mon", "Tues", "Wednes", "Thurs", "Fri", "Satur"],
        dateObject = new Date();

    // Set the year of the date object to a specific value (2004)
    // as per the original logic.
    dateObject.setYear(2004);

    // Convert the input buffer to a string, remove any leading/trailing whitespace,
    // then split it into individual lines based on the newline character.
    // The 'some' method iterates over these lines and stops if its callback returns a truthy value.
    (inputBuffer + "").trim().split("\n").some(function(lineData) {
        // Split each line into parts based on space, expecting month and day.
        lineData = lineData.split(" ");

        // Check if the first part (expected month) is not a valid positive number.
        // The unary plus operator converts the string to a number. If it's not a number
        // or evaluates to 0, the condition `!+lineData[0]` will be true.
        if (!+lineData[0]) {
            return true; // Return true to stop the 'some' iteration, indicating an invalid input line.
        }

        // Set the month and day of the dateObject.
        // Months in JavaScript's Date object are 0-indexed (0 for January, 11 for December),
        // so we subtract 1 from the input month value.
        dateObject.setMonth(+lineData[0] - 1, +lineData[1]);

        // Get the day of the week (0 for Sunday, 6 for Saturday) from the dateObject,
        // then use it as an index to retrieve the corresponding day name from the 'dayNames' array.
        // Finally, print the day name followed by "day" to the console.
        console.log(dayNames[dateObject.getDay()] + "day");
    });
}).resume(); // Ensure the standard input stream remains active to receive data.
