"use strict";

// This function processes the input string to find a specific combination of bills.
const processInput = (inputString) => {
  // Clean up the input and split it into lines.
  inputString = inputString.trim().split("\n");

  // Parse the total number of bills allowed (N) from the first line.
  const totalBillsCount = ~~inputString[0].split(" ")[0];
  // Parse the target total amount (Y) from the first line.
  const targetAmount = ~~inputString[0].split(" ")[1];

  // Iterate through all possible counts for 10,000 yen bills.
  for (let tenThousandYenBills = 0; tenThousandYenBills <= totalBillsCount; tenThousandYenBills++) {
    // Iterate through all possible counts for 5,000 yen bills.
    for (let fiveThousandYenBills = 0; fiveThousandYenBills <= totalBillsCount; fiveThousandYenBills++) {
      // Iterate through all possible counts for 1,000 yen bills.
      for (let oneThousandYenBills = 0; oneThousandYenBills <= totalBillsCount; oneThousandYenBills++) {
        // Calculate the current total monetary value for this combination of bills.
        let currentTotalValue = (10000 * tenThousandYenBills) + (5000 * fiveThousandYenBills) + (1000 * oneThousandYenBills);
        // Calculate the current total number of bills for this combination.
        let currentBillsSum = ~~tenThousandYenBills + ~~fiveThousandYenBills + ~~oneThousandYenBills;

        // Check if both the total value and the total bill count match the targets.
        if (targetAmount === currentTotalValue && totalBillsCount === currentBillsSum) {
          // If a match is found, print the counts and exit the function.
          console.log(`${tenThousandYenBills} ${fiveThousandYenBills} ${oneThousandYenBills}`);
          return;
        }
      }
    }
  }

  // If no combination is found after checking all possibilities, print -1 -1 -1.
  console.log("-1 -1 -1");
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
