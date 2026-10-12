const MAX_PRIME_BOUND = 50024;
const composite_flags = new Uint8Array(MAX_PRIME_BOUND);
const prime_sequence = [];

composite_flags[0] = 1;
composite_flags[1] = 1;

for (let current_factor = 2; current_factor * current_factor < MAX_PRIME_BOUND; ++current_factor) {
    if (composite_flags[current_factor] === 0) {
        for (let multiple_index = current_factor * current_factor; multiple_index < MAX_PRIME_BOUND; multiple_index += current_factor) {
            composite_flags[multiple_index] = 1;
        }
    }
}

for (let number_candidate = 2; number_candidate < MAX_PRIME_BOUND; ++number_candidate) {
    if (composite_flags[number_candidate] === 0) {
        prime_sequence.push(number_candidate);
    }
}

const sequence_length = prime_sequence.length;

process.stdin.on("data", function(input_buffer) {
    String(input_buffer).trim().split("\n").some(function(line_content) {
        const query_value = Number(line_content);

        let lower_bound = 0;
        let upper_bound = sequence_length - 1;
        let insertion_point = -1;

        while (lower_bound <= upper_bound) {
            const mid_point = Math.floor((lower_bound + upper_bound) / 2);
            if (prime_sequence[mid_point] > query_value) {
                insertion_point = mid_point;
                upper_bound = mid_point - 1;
            } else {
                lower_bound = mid_point + 1;
            }
        }

        const next_prime_in_sequence = prime_sequence[insertion_point];
        const candidate_previous_prime = prime_sequence[insertion_point - 1];

        let result_previous_prime;
        if (candidate_previous_prime === query_value) {
            result_previous_prime = prime_sequence[insertion_point - 2];
        } else {
            result_previous_prime = candidate_previous_prime;
        }

        console.log(result_previous_prime, next_prime_in_sequence);
    });
}).resume();
