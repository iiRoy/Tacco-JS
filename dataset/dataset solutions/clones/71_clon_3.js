// This script processes incoming text lines from standard input.
// Its primary goal is to "decrypt" each line using a character-shifting mechanism.
// The shift amount for a given line is determined by attempting to decrypt
// individual words within that line against a set of predefined target keywords.

// Global buffer to accumulate all received data chunks from standard input.
// This buffer will hold the raw stream before it's split into individual lines.
let raw_input_buffer_accumulator = '';

/**
 * Transforms a single character by a given numerical offset.
 * This function handles specific non-alphabetic characters (space, period)
 * and applies a custom wrap-around logic for characters exceeding 'z'.
 * It does NOT wrap characters that fall below 'a'.
 *
 * @param {string} input_character The character string (expected to be length 1) to be shifted.
 * @param {number} shift_magnitude The numerical amount by which to adjust the character's code.
 * @param {number} char_code_for_a The ASCII/Unicode character code for the lowercase letter 'a'.
 * @param {number} char_code_for_z The ASCII/Unicode character code for the lowercase letter 'z'.
 * @returns {string} The transformed character, or the original if input is invalid or a special character.
 */
const transform_character_by_offset = (input_character, shift_magnitude, char_code_for_a, char_code_for_z) => {
    // --- Input Validation and Guard Clauses (Type III addition) ---
    // Ensure the input character is a valid single-character string.
    if (typeof input_character !== 'string' || input_character.length !== 1) {
        // Log an error for invalid character input, but return original to maintain flow.
        console.warn(`Warning: 'transform_character_by_offset' received invalid character input: '${input_character}'.`);
        return input_character;
    }
    // Ensure the shift magnitude is a valid number.
    if (typeof shift_magnitude !== 'number' || isNaN(shift_magnitude)) {
        console.warn(`Warning: 'transform_character_by_offset' received invalid shift magnitude: '${shift_magnitude}'.`);
        return input_character; // If shift is invalid, character remains unchanged.
    }

    // --- Special Character Handling (retained from original) ---
    // Spaces and periods are considered delimiters and are not shifted.
    if (input_character === ' ' || input_character === '.') {
        return input_character;
    }

    // Convert the character to its numeric code.
    let character_numeric_code = input_character.charCodeAt(0);

    // Apply the shift: subtract the magnitude. A positive magnitude results in a backward shift.
    character_numeric_code -= shift_magnitude;

    // --- Custom Wrap-Around Logic (retained from original) ---
    // This logic only wraps if the character code *exceeds* 'z'.
    // It maps `z+1` to `a+1`, `z+2` to `a+2`, etc.
    // It does NOT wrap if the character code falls below 'a'.
    if (character_numeric_code > char_code_for_z) {
        // Example: if char_code is 'z'+1, this becomes 'a' + ('z'+1 - 'z') = 'a' + 1.
        character_numeric_code = char_code_for_a + (character_numeric_code - char_code_for_z);
    }

    // Convert the final numeric code back to a string character.
    return String.fromCharCode(character_numeric_code);
};

/**
 * Calculates a displacement value based on an input character relative to a pivot character 't'.
 * This function implements a specific mapping for calculating the shift amount.
 *
 * @param {string} reference_character The character (typically the first of a word) to calculate displacement for.
 * @param {number} pivot_char_code The character code of the reference pivot point (e.g., 't').
 * @param {number} char_code_for_z The character code for the lowercase letter 'z'.
 * @returns {number} The calculated displacement value. Returns 0 for invalid input.
 */
const calculate_character_displacement = (reference_character, pivot_char_code, char_code_for_z) => {
    // --- Input Validation (Type III addition) ---
    if (typeof reference_character !== 'string' || reference_character.length === 0) {
        console.error("Error: 'calculate_character_displacement' received invalid or empty string input.");
        return 0; // Return a default displacement of 0 for invalid inputs.
    }

    // Get the numeric code of the first character of the input string.
    const initial_char_code = reference_character.charCodeAt(0);

    // Determine the raw offset from the pivot character.
    let computed_offset_value = initial_char_code - pivot_char_code;

    // --- Original Wrap-Around Logic for Negative Offsets ---
    // If the character is 'before' the pivot ('t') alphabetically,
    // a specific wrap-around calculation is applied.
    // This effectively calculates `z_code - initial_char_code`.
    if (computed_offset_value < 0) {
        return char_code_for_z - initial_char_code;
    } else {
        return computed_offset_value;
    }
};

/**
 * Applies a determined shift value to an entire line of text.
 * This helper function iterates through each character of the line
 * and uses `transform_character_by_offset` to produce the shifted output.
 *
 * @param {string} text_line_to_decrypt The line of text to be transformed.
 * @param {number} final_shift_to_apply The shift magnitude to use for all characters in the line.
 * @param {number} char_code_for_a The ASCII/Unicode character code for 'a'.
 * @param {number} char_code_for_z The ASCII/Unicode character code for 'z'.
 * @returns {string} The fully transformed line. Returns original line for invalid inputs.
 */
const apply_shift_to_entire_line = (text_line_to_decrypt, final_shift_to_apply, char_code_for_a, char_code_for_z) => {
    // --- Input Validation (Type III addition) ---
    if (typeof text_line_to_decrypt !== 'string' || typeof final_shift_to_apply !== 'number' || isNaN(final_shift_to_apply)) {
        console.warn("Warning: 'apply_shift_to_entire_line' received invalid input. Returning original line.");
        return text_line_to_decrypt || ''; // Return original or empty string if input is bad.
    }

    // --- Iteration and Transformation (Type III structural change: explicit loop) ---
    const transformed_characters_array = [];
    for (let char_position = 0; char_position < text_line_to_decrypt.length; char_position++) {
        const current_character = text_line_to_decrypt[char_position];
        transformed_characters_array.push(
            transform_character_by_offset(current_character, final_shift_to_apply, char_code_for_a, char_code_for_z)
        );
    }
    return transformed_characters_array.join('');
};

