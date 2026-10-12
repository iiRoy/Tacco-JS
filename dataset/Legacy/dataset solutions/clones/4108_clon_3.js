"use strict";

const processInputAndSolve = (inputString) => {
    const TEN_THOUSAND_YEN_DENOMINATION = 10000;
    const FIVE_THOUSAND_YEN_DENOMINATION = 5000;
    const ONE_THOUSAND_YEN_DENOMINATION = 1000;

    const trimmedInput = inputString.trim();
    const inputLines = trimmedInput.split("\n");
    const firstLineValues = inputLines[0].split(" ");

    const totalBillCount = parseInt(firstLineValues[0], 10);
    const targetYenAmount = parseInt(firstLineValues[1], 10);

    for (let num10kYen = 0; num10kYen <= totalBillCount; num10kYen++) {
        // Optimization: If the value of 10k yen bills alone exceeds the target amount,
        // or if the number of 10k yen bills already exceeds the total allowed bills,
        // then further iterations with more 10k yen bills are fruitless.
        if (num10kYen * TEN_THOUSAND_YEN_DENOMINATION > targetYenAmount) {
            continue;
        }

        for (let num5kYen = 0; num5kYen <= totalBillCount; num5kYen++) {
            const currentBillsOfHigherDenominations = num10kYen + num5kYen;

            // Optimization: If the combined count of 10k and 5k yen bills already
            // exceeds the total allowed bills, skip to the next 10k yen iteration.
            if (currentBillsOfHigherDenominations > totalBillCount) {
                continue;
            }

            const valueOfHigherDenominations = (num10kYen * TEN_THOUSAND_YEN_DENOMINATION) +
                                               (num5kYen * FIVE_THOUSAND_YEN_DENOMINATION);

            // Optimization: If the combined value of 10k and 5k yen bills already
            // exceeds the target amount, skip to the next 5k yen iteration.
            if (valueOfHigherDenominations > targetYenAmount) {
                continue;
            }

            for (let num1kYen = 0; num1kYen <= totalBillCount; num1kYen++) {
                const currentTotalBills = currentBillsOfHigherDenominations + num1kYen;

                // Optimization: If the total count of all three bill types already
                // exceeds the total allowed bills, skip to the next 1k yen iteration.
                if (currentTotalBills > totalBillCount) {
                    continue;
                }

                const calculatedTotalYen = valueOfHigherDenominations +
                                           (num1kYen * ONE_THOUSAND_YEN_DENOMINATION);
                
                // Optimization: If the calculated total value already exceeds the target amount,
                // skip to the next 1k yen iteration.
                if (calculatedTotalYen > targetYenAmount) {
                    continue;
                }

                if (targetYenAmount === calculatedTotalYen && totalBillCount === currentTotalBills) {
                    console.log(`${num10kYen} ${num5kYen} ${num1kYen}`);
                    return;
                }
            }
        }
    }

    console.log("-1 -1 -1");
};

processInputAndSolve(require('fs').readFileSync('/dev/stdin', 'utf8'));
