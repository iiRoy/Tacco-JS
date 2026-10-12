// inputに入力データ全体が入る
function solveProblem(rawInputData) {
    // Split the raw input string into an array of lines
    const inputLines = rawInputData.split("\n");
    // Take the first line, split it by space, and convert parts to numbers
    const firstLineTokens = inputLines[0].split(" ").map(Number);

    // Define constants for the denominations of bills
    const TEN_THOUSAND_YEN = 10000;
    const FIVE_THOUSAND_YEN = 5000;
    const ONE_THOUSAND_YEN = 1000;

    // Extract the total number of bills (N) and the target total amount (Y)
    const totalBillsCount = firstLineTokens[0];
    const targetAmount = firstLineTokens[1];

    // Initialize variables to store the counts of each bill type if a solution is found.
    // -1 indicates no solution found yet.
    let found10kBills = -1;
    let found5kBills = -1;
    let found1kBills = -1;

    // A boolean flag to efficiently break out of nested loops once a solution is identified.
    let solutionFound = false;

    // Determine the maximum possible number of 10,000 yen bills.
    // This helps to optimize the outer loop by setting an upper bound.
    const maxPossible10kBills = Math.floor(targetAmount / TEN_THOUSAND_YEN);

    // Iterate through all possible counts for 10,000 yen bills, starting from zero.
    for (let current10kCount = 0; current10kCount <= maxPossible10kBills; current10kCount++) {
        // Iterate through all possible counts for 5,000 yen bills.
        // The upper bound is `totalBillsCount - current10kCount` because the total number of bills
        // (10k + 5k + 1k) cannot exceed `totalBillsCount`.
        for (let current5kCount = 0; current5kCount <= totalBillsCount - current10kCount; current5kCount++) {
            // Calculate the remaining number of 1,000 yen bills needed to reach `totalBillsCount`.
            const current1kCount = totalBillsCount - current10kCount - current5kCount;

            // Ensure that the calculated number of 1,000 yen bills is non-negative.
            // (This check is technically redundant due to the inner loop's upper bound,
            // but it adds clarity and robustness to the logic.)
            if (current1kCount >= 0) {
                // Calculate the total monetary value for the current combination of bills.
                const calculatedSum = (current10kCount * TEN_THOUSAND_YEN) +
                                      (current5kCount * FIVE_THOUSAND_YEN) +
                                      (current1kCount * ONE_THOUSAND_YEN);

                // Check if the calculated sum matches the target amount.
                if (calculatedSum === targetAmount) {
                    // If a solution is found, store the counts and set the flag.
                    found10kBills = current10kCount;
                    found5kBills = current5kCount;
                    found1kBills = current1kCount;
                    solutionFound = true;
                    break; // Exit the inner loop immediately as a valid solution has been found.
                }
            }
        }
        // If the solutionFound flag was set in the inner loop, exit the outer loop as well.
        if (solutionFound) {
            break;
        }
    }

    // Output the final counts of the bills, separated by spaces.
    // If no solution was found, the output will be "-1 -1 -1".
    console.log(`${found10kBills} ${found5kBills} ${found1kBills}`);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
