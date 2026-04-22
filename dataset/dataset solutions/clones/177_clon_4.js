const MAX_PRIME_CANDIDATE_VALUE = 50024;
let is_prime_flag = new Array(MAX_PRIME_CANDIDATE_VALUE + 1).fill(true);
is_prime_flag[0] = false;
is_prime_flag[1] = false;

for (let current_factor = 2; current_factor * current_factor <= MAX_PRIME_CANDIDATE_VALUE; current_factor++) {
    if (is_prime_flag[current_factor]) {
        for (let multiple = current_factor * current_factor; multiple <= MAX_PRIME_CANDIDATE_VALUE; multiple += current_factor) {
            is_prime_flag[multiple] = false;
        }
    }
}

let prime_numbers_list = [];
for (let num_val = 2; num_val <= MAX_PRIME_CANDIDATE_VALUE; num_val++) {
    if (is_prime_flag[num_val]) {
        prime_numbers_list.push(num_val);
    }
}

const io_handler = require('readline');

const input_reader = io_handler.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

function find_upper_bound_index(arr_data, target_val) {
    let low_idx = 0;
    let high_idx = arr_data.length;

    while (low_idx < high_idx) {
        let mid_idx = Math.floor((low_idx + high_idx) / 2);
        if (arr_data[mid_idx] <= target_val) {
            low_idx = mid_idx + 1;
        } else {
            high_idx = mid_idx;
        }
    }
    return low_idx;
}

input_reader.on('line', (line_content) => {
    let current_input_value = parseInt(line_content.trim(), 10);

    let next_prime_idx = find_upper_bound_index(prime_numbers_list, current_input_value);

    let following_prime = prime_numbers_list[next_prime_idx];
    let preceding_prime = prime_numbers_list[next_prime_idx - 1];
    let two_before_following_prime = prime_numbers_list[next_prime_idx - 2];

    let first_output_val = (preceding_prime === current_input_value) ? two_before_following_prime : preceding_prime;

    console.log(first_output_val, following_prime);
});