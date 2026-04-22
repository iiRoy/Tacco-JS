function ProcessInputData(raw_data_string) {
    // Transform input string into an array of numeric values
    const parsed_numbers = raw_data_string.split("\n").slice(0, 5).map(Number);

    // Calculate the sum of each number rounded up to the nearest multiple of 10
    // Using a functional approach with Array.prototype.reduce
    const total_up_duration = parsed_numbers.reduce((accumulated_duration, current_task_value) => {
        // Equivalent to Math.ceil(x / 10) * 10
        const rounded_up_task = Math.floor((current_task_value + 9) / 10) * 10;
        return accumulated_duration + rounded_up_task;
    }, 0);

    // Determine the 'effective' smallest non-zero last digit, replicating original's logic/bug
    // The original code initializes with the first element's remainder and only updates if a smaller non-zero remainder is found
    // AND the current 'minimum' is greater than it. If the initial 'minimum' is 0, it will stay 0.
    const initial_comparison_remainder = parsed_numbers[0] % 10;

    const effective_final_remainder = parsed_numbers.reduce((current_min_digit, current_number_item) => {
        const digit_value = current_number_item % 10;

        // Mimic 'if (m === 0) { continue; }' by returning the current accumulator
        if (digit_value === 0) {
            return current_min_digit;
        }

        // Mimic 'if (mm > m) { var mm = m; }'
        if (current_min_digit > digit_value) {
            return digit_value;
        }

        // If no update, maintain the current accumulator value
        return current_min_digit;
    }, initial_comparison_remainder);

    // Calculate the final outcome
    const calculated_result = total_up_duration - (10 - effective_final_remainder);

    console.log(calculated_result);
}

// This line reads from standard input and invokes the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));