const standard_input_stream = require('node:fs');

const process_source_data = () => {
    const raw_text_data = standard_input_stream.readFileSync(0, 'utf8');
    const text_lines_array = raw_text_data.trim().split('\n');

    const calculate_maximal_overlap = (main_sequence_chars, pattern_sequence_chars) => {
        // This inner function recursively finds the longest contiguous match
        // between the current 'segment_one_portion' and 'segment_two_portion'
        // It's equivalent to the inner 'for' loop in the original code,
        // which tracks 'max' and updates 'ans' on mismatch.
        const locate_longest_segment_match = (segment_one_portion, segment_two_portion) => {
            const discover_match_recursively = (pos_a, pos_b, current_streak, best_streak) => {
                // Base case: If we've reached the end of either segment,
                // return the maximum streak found so far.
                if (pos_a >= segment_one_portion.length || pos_b >= segment_two_portion.length) {
                    return Math.max(best_streak, current_streak);
                }

                // Recursive step: Compare characters at current positions
                if (segment_one_portion[pos_a] === segment_two_portion[pos_b]) {
                    // Characters match: extend the current streak and continue recursion
                    return discover_match_recursively(pos_a + 1, pos_b + 1, current_streak + 1, best_streak);
                } else {
                    // Characters mismatch: current streak ends.
                    // Update the overall best streak and reset the current streak to 0, then continue.
                    return discover_match_recursively(pos_a + 1, pos_b + 1, 0, Math.max(best_streak, current_streak));
                }
            };
            // Initiate the recursive search from the beginning of both segments
            return discover_match_recursively(0, 0, 0, 0);
        };

        // Generate an array of all possible suffixes for 'main_sequence_chars'.
        // This conceptually replaces the outer 'for i' loop in the original code,
        // which iterated through all possible starting positions in 'a'.
        const sequence_suffixes = Array.from({ length: main_sequence_chars.length }, (_, k) =>
            main_sequence_chars.slice(k)
        );

        // Use 'reduce' to iterate through each suffix and find the maximum match length.
        // This functional approach replaces the imperative accumulation of 'ans' in the original.
        const result_value = sequence_suffixes.reduce((acc_max, current_suffix) => {
            // For each suffix, find the longest common segment match with 'pattern_sequence_chars'.
            const suffix_match = locate_longest_segment_match(current_suffix, pattern_sequence_chars);
            // Update the accumulated maximum with the match found for the current suffix.
            return Math.max(acc_max, suffix_match);
        }, 0); // Start with an initial maximum of 0.

        return result_value;
    };

    // Iterate through the collected lines, processing them in pairs.
    // This replaces the 'while(true)' loop and 'arr.shift()' calls.
    const final_outputs = [];
    for (let idx = 0; idx < text_lines_array.length; idx += 2) {
        // Ensure there's a pair of lines to process
        if (idx + 1 < text_lines_array.length) {
            // Convert strings to character arrays explicitly for consistency with the original's split("")
            const first_line_characters = [...text_lines_array[idx]];
            const second_line_characters = [...text_lines_array[idx + 1]];
            // Calculate the overlap for the current pair and store the result.
            final_outputs.push(calculate_maximal_overlap(first_line_characters, second_line_characters));
        }
    }

    // Output all calculated results.
    final_outputs.forEach(outcome => console.log(outcome));
};

// Execute the main processing function.
process_source_data();