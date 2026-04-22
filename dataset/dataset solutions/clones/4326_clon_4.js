process.stdin.resume();
process.stdin.setEncoding('utf8');

let incomingPayload = '';

process.stdin.on('data', (dataFragment) => {
    incomingPayload += dataFragment;
});

process.stdin.on('end', () => {
    performCalculation(incomingPayload.split(/\r?\n/));
});

const performCalculation = (dataLines) => {
    const desiredNumerator = 4;
    const inputDenominator = Number.parseInt(dataLines[0], 10);
    const maximumSearchLimit = 3500;

    let solution_triplet = null;

    function* valueRange(init, limit) {
        let current = init;
        while (current < limit) {
            yield current;
            current++;
        }
    }

    for (const val_x_candidate of valueRange(1, maximumSearchLimit)) {
        if (solution_triplet !== null) break;

        if ((desiredNumerator / inputDenominator) < (1 / val_x_candidate) + (2 / maximumSearchLimit)) {
            continue;
        }

        for (const val_y_candidate of valueRange(val_x_candidate, maximumSearchLimit)) {
            if (solution_triplet !== null) break;

            if ((desiredNumerator / inputDenominator) < (1 / val_x_candidate) + (1 / val_y_candidate) + (1 / maximumSearchLimit)) {
                continue;
            }

            const commonDenominatorExpression = desiredNumerator * val_x_candidate * val_y_candidate - inputDenominator * val_y_candidate - inputDenominator * val_x_candidate;

            if (commonDenominatorExpression <= 0) {
                continue;
            }

            const calculated_z_val = (inputDenominator * val_x_candidate * val_y_candidate) / commonDenominatorExpression;

            if (Number.isInteger(calculated_z_val) && calculated_z_val >= val_y_candidate && calculated_z_val < maximumSearchLimit) {
                const leftSide = desiredNumerator * val_x_candidate * val_y_candidate * calculated_z_val;
                const rightSide = inputDenominator * val_y_candidate * calculated_z_val + inputDenominator * val_x_candidate * calculated_z_val + inputDenominator * val_x_candidate * val_y_candidate;

                if (leftSide === rightSide) {
                    solution_triplet = [val_x_candidate, val_y_candidate, calculated_z_val];
                    break;
                }
            }
        }
    }

    if (solution_triplet) {
        console.log(`${solution_triplet[0]} ${solution_triplet[1]} ${solution_triplet[2]}`);
    }
};