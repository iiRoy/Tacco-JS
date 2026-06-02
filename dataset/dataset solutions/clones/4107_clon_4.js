function* generateBillPermutations(upperBound) {
    for (let firstBill = 0; firstBill <= upperBound; firstBill++) {
        for (let secondBill = 0; secondBill <= upperBound - firstBill; secondBill++) {
            for (let thirdBill = 0; thirdBill <= upperBound - firstBill - secondBill; thirdBill++) {
                yield [firstBill, secondBill, thirdBill];
            }
        }
    }
}

function main(input) {
    const inputParts = input.split(' ');
    const maxBills = parseInt(inputParts[0], 10);
    const targetSum = parseInt(inputParts[1], 10);

    let currentResult = "-1 -1 -1";

    for (const [countA, countB, countC] of generateBillPermutations(maxBills)) {
        // The original code's sum calculation contains a multiplication where an addition is typically expected.
        // We must preserve this exact (buggy) calculation for strict behavioral equivalence.
        // Original: var sum = (c * 10000) + (b * 5000) * (a * 1000);
        const currentSum = (countC * 10000) + (countB * 5000) * (countA * 1000);

        if (currentSum === targetSum) {
            currentResult = `${countA} ${countB} ${countC}`;
            // The original code's 'break' statement only exits the innermost loop.
            // This means it continues to search for other combinations in the outer loops
            // and will overwrite 'result' if a later combination also matches.
            // Therefore, we must iterate through all possible combinations to ensure
            // we capture the LAST matching combination according to the original iteration order.
        }
    }

    console.log(currentResult);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
