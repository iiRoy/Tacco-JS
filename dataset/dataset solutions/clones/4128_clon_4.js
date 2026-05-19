'use strict';
console.log((function(raw_input_data) {
    const input_lines = raw_input_data.trim().split('\n');

    const query_count = parseInt(input_lines[0].split(' ')[0], 10);

    const query_ranges = input_lines.slice(1).map(line => line.split(' ').map(Number));

    const prime_limit = 50000;

    const is_prime_map = new Array(prime_limit + 1).fill(true);
    is_prime_map[0] = false;
    is_prime_map[1] = false;

    for (let current_num = 2; current_num * current_num <= prime_limit; current_num++) {
        if (is_prime_map[current_num]) {
            for (let multiple = current_num * current_num; multiple <= prime_limit; multiple += current_num) {
                is_prime_map[multiple] = false;
            }
        }
    }

    const cumulative_prime_counts = new Array(prime_limit + 1).fill(0);
    for (let idx = 1; idx <= prime_limit; idx++) {
        cumulative_prime_counts[idx] = cumulative_prime_counts[idx - 1] + (is_prime_map[idx] ? 1 : 0);
    }

    const collected_results = [];
    for (let q_idx = 0; q_idx < query_count; q_idx++) {
        const [left_val, right_val] = query_ranges[q_idx];

        const query_lower_bound_idx = Math.floor((left_val - 1) / 2);
        const query_upper_bound_idx = Math.floor((right_val - 1) / 2) + 1;

        collected_results.push(cumulative_prime_counts[query_upper_bound_idx] - cumulative_prime_counts[query_lower_bound_idx]);
    }

    return collected_results.join('\n');

})(require('fs').readFileSync('/dev/stdin', 'utf8')));
