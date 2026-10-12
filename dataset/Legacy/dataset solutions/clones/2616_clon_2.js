function ProcessInput(inputString) {
    // This function parses an input string containing two numbers
    // representing a month limit and a day limit, then calculates
    // a specific count based on a digit-product condition.

    // Extract the first number from the input string, converting it to an integer.
    // This will be used as the upper bound for months.
    let monthLimit = inputString.trim().split(" ")[0] - 0;

    // Extract the second number from the input string, converting it to an integer.
    // This will be used as the upper bound for days.
    let dayLimit = inputString.trim().split(" ")[1] - 0;
    
    // Initialize a counter for the number of times the condition is met.
    let resultCount = 0;

    // Check if the day limit is too low for the inner loop to ever execute.
    // If it is, print 0 as per the original logic.
    if (dayLimit < 22) {
        console.log(0);
    }

    // Iterate through possible month values, starting from 4.
    for (let currentMonth = 4; currentMonth <= monthLimit; currentMonth++) {
        // Iterate through possible day values, starting from 22.
        for (let currentDay = 22; currentDay <= dayLimit; currentDay++) {
            // Convert the current day number to a string to extract its digits.
            let dayString = currentDay.toString();
            
            // Get the units digit of the day.
            // Note: JavaScript performs implicit type coercion for multiplication later.
            let dayDigitOne = dayString.split("")[1];
            
            // Get the tens digit of the day.
            let dayDigitTen = dayString.split("")[0];
            
            // Check if the current month is equal to the product of the day's digits.
            if (currentMonth === dayDigitOne * dayDigitTen) {
                // If the condition is met, increment the counter.
                resultCount++;
            }
        }
    }
    
    // Output the final calculated count.
    console.log(resultCount);
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to the ProcessInput function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
