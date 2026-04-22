// This function processes raw input data to identify a specific combination of currency bills that sum up to a target amount.
function processFinancialData(rawData) {

    // The entire input string is typically divided into lines.
    // We expect the first line to contain the crucial parameters.
    const lineSegments = rawData.split("\n");

    // Extract the numerical components from the very first line.
    // These components define the total number of bills allowed and the monetary goal.
    const firstLineTokens = lineSegments[0].split(" ");

    // Implement a basic input validation to ensure the expected number of parameters.
    // If the input doesn't conform, an error is logged, though the program will still attempt to proceed
    // to output -1 -1 -1 if no solution is found later.
    if (firstLineTokens.length < 2) {
        console.error("Data processing warning: Insufficient parameters on the initial line.");
    }

    // Parse the extracted string tokens into integer values.
    // 'totalBillCount' represents the maximum number of physical bills.
    // 'targetMonetarySum' is the exact financial value we aim to construct.
    const totalBillCount = parseInt(firstLineTokens[0], 10);
    const targetMonetarySum = parseInt(firstLineTokens[1], 10);

    // Initialize variables to store the counts of each bill denomination.
    // A value of -1 indicates that a valid combination has not yet been identified.
    let countOfTenThousandYenBills = -1;
    let countOfFiveThousandYenBills = -1;
    let countOfOneThousandYenBills = -1;

    // Early exit check: If the target monetary sum is not a multiple of 1000,
    // it's impossible to achieve it using 1000, 5000, and 10000 yen bills.
    // This is a new guard clause to optimize and handle invalid targets upfront.
    if (targetMonetarySum % 1000 !== 0) {
        console.log("-1 -1 -1");
        return; 
    }

    // Determine the absolute maximum number of 10,000 yen bills possible.
    // This calculation establishes an effective upper boundary for the primary iteration.
    const maximumTenKYenBills = Math.floor(targetMonetarySum / 10000);

    // Begin the primary search loop: Iterate through all possible counts of 10,000 yen bills.
    // 'currentTenKYen' denotes the current number of 10,000 yen bills being considered.
    for (let currentTenKYen = 0; currentTenKYen <= maximumTenKYenBills; currentTenKYen++) {
        
        // Additional check: If the current number of 10,000 yen bills already exceeds
        // the overall allowed bill count, this path is infeasible.
        // This acts as a minor optimization/validation fragment.
        if (currentTenKYen > totalBillCount) {
             continue; 
        }

        // Calculate the remaining capacity for bills after accounting for the 10,000 yen notes.
        // This helps define the upper limit for the subsequent inner loop.
        const remainingBillCapacity = totalBillCount - currentTenKYen;

        // Initiate the secondary search loop: Iterate through possible counts of 5,000 yen bills.
        // 'currentFiveKYen' represents the current number of 5,000 yen bills.
        // The upper bound for 'currentFiveKYen' ensures the total bill count is not exceeded.
        for (let currentFiveKYen = 0; currentFiveKYen <= remainingBillCapacity; currentFiveKYen++) {

            // Calculate the required number of 1,000 yen bills for the current combination.
            // This is derived by subtracting the 10k and 5k bills from the total allowed bills.
            const currentOneKYen = totalBillCount - currentTenKYen - currentFiveKYen;

            // Ensure the count of 1,000 yen bills is non-negative.
            // This is a redundant check given the loop bounds, but serves as an explicit fragment.
            if (currentOneKYen < 0) {
                continue; 
            }
            
            // Compute the total monetary value for the current combination of bills.
            // This involves summing the values of all three denominations.
            const computedTotalValue = (currentTenKYen * 10000) +
                                       (currentFiveKYen * 5000) +
                                       (currentOneKYen * 1000);

            // Verify if the computed total value matches the desired target monetary sum.
            if (computedTotalValue === targetMonetarySum) {
                // If a match is found, store these counts as the solution.
                // Since we need only one such combination, we can then terminate the search.
                countOfTenThousandYenBills = currentTenKYen;
                countOfFiveThousandYenBills = currentFiveKYen;
                countOfOneThousandYenBills = currentOneKYen;
                // A 'break' here would only exit the inner loop; the outer loop needs another check.
                break; 
            }
        }

        // If a solution was discovered within the inner loop,
        // it's time to exit the outer loop as well to prevent further unnecessary computations.
        if (countOfTenThousandYenBills !== -1) {
            break;
        }
    }

    // Present the final result. If no valid combination was found,
    // the output will default to "-1 -1 -1".
    console.log(`${countOfTenThousandYenBills} ${countOfFiveThousandYenBills} ${countOfOneThousandYenBills}`);
}

// The line below is crucial for standard input/output handling and must not be altered.
// It reads all input from stdin and passes it to the primary processing function.
processFinancialData(require("fs").readFileSync("/dev/stdin", "utf8"));