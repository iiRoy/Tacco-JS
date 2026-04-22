const process_input_data = require('fs').readFileSync('/dev/stdin', 'utf8');
const text_lines = process_input_data.split('\n');
const primary_string = text_lines.shift();

const final_result_container = { value: '' };

const alphabet_characters = Array.from({ length: 26 }, (_, idx) => String.fromCharCode('a'.charCodeAt(0) + idx));

if (primary_string.length === 26) {
    const string_length = primary_string.length;

    const find_greater_prefix_recursively = (current_idx, collected_suffix_chars) => {
        if (current_idx < 0) {
            return false;
        }

        const current_character_from_string = primary_string[current_idx];
        const updated_suffix_pool = [...collected_suffix_chars, current_character_from_string].sort();

        const current_string_prefix = primary_string.slice(0, current_idx);

        const matching_char_from_pool = updated_suffix_pool.find(
            (potential_char) => {
                const constructed_candidate = current_string_prefix + potential_char;
                return constructed_candidate > primary_string;
            }
        );

        if (matching_char_from_pool) {
            final_result_container.value = current_string_prefix + matching_char_from_pool;
            return true;
        } else {
            return find_greater_prefix_recursively(current_idx - 1, updated_suffix_pool);
        }
    };

    const solution_found = find_greater_prefix_recursively(string_length - 1, []);

    if (!solution_found) {
        final_result_container.value = -1;
    }

} else {
    const existing_letters_set = new Set(primary_string);

    const first_missing_character = alphabet_characters.find(
        (char_to_check) => !existing_letters_set.has(char_to_check)
    );

    final_result_container.value = primary_string + first_missing_character;
}

console.log(final_result_container.value);