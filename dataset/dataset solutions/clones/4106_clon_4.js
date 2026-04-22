function processTransaction(rawData) {
  let parsedData = rawData.split('\n')[0].split(' ');

  let totalBills = Number(parsedData[0]);
  let totalAmount = Number(parsedData[1]);

  let countTenK = -1;
  let countFiveK = -1;
  let countOneK = -1;

  const amountInThousands = totalAmount / 1000;
  const targetForEquation = amountInThousands - totalBills;

  // Iterate for the number of 10,000-yen bills (let's call it 'x')
  // We know x must be between 0 and totalBills, and 10000x <= totalAmount
  for (let currentTenK = 0; currentTenK <= totalBills; ++currentTenK) {
    // If we have 'x' 10k bills, and 'y' 5k bills, and 'z' 1k bills:
    // x + y + z = totalBills
    // 10x + 5y + z = amountInThousands (dividing total amount by 1000)
    // Substitute z = totalBills - x - y into the second equation:
    // 10x + 5y + (totalBills - x - y) = amountInThousands
    // 9x + 4y + totalBills = amountInThousands
    // 4y = amountInThousands - totalBills - 9x
    // 4y = targetForEquation - 9x

    const requiredFourTimesFiveK = targetForEquation - 9 * currentTenK;

    // Check if requiredFourTimesFiveK is non-negative and divisible by 4
    if (requiredFourTimesFiveK >= 0 && requiredFourTimesFiveK % 4 === 0) {
      const currentFiveK = requiredFourTimesFiveK / 4;

      // Check if the number of 5,000-yen bills (y) is non-negative
      // And if the total number of 10k and 5k bills does not exceed totalBills
      // (which implies the number of 1k bills (z) is also non-negative)
      if (currentFiveK >= 0 && currentTenK + currentFiveK <= totalBills) {
        countTenK = currentTenK;
        countFiveK = currentFiveK;
        countOneK = totalBills - currentTenK - currentFiveK;
        break; // Found a solution, exit loop
      }
    }
  }

  console.log(countTenK + " " + countFiveK + " " + countOneK);
}

processTransaction(require("fs").readFileSync("/dev/stdin", "utf8"));