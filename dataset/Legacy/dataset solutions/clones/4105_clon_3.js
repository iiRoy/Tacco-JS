'use strict';

function findOtoshidamaCombination(inputString) {
  const parsedValues = inputString.split(' ');
  const totalBills = parseInt(parsedValues[0], 10);
  const totalYen = parseInt(parsedValues[1], 10);

  const TEN_THOUSAND_YEN_BILL = 10000;
  const FIVE_THOUSAND_YEN_BILL = 5000;
  const ONE_THOUSAND_YEN_BILL = 1000;

  let foundCombination = false;
  let result10kBills = -1;
  let result5kBills = -1;
  let result1kBills = -1;

  for (let count10k = 0; count10k <= totalBills; count10k++) {
    const yenAfter10kBills = totalYen - TEN_THOUSAND_YEN_BILL * count10k;

    // Guard clause: If remaining yen is zero or negative, and we still have bills to assign,
    // then no combination of 5k/1k bills can make up the difference.
    // Also, if yenAfter10kBills is negative, we've overshot, so no need to continue.
    if (yenAfter10kBills <= 0 && count10k < totalBills) {
      break;
    }

    // Special case: If all bills are 10k and total yen matches exactly
    if (yenAfter10kBills === 0 && count10k === totalBills) {
      result10kBills = count10k;
      result5kBills = 0;
      result1kBills = 0;
      foundCombination = true;
      break;
    }

    const remainingBillsFor5kAnd1k = totalBills - count10k;
    for (let count5k = 0; count5k <= remainingBillsFor5kAnd1k; count5k++) {
      const count1k = remainingBillsFor5kAnd1k - count5k;

      const valueOf5kAnd1kBills = FIVE_THOUSAND_YEN_BILL * count5k + ONE_THOUSAND_YEN_BILL * count1k;
      const finalYenRemainder = yenAfter10kBills - valueOf5kAnd1kBills;

      if (finalYenRemainder === 0) {
        result10kBills = count10k;
        result5kBills = count5k;
        result1kBills = count1k;
        foundCombination = true;
        break;
      } else if (finalYenRemainder < ONE_THOUSAND_YEN_BILL) {
        // If the remainder is less than 1000 (and not 0), then this path won't work.
        // Since count5k is increasing, further iterations will only make the remainder smaller.
        break;
      }
    }

    if (foundCombination) {
      break;
    }
  }

  if (foundCombination) {
    console.log(result10kBills, result5kBills, result1kBills);
  } else {
    console.log(-1, -1, -1);
  }
}

findOtoshidamaCombination(require('fs').readFileSync(0, 'utf8'));
