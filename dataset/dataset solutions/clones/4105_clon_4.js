'use strict';

function findBills(inputString) {
  const rawInput = inputString.split(' ');
  const billCount = Number(rawInput[0]);
  const totalAmount = Number(rawInput[1]);

  // The problem can be simplified using algebraic manipulation.
  // Let x be the number of 10000 yen bills, y for 5000 yen, z for 1000 yen.
  // We have two primary conditions:
  // 1) 10000x + 5000y + 1000z = totalAmount
  // 2) x + y + z = billCount
  // And x, y, z must all be non-negative integers.

  // From (2), we can express z as: z = billCount - x - y.
  // Substitute this into equation (1):
  // 10000x + 5000y + 1000 * (billCount - x - y) = totalAmount
  // Expand and simplify:
  // 10000x + 5000y + 1000 * billCount - 1000x - 1000y = totalAmount
  // Combine like terms:
  // 9000x + 4000y + 1000 * billCount = totalAmount

  // Since totalAmount is guaranteed to be a multiple of 1000, we can divide the entire equation by 1000:
  // 9x + 4y + billCount = totalAmount / 1000

  // Rearrange to isolate terms involving x and y on one side:
  // 9x + 4y = (totalAmount / 1000) - billCount

  // Let's define a target value for the right side of this simplified equation:
  const targetValue = (totalAmount / 1000) - billCount;

  // Now, we can iterate through possible values for x (number of 10000 yen bills).
  // x can range from 0 up to billCount.
  for (let numTenThousands = 0; numTenThousands <= billCount; numTenThousands++) {
    // For a given x, calculate the required value for 4y:
    const remainderForFiveThousands = targetValue - (9 * numTenThousands);

    // Check if remainderForFiveThousands is valid for y:
    // 1. It must be non-negative (since y >= 0).
    // 2. It must be perfectly divisible by 4 (since y must be an integer).
    if (remainderForFiveThousands >= 0 && remainderForFiveThousands % 4 === 0) {
      const numFiveThousands = remainderForFiveThousands / 4;

      // With x and y determined, calculate z (number of 1000 yen bills):
      const numOneThousands = billCount - numTenThousands - numFiveThousands;

      // Finally, check if z is also non-negative.
      // This implicitly ensures that x + y <= billCount.
      if (numOneThousands >= 0) {
        // If all conditions are met, we've found the unique solution.
        return console.log(numTenThousands, numFiveThousands, numOneThousands);
      }
    }
  }

  // If the loop completes without finding any valid combination, no solution exists.
  return console.log(-1, -1, -1);
}

findBills(require('fs').readFileSync(0, 'utf8'));
