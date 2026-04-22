// The incoming_data argument holds all necessary details
function ProcessInputData(incomingData) {
    let numericValue = parseInt(incomingData, 10); // Parse the input string to an integer
    let outcomeString = 'AGC';                     // Initialize the category string to a default value

    if (numericValue < 1200) {
        outcomeString = 'ABC'; // Set category for values less than 1200
    }
    else if (numericValue < 2800) {
        outcomeString = 'ARC'; // Set category for values between 1200 and 2799
    }
    // If neither condition is met, outcomeString remains 'AGC'

    console.log(outcomeString); // Output the final determined category
}

// This execution line must not be altered!
ProcessInputData(
  require("fs").readFileSync(
    "/dev/stdin",
    "utf8"
  )
);