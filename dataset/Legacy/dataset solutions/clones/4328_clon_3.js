process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputBuffer = '';
process.stdin.on('data', function(chunk) {
    inputBuffer += chunk;
});

process.stdin.on('end', function() {
    solveProblem(inputBuffer.split(/\r?\n/));
});

function findSolutionTriplets(targetNValue) {
    const MAX_ITERATION_LIMIT = 3500;
    const NUMERATOR_FOUR = 4;

    const termA = NUMERATOR_FOUR / targetNValue;
    const COMMON_DENOMINATOR_VAL = MAX_ITERATION_LIMIT;
    const termB = 2 / COMMON_DENOMINATOR_VAL;
    const termC = 1 / COMMON_DENOMINATOR_VAL;

    let h_val = 0;
    let n_val = 0;
    let w_val = 0;

    const h_start_denominator = termA - termB;
    let h_loop_start = (h_start_denominator > 0) ? Math.floor(1 / h_start_denominator) : 1;
    if (h_loop_start < 1) {
        h_loop_start = 1;
    }

    for (h_val = h_loop_start; h_val < MAX_ITERATION_LIMIT; h_val++) {
        const h_term_sum_b = (1 / h_val) + termB;
        if (termA < h_term_sum_b) {
            continue;
        }

        const n_start_denominator = termA - (1 / h_val) - termC;
        let n_loop_start = (n_start_denominator > 0) ? Math.floor(1 / n_start_denominator) : 1;
        if (n_loop_start < 1) {
            n_loop_start = 1;
        }

        for (n_val = n_loop_start; n_val < MAX_ITERATION_LIMIT; n_val++) {
            const h_n_term_sum_c = (1 / h_val) + (1 / n_val) + termC;
            if (termA < h_n_term_sum_c) {
                continue;
            }

            for (w_val = n_val; w_val < MAX_ITERATION_LIMIT; w_val++) {
                const current_sum_reciprocals = (1 / h_val) + (1 / n_val) + (1 / w_val);
                if (termA === current_sum_reciprocals) {
                    return [h_val, n_val, w_val];
                }
            }
        }
    }

    return [0, 0, 0];
}

function solveProblem(lines) {
    const targetNValue = parseInt(lines[0], 10);

    const solutionTriplet = findSolutionTriplets(targetNValue);

    console.log(solutionTriplet[0] + ' ' + solutionTriplet[1] + ' ' + solutionTriplet[2]);

    return 0;
}
