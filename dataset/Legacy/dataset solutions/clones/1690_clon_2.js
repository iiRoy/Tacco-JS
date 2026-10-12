// This function processes raw input data to count various submission statuses.
function ProcessInput(rawData) {
    // Split the entire input string into an array of individual lines.
    const lineArray = rawData.split("\n");

    // The first line indicates the total number of test cases to process.
    const numCases = lineArray[0];

    // Initialize an object to store the tallies for each status type.
    // We pre-populate it with common status types and then set their initial counts to zero.
    let resultTallies = ["AC", "WA", "TLE", "RE"];
    resultTallies["AC"] = resultTallies["WA"] = resultTallies["TLE"] = resultTallies["RE"] = 0;

    // Iterate through each test case, starting from the second line (index 1).
    // The loop runs for 'numCases' times.
    for (let idx = 1; idx <= numCases; idx++) {
        // Get the current submission status from the input line.
        let currentStatus = lineArray[idx];

        // Increment the count for the identified status.
        // If the status hasn't been encountered before, initialize its count to 1.
        resultTallies[currentStatus] = (resultTallies[currentStatus]) ? resultTallies[currentStatus] + 1 : 1;
    }

    // Output the final counts for each status type to the console.
    console.log("AC x " + resultTallies['AC']);
    console.log("WA x " + resultTallies['WA']);
    console.log("TLE x " + resultTallies['TLE']);
    console.log("RE x " + resultTallies['RE']);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
