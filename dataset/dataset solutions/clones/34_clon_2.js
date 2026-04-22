const LOWER_BOUND_DIGIT = 0; // Smallest possible digit for combinations
const UPPER_BOUND_DIGIT = 9; // Largest possible digit for combinations

process.stdin.resume(); // Start the input stream
process.stdin.setEncoding('utf8'); // Set character encoding for incoming data

process.stdin.on("data", (received_data_block) => { // Event handler for data chunks
    // Convert the input buffer to a string, split by newlines, and parse each line into a number
    let target_sum_values = received_data_block.toString()
                               .split("\n")
                               .map(Number); // Convert string to number, handles empty strings as 0

    // Iterate through each target sum provided in the input
    for (let current_sum_index = 0;
         current_sum_index < target_sum_values.length;
         current_sum_index++) {

        let matching_combinations_count = 0; // Initialize counter for the current target

        // Four nested loops to generate all possible combinations of four digits (0-9)
        for (let first_digit = LOWER_BOUND_DIGIT;
             first_digit <= UPPER_BOUND_DIGIT;
             first_digit++) {

            for (let second_digit = LOWER_BOUND_DIGIT;
                 second_digit <= UPPER_BOUND_DIGIT;
                 second_digit++) {

                for (let third_digit = LOWER_BOUND_DIGIT;
                     third_digit <= UPPER_BOUND_DIGIT;
                     third_digit++) {

                    for (let fourth_digit = LOWER_BOUND_DIGIT;
                         fourth_digit <= UPPER_BOUND_DIGIT;
                         fourth_digit++) {

                        // Check if the sum of the four digits equals the current target value
                        if (first_digit + second_digit + third_digit + fourth_digit === target_sum_values[current_sum_index]) {
                            matching_combinations_count++; // Increment if the sum matches
                        }
                    } // End of fourth digit loop
                } // End of third digit loop
            } // End of second digit loop
        } // End of first digit loop

        // Output the total number of combinations found for the current target sum
        console.log(matching_combinations_count);
    } // End of target sum iteration
}); // End of data event handler