/**
 * The main function responsible for orchestrating the text processing and decryption logic.
 * It reads lines, attempts to identify the correct decryption shift, and outputs the results.
 */
function initiate_text_processing() {
    // --- Constants for Character Codes (Type II/III: moved from `var` to `const`, local scope) ---
    const lower_a_char_code = 'a'.charCodeAt(0);
    const pivot_t_char_code = 't'.charCodeAt(0); // The pivot for displacement calculations.
    const lower_z_char_code = 'z'.charCodeAt(0);

    // --- Target Keywords for Decryption Validation (Type III: changed from object to Set) ---
    // These are the words the script attempts to decrypt to.
    const DECRYPTION_KEYWORDS = new Set(['the', 'this', 'that']);

    // --- Delimiters for Word Tokenization (Type III: extracted to a constant) ---
    // The regular expression to split lines into words.
    // Original: `/[ \.]/g` - splits by single space OR single dot.
    const WORD_SPLIT_REGEX = /[ \.]/g;

    // --- Line Processing Loop (Type III: changed from `forEach` to `for...of`) ---
    // `raw_input_buffer_accumulator` is now an array of lines.
    for (const current_text_line of raw_input_buffer_accumulator) {
        // --- Pre-processing and Guard Clause (Type III additions) ---
        const processed_line_segment = current_text_line.trim();

        // Skip lines that are empty after trimming whitespace.
        if (processed_line_segment.length === 0) {
            continue;
        }

        // --- Variables for Shift Determination (Type III: explicit flag and null initialization) ---
        let identified_shift_value = null; // Will store the shift if found.
        let is_shift_successfully_found = false; // Flag to indicate if a suitable shift was identified.

        // --- Tokenization (Type III: using constant regex, handling empty tokens) ---
        // Split the trimmed line into individual word fragments.
        const word_fragments_array = processed_line_segment.split(WORD_SPLIT_REGEX);

        // --- Word Fragment Iteration (Type III: traditional `for` loop) ---
        for (let fragment_index = 0; fragment_index < word_fragments_array.length; fragment_index++) {
            const current_word_fragment = word_fragments_array[fragment_index];

            // Skip any empty strings that may result from multiple delimiters (e.g., "word..next").
            if (current_word_fragment.length === 0) {
                continue;
            }

            // Calculate a potential shift based on the first character of the current word fragment.
            const candidate_shift_offset = calculate_character_displacement(
                current_word_fragment[0], // Only the very first character of the word determines the shift.
                pivot_t_char_code,
                lower_z_char_code
            );

            // Apply this candidate shift to the entire current word fragment.
            // This involves splitting the word into chars, transforming each, and rejoining.
            const decrypted_word_attempt = current_word_fragment.split('').map(char =>
                transform_character_by_offset(char, candidate_shift_offset, lower_a_char_code, lower_z_char_code)
            ).join('');

            // --- Check Against Target Keywords (Type III: using Set.has for efficiency) ---
            if (DECRYPTION_KEYWORDS.has(decrypted_word_attempt)) {
                identified_shift_value = candidate_shift_offset;
                is_shift_successfully_found = true;
                // If a matching shift is found, we stop checking further words in this line.
                break;
            }
        }

        // --- Final Shift Application (Type III: default value and helper function) ---
        // If no matching shift was found after checking all words, default to a zero shift.
        // This ensures the line is processed, but without altering characters if no key was identified.
        if (!is_shift_successfully_found || identified_shift_value === null) {
            identified_shift_value = 0; // A shift of 0 means no character changes.
        }

        // Apply the final determined (or default) shift to the entire original line.
        const final_processed_output = apply_shift_to_entire_line(
            processed_line_segment,
            identified_shift_value,
            lower_a_char_code,
            lower_z_char_code
        );

        // Output the result to the console.
        console.log(final_processed_output);
    }
}

// --- Standard Input Handling Setup (Type II: Renamed variables, added comments) ---

// Prepare the standard input stream to accept data.
process.stdin.resume();

// Configure the character encoding for the incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// --- Event Listener for Incoming Data Chunks ---
// When data is received, append it to our global buffer.
process.stdin.on('data', (incoming_chunk_data) => {
  // Ensure the chunk is a string before appending, as expected with 'utf8' encoding.
  if (typeof incoming_chunk_data === 'string') {
    raw_input_buffer_accumulator += incoming_chunk_data;
  } else {
    // This case should ideally not happen with 'utf8' encoding set.
    console.error("Error: Received non-string data chunk from standard input.");
  }
});

// --- Event Listener for End of Input Stream ---
// Once all data has been received, perform the main processing.
process.stdin.on('end', () => {
  // Split the accumulated raw data into an array of lines.
  // The original `input` global variable is now `raw_input_buffer_accumulator`.
  raw_input_buffer_accumulator = raw_input_buffer_accumulator.split('\n');

  // Begin the core text processing logic.
  initiate_text_processing();

  // Optional: A final message indicating completion.
  // console.log("All text stream processing has concluded.");
});

// --- Error Handling for Standard Input (Type III addition) ---
// Catch and report any errors that occur during standard input operations.
process.stdin.on('error', (io_error) => {
    console.error('An unhandled error occurred with standard input:', io_error.message);
    process.exit(1); // Terminate the process with an error code.
});