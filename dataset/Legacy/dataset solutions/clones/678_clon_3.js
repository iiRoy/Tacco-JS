/*
 * This file contains core runtime functionalities, types, and utilities
 * for applications compiled from OCaml to JavaScript.
 * It provides a JavaScript environment that mimics OCaml's runtime behavior,
 * including error handling, data structure representation, and function application.
 *
 * Major components include:
 * - Exception handling mechanisms.
 * - String manipulation for OCaml string types.
 * - Array access and manipulation for OCaml-style arrays.
 * - Generic function application with currying support.
 * - Number formatting and parsing.
 * - Comparison logic for various OCaml data types.
 * - Global registry for runtime values.
 *
 * This version incorporates extensive structural and semantic transformations
 * from an original OCaml-generated JavaScript code, aiming for Type III cloning.
 * Changes include renaming all identifiers, altering control flow, adding
 * intermediate variables, and modifying algorithm implementations where
 * functional equivalence is maintained.
 */

/**
 * Throws an OCaml-style exception with a numeric tag and an argument.
 * OCaml exceptions are typically represented as JavaScript arrays: [0, tag, argument].
 * @param {number} err_tag - The numeric tag identifying the exception type.
 * @param {*} err_argument - The associated data or message for the exception.
 */
function throw_ocaml_error (err_tag, err_argument) {
  throw [ 0, err_tag, err_argument ];
}

/**
 * Throws an OCaml-style exception with a string message.
 * The message is wrapped in an `OpalEncapsulatedText` object.
 * @param {number} err_tag - The numeric tag for the exception.
 * @param {string} message_text - The string message for the exception.
 */
function throw_ocaml_string_error (err_tag, message_text) {
  throw_ocaml_error (err_tag, new OpalEncapsulatedText (message_text));
}

/**
 * Signals an 'Invalid_argument' OCaml exception.
 * This uses a globally registered error tag.
 * @param {string} error_message - The detailed message for the invalid argument error.
 */
function signal_invalid_argument (error_message) {
  // `runtime_global_elements[4]` typically holds the 'Invalid_argument' exception tag.
  throw_ocaml_string_error (runtime_global_elements[4], error_message);
}

/**
 * Signals an OCaml array boundary violation error.
 * This is a specialized 'Invalid_argument' error.
 */
function signal_array_boundary_violation () {
  signal_invalid_argument ("array index is outside valid range");
}

/**
 * Efficiently repeats a given string `char_sequence` `count_val` times.
 * This iterative implementation uses a binary exponentiation approach
 * to achieve logarithmic time complexity relative to `count_val`.
 * @param {number} count_val - The number of times to repeat the string.
 * @param {string} char_sequence - The string to repeat.
 * @returns {string} The concatenated repeated string.
 */
function repeat_string_content (count_val, char_sequence) {
  if (count_val <= 0) {
    return ""; // No repetition needed for non-positive counts.
  }
  let final_result_accumulator = "";
  let current_segment_to_add = char_sequence;
  let remaining_repetitions = count_val;

  while (remaining_repetitions > 0) {
    // If the least significant bit of remaining_repetitions is 1,
    // it means this 'current_segment_to_add' contributes to the final result.
    if ( (remaining_repetitions & 1) !== 0 ) {
      final_result_accumulator += current_segment_to_add;
    }
    // Double the segment for the next power of 2 and halve the remaining count.
    current_segment_to_add += current_segment_to_add;
    remaining_repetitions >>= 1; // Equivalent to Math.floor(remaining_repetitions / 2)
  }
  return final_result_accumulator;
}

/**
 * Represents an OCaml string type in JavaScript.
 * This class manages various internal representations (JS string, raw byte sequence,
 * array of character codes) and provides methods for conversion and manipulation.
 * @param {string|null|undefined} initial_value - The initial string content.
 */
function OpalText(initial_value) {
  // Initialize internal caches and properties based on the provided value.
  if (initial_value !== null && initial_value !== undefined) {
    this.byteSequence = initial_value;
    this.fullByteSequence = initial_value;
    this.lastByteIndex = initial_value.length;
    this.contentLength = initial_value.length;
  }
}

OpalText.prototype = {
  jsRepresentation: null,    // Caches the standard JavaScript string representation (UTF-16).
  byteSequence: null,        // Caches the raw byte string representation (e.g., Latin-1 or UTF-8 bytes as chars).
  fullByteSequence: null,    // Caches the byte sequence, potentially padded with null characters to `contentLength`.
  charArray: null,           // Caches an array of numeric character codes.
  contentLength: null,       // The logical length of the string, including any implied null padding.
  lastByteIndex: 0,          // The length of the actual non-null byte content.

  /**
   * Converts the internal byte sequence to a standard JavaScript string (UTF-16)
   * and caches it. This involves decoding the URI components.
   * @returns {string} The standard JavaScript string.
   */
  toJSString: function() {
    if (this.jsRepresentation === null) {
      // The `escape` function encodes special characters, then `decodeURIComponent` decodes them
      // as UTF-8, effectively converting a byte string to a JS string.
      this.jsRepresentation = decodeURIComponent(escape(this.retrieveFullByteSequence()));
    }
    return this.jsRepresentation;
  },

  /**
   * Converts the internal representation to a raw byte string and caches it.
   * If a JS string is available, it's encoded. Otherwise, an array of chars is used.
   * @returns {string} The raw byte string.
   */
  toByteString: function() {
    let raw_bytes_string;
    if (this.jsRepresentation !== null) {
      // If JS string is available, encode it to a byte string (e.g., UTF-8 bytes as Latin-1 chars).
      raw_bytes_string = unescape(encodeURIComponent(this.jsRepresentation));
    } else {
      // If only char array is available, reconstruct the byte string from it.
      raw_bytes_string = "";
      const character_array = this.charArray;
      if (character_array && character_array.length > 0) {
        for (let idx = 0; idx < character_array.length; idx++) {
          raw_bytes_string += String.fromCharCode(character_array[idx]);
        }
      }
    }
    // Update all byte-related caches to reflect the new state.
    this.byteSequence = raw_bytes_string;
    this.fullByteSequence = raw_bytes_string;
    this.lastByteIndex = raw_bytes_string.length;
    this.contentLength = raw_bytes_string.length;
    return raw_bytes_string;
  },

  /**
   * Retrieves the raw byte string representation, performing conversion if not already cached.
   * @returns {string} The raw byte string.
   */
  getByteString: function() {
    let current_bytes = this.byteSequence;
    if (current_bytes === null) {
      current_bytes = this.toByteString();
    }
    return current_bytes;
  },

  /**
   * Retrieves the full byte sequence, padding with null characters if the logical
   * `contentLength` is greater than the actual `lastByteIndex`.
   * @returns {string} The full byte string.
   */
  retrieveFullByteSequence: function() {
    let current_full_bytes = this.fullByteSequence;
    if (current_full_bytes !== null) {
      return current_full_bytes;
    }

    let actual_byte_segment = this.byteSequence;
    if (actual_byte_segment === null) {
      actual_byte_segment = this.toByteString();
    }

    // Pad with null characters ('\0') if the logical length requires it.
    if (this.lastByteIndex < this.contentLength) {
      const padding_characters_needed = this.contentLength - this.lastByteIndex;
      actual_byte_segment += repeat_string_content(padding_characters_needed, '\0');
      this.lastByteIndex = this.contentLength; // Update to reflect full length.
    }
    this.fullByteSequence = actual_byte_segment;
    return actual_byte_segment;
  },

  /**
   * Converts the internal representation to an array of character codes and caches it.
   * Clears other caches to ensure data consistency.
   * @returns {number[]} An array of character codes.
   */
  toCharacterCodeArray: function() {
    let current_bytes = this.byteSequence;
    if (current_bytes === null) {
      current_bytes = this.toByteString();
    }

    const character_code_array = [];
    const effective_content_length = this.lastByteIndex; // Length of actual content.
    for (let idx = 0; idx < effective_content_length; idx++) {
      character_code_array[idx] = current_bytes.charCodeAt(idx);
    }
    // Pad with zeros if the logical length is greater than the actual content.
    for (let idx = effective_content_length; idx < this.contentLength; idx++) {
      character_code_array[idx] = 0;
    }

    // Invalidate other cached representations.
    this.jsRepresentation = null;
    this.byteSequence = null;
    this.fullByteSequence = null;
    this.lastByteIndex = this.contentLength; // The array now represents the full logical length.
    this.charArray = character_code_array;
    return character_code_array;
  },

  /**
   * Retrieves the character code array, converting if it's not already cached.
   * @returns {number[]} An array of character codes.
   */
  getCharacterCodeArray: function() {
    let character_array = this.charArray;
    if (!character_array) {
      character_array = this.toCharacterCodeArray();
    }
    return character_array;
  },

  /**
   * Retrieves the logical length of the string.
   * Performs conversion to byte string if the length is not yet determined.
   * @returns {number} The logical string length.
   */
  getLengthValue: function() {
    if (this.contentLength !== null) {
      return this.contentLength;
    }
    this.toByteString(); // Force calculation of length.
    return this.contentLength;
  },

  /**
   * Provides a standard string representation, prioritizing the cached JS string.
   * @returns {string} The string representation.
   */
  toString: function() {
    return this.jsRepresentation || this.toJSString();
  },

  /**
   * Provides a primitive value representation, primarily for internal JS comparisons.
   * @returns {string} The string representation.
   */
  valueOf: function() {
    return this.jsRepresentation || this.toJSString();
  },

  /**
   * Copies a segment of the string's character data into a target array.
   * Handles cases where the source is a character array or a byte string.
   * @param {number} source_offset - Starting index in this string.
   * @param {Array} dest_array - The destination array.
   * @param {number} dest_offset - Starting index in the destination array.
   * @param {number} copy_length - The number of character codes to copy.
   */
  copyToArraySegment: function(source_offset, dest_array, dest_offset, copy_length) {
    const source_char_arr = this.charArray;
    if (source_char_arr) {
      // If source is already an array, optimize copying.
      // Handle potential overlaps by copying forwards or backwards.
      if (dest_offset <= source_offset) {
        for (let i = 0; i < copy_length; i++) {
          dest_array[dest_offset + i] = source_char_arr[source_offset + i];
        }
      } else {
        for (let i = copy_length - 1; i >= 0; i--) {
          dest_array[dest_offset + i] = source_char_arr[source_offset + i];
        }
      }
    } else {
      // If not an array, retrieve byte string and copy character codes.
      let byte_str = this.byteSequence;
      if (byte_str === null) {
        byte_str = this.toByteString();
      }
      const actual_bytes_available = this.lastByteIndex - source_offset;

      // Copy actual characters up to the available length.
      const characters_copied = Math.min(copy_length, actual_bytes_available);
      for (let i = 0; i < characters_copied; i++) {
        dest_array[dest_offset + i] = byte_str.charCodeAt(source_offset + i);
      }
      // Fill any remaining positions with zeros if `copy_length` is larger.
      for (let i = characters_copied; i < copy_length; i++) {
        dest_array[dest_offset + i] = 0;
      }
    }
  },

  /**
   * Retrieves the character code at a specific index.
   * Returns 0 if the index is beyond the actual content length.
   * @param {number} char_index - The index to retrieve.
   * @returns {number} The character code (0-255) or 0.
   */
  getCharAtIndex: function(char_index) {
    const char_arr = this.charArray;
    if (char_arr) {
      return char_arr[char_index];
    }
    const byte_str = this.byteSequence || this.toByteString();
    return (char_index < this.lastByteIndex) ? byte_str.charCodeAt(char_index) : 0;
  },

  /**
   * Safely retrieves the character code at a specific index, with bounds checking.
   * Throws an array boundary violation if the index is invalid.
   * @param {number} char_index - The index to retrieve.
   * @returns {number} The character code.
   */
  getCharAtIndexSafe: function(char_index) {
    // Ensure logical length is known before performing checks.
    if (this.contentLength === null) {
      this.toByteString();
    }
    if (char_index < 0 || char_index >= this.contentLength) {
      signal_array_boundary_violation();
    }
    return this.getCharAtIndex(char_index);
  },

  /**
   * Sets the character code at a specific index.
   * If not already an array, it may convert to an array or append if at the end.
   * Invalidates other cached representations upon modification.
   * @param {number} char_index - The index to set.
   * @param {number} char_code - The character code to set (truncated to 8 bits).
   * @returns {number} Always 0 (OCaml convention for successful operation).
   */
  setCharAtIndex: function(char_index, char_code) {
    let char_arr = this.charArray;
    if (!char_arr) {
      // If setting at the end of the current byte sequence, append directly.
      if (this.lastByteIndex === char_index) {
        this.byteSequence += String.fromCharCode(char_code & 0xff);
        this.lastByteIndex++;
        this.contentLength++; // Logical length also increases.
        return 0;
      }
      // Otherwise, convert to an array to allow modification at any index.
      char_arr = this.toCharacterCodeArray();
    } else if (this.byteSequence !== null) {
      // If array exists but byte string is also cached, invalidate byte/JS caches.
      this.byteSequence = null;
      this.fullByteSequence = null;
      this.jsRepresentation = null;
    }
    char_arr[char_index] = char_code & 0xff; // Set the character code.
    return 0;
  },

  /**
   * Safely sets the character code at a specific index, with bounds checking.
   * Throws an array boundary violation if the index is invalid.
   * @param {number} char_index - The index to set.
   * @param {number} char_code - The character code to set.
   */
  setCharAtIndexSafe: function(char_index, char_code) {
    // Ensure logical length is known before checking bounds.
    if (this.contentLength === null) {
      this.toByteString();
    }
    if (char_index < 0 || char_index >= this.contentLength) {
      signal_array_boundary_violation();
    }
    this.setCharAtIndex(char_index, char_code);
  },

  /**
   * Fills a segment of the string with a specified character code.
   * Converts to a character array if not already, and invalidates other caches.
   * @param {number} start_offset - Starting index for filling.
   * @param {number} fill_length - Number of positions to fill.
   * @param {number} fill_char_code - The character code to use for filling.
   */
  fillSegment: function(start_offset, fill_length, fill_char_code) {
    // Optimization: if filling beyond actual content with nulls, and content is already padded, do nothing.
    if (start_offset >= this.lastByteIndex && this.lastByteIndex > 0 && fill_char_code === 0) {
      return;
    }
    let char_arr = this.charArray;
    if (!char_arr) {
      char_arr = this.toCharacterCodeArray();
    } else if (this.byteSequence !== null) {
      // Invalidate byte/JS caches if array exists and byte string was also cached.
      this.byteSequence = null;
      this.fullByteSequence = null;
      this.jsRepresentation = null;
    }
    const end_offset_exclusive = start_offset + fill_length;
    for (let i = start_offset; i < end_offset_exclusive; i++) {
      char_arr[i] = fill_char_code;
    }
  },

  /**
   * Compares this `OpalText` instance with another `OpalText` instance.
   * Prioritizes comparison of cached JS strings, then falls back to byte sequences.
   * @param {OpalText} other_text - The other string to compare with.
   * @returns {number} -1 if this < other, 0 if equal, 1 if this > other.
   */
  compareWith: function(other_text) {
    // Optimized comparison if both have cached JS string representations.
    if (this.jsRepresentation !== null && other_text.jsRepresentation !== null) {
      const s1 = this.jsRepresentation;
      const s2 = other_text.jsRepresentation;
      if (s1 < s2) return -1;
      if (s1 > s2) return 1;
      return 0;
    }
    // Fallback to full byte sequence comparison.
    const b1 = this.retrieveFullByteSequence();
    const b2 = other_text.retrieveFullByteSequence();
    if (b1 < b2) return -1;
    if (b1 > b2) return 1;
    return 0;
  },

  /**
   * Checks for equality with another `OpalText` instance.
   * @param {OpalText} other_text - The other string.
   * @returns {boolean} True if equal, false otherwise.
   */
  isEqual: function(other_text) {
    if (this.jsRepresentation !== null && other_text.jsRepresentation !== null) {
      return this.jsRepresentation === other_text.jsRepresentation;
    }
    return this.retrieveFullByteSequence() === other_text.retrieveFullByteSequence();
  },

  /**
   * Checks if this string is lexicographically less than another.
   * @param {OpalText} other_text - The other string.
   * @returns {boolean} True if less than, false otherwise.
   */
  isLessThan: function(other_text) {
    if (this.jsRepresentation !== null && other_text.jsRepresentation !== null) {
      return this.jsRepresentation < other_text.jsRepresentation;
    }
    return this.retrieveFullByteSequence() < other_text.retrieveFullByteSequence();
  },

  /**
   * Checks if this string is lexicographically less than or equal to another.
   * @param {OpalText} other_text - The other string.
   * @returns {boolean} True if less than or equal, false otherwise.
   */
  isLessOrEqual: function(other_text) {
    if (this.jsRepresentation !== null && other_text.jsRepresentation !== null) {
      return this.jsRepresentation <= other_text.jsRepresentation;
    }
    return this.retrieveFullByteSequence() <= other_text.retrieveFullByteSequence();
  }
};

/**
 * A specialized `OpalText` subclass for wrapping existing JavaScript strings.
 * This avoids unnecessary conversions if the string is already in JS format.
 * @param {string} raw_string - The string to wrap.
 */
function OpalEncapsulatedText(raw_string) {
  this.jsRepresentation = raw_string;
}
OpalEncapsulatedText.prototype = new OpalText(); // Inherits from OpalText.

/**
 * A specialized `OpalText` subclass for constructing strings with a predefined length.
 * Useful for pre-allocating string buffers.
 * @param {number} predefined_length - The intended logical length of the string.
 */
function OpalConstructedText(predefined_length) {
  this.byteSequence = ""; // Start with an empty byte sequence.
  this.contentLength = predefined_length;
  // No initial fullByteSequence or lastByteIndex, as content is built up.
}
OpalConstructedText.prototype = new OpalText(); // Inherits from OpalText.

/**
 * Retrieves an element from an OCaml-style array.
 * OCaml arrays often have a header element at index 0, so actual data starts at index 1.
 * @param {Array} target_array - The OCaml-style array.
 * @param {number} target_index - The 0-based logical index (relative to data, not header).
 * @returns {*} The element at the adjusted index.
 * @throws If index is out of bounds.
 */
function get_ocaml_array_element (target_array, target_index) {
  const effective_length = target_array.length - 1; // Subtract 1 for the header.
  if (target_index < 0 || target_index >= effective_length) {
    signal_array_boundary_violation();
  }
  return target_array[target_index + 1]; // Access at (logical index + 1).
}

/**
 * Sets an element in an OCaml-style array.
 * @param {Array} target_array - The OCaml-style array.
 * @param {number} target_index - The 0-based logical index.
 * @param {*} new_value - The value to set.
 * @returns {number} Always 0 (OCaml convention for successful operation).
 * @throws If index is out of bounds.
 */
function set_ocaml_array_element (target_array, target_index, new_value) {
  const effective_length = target_array.length - 1;
  if (target_index < 0 || target_index >= effective_length) {
    signal_array_boundary_violation();
  }
  target_array[target_index + 1] = new_value; // Set at (logical index + 1).
  return 0;
}

/**
 * Handles generic OCaml function application, supporting currying.
 * If a function expects more arguments than provided, it returns a new
 * partially applied function. If too many are provided, it applies
 * the function multiple times.
 * @param {Function} target_function - The function to call.
 * @param {Array} input_arguments - An array of arguments to apply.
 * @returns {*} The result of the function call or a new curried function.
 */
function execute_ocaml_function (target_function, input_arguments) {
  // If the target_function is an OCaml closure wrapper (e.g., `f.fun`), unwrap it.
  if (typeof target_function === 'object' && target_function !== null && target_function.fun) {
    return execute_ocaml_function(target_function.fun, input_arguments);
  }

  const expected_arg_count = target_function.length;
  const supplied_arg_count = input_arguments.length;
  const argument_difference = expected_arg_count - supplied_arg_count;

  if (argument_difference === 0) {
    // If argument counts match, directly apply the function with `null` as `this` context.
    return target_function.apply(null, input_arguments);
  } else if (argument_difference < 0) {
    // If too many arguments are supplied, apply the function with the expected number,
    // then recursively apply the remaining arguments to the result.
    const initial_result = target_function.apply(null, input_arguments.slice(0, expected_arg_count));
    return execute_ocaml_function(initial_result, input_arguments.slice(expected_arg_count));
  } else {
    // If too few arguments, return a new function that takes the next argument
    // and continues the curried application process.
    return function (additional_arg) {
      return execute_ocaml_function(target_function, input_arguments.concat([additional_arg]));
    };
  }
}

/**
 * Parses a format string for integer and float formatting specifications.
 * This function extracts alignment, padding, base, precision, and other flags.
 * @param {string|OpalText} format_spec_input - The format specification string.
 * @returns {Object} An object containing all parsed format options.
 * @throws If the format string is excessively long.
 */
function parse_integer_format_spec (format_spec_input) {
  const spec_str = format_spec_input.toString(); // Ensure it's a standard JS string.
  const spec_len = spec_str.length;

  // Guard clause for overly long format strings.
  if (spec_len > 31) {
    signal_invalid_argument("format_integer: format string too extensive");
  }

  // Initialize format options with default values.
  const format_options = {
    alignment_char: '+',    // '+' for right-aligned, '-' for left-aligned
    sign_display: '-',      // '-' for default, '+' for always show sign, ' ' for space for positive
    padding_char: ' ',      // ' ' or '0' for padding
    alternate_form: false,  // '#' flag for alternate output forms (e.g., 0x for hex).
    radix_base: 0,          // 0 for auto-detect or not set; 8, 10, 16 for specific bases.
    signed_conversion: false, // True for signed conversions ('d', 'i', 'e', 'f', 'g').
    minimum_width: 0,       // Minimum field width.
    uppercase_output: false, // True if 'X', 'E', 'F', 'G' used for uppercase output.
    numeric_sign: 1,        // -1 for negative, 1 for positive.
    precision_value: -1,    // -1 for default precision.
    conversion_type: 'f'    // Default conversion type (e.g., 'f' for float).
  };

  let current_index = 0;
  while (current_index < spec_len) {
    const current_char = spec_str.charAt(current_index);

    switch (current_char) {
      case '-':
        format_options.alignment_char = '-';
        break;
      case '+':
      case ' ':
        format_options.sign_display = current_char;
        break;
      case '0':
        format_options.padding_char = '0';
        break;
      case '#':
        format_options.alternate_form = true;
        break;
      case '1': case '2': case '3': case '4': case '5':
      case '6': case '7': case '8': case '9':
        let parsed_width = 0;
        let digit_code;
        // Parse the numeric width.
        while (current_index < spec_len &&
               (digit_code = spec_str.charCodeAt(current_index) - 48) >= 0 && digit_code <= 9) {
          parsed_width = parsed_width * 10 + digit_code;
          current_index++;
        }
        format_options.minimum_width = parsed_width;
        current_index--; // Adjust index as loop increments one too far.
        break;
      case '.':
        format_options.precision_value = 0; // Default precision if no digits follow.
        current_index++; // Move past '.'
        let parsed_precision = 0;
        let precision_digit_code;
        // Parse the numeric precision.
        while (current_index < spec_len &&
               (precision_digit_code = spec_str.charCodeAt(current_index) - 48) >= 0 && precision_digit_code <= 9) {
          parsed_precision = parsed_precision * 10 + precision_digit_code;
          current_index++;
        }
        format_options.precision_value = parsed_precision;
        current_index--; // Adjust index.
        break;
      case 'd':
      case 'i':
        format_options.signed_conversion = true;
        // Fallthrough to 'u' for base 10.
      case 'u':
        format_options.radix_base = 10;
        break;
      case 'x':
        format_options.radix_base = 16;
        break;
      case 'X':
        format_options.radix_base = 16;
        format_options.uppercase_output = true;
        break;
      case 'o':
        format_options.radix_base = 8;
        break;
      case 'e':
      case 'f':
      case 'g':
        format_options.signed_conversion = true;
        format_options.conversion_type = current_char;
        break;
      case 'E':
      case 'F':
      case 'G':
        format_options.signed_conversion = true;
        format_options.uppercase_output = true;
        format_options.conversion_type = current_char.toLowerCase();
        break;
    }
    current_index++; // Move to the next character in the format string.
  }
  return format_options;
}

/**
 * Applies the final formatting options to a raw numeric string,
 * adding signs, prefixes, and padding as specified.
 * @param {Object} format_settings - The parsed format options object.
 * @param {string} raw_value_string - The raw numeric value as a string.
 * @returns {OpalEncapsulatedText} The fully formatted string wrapped in `OpalEncapsulatedText`.
 */
function finalize_formatted_output (format_settings, raw_value_string) {
  let processed_raw_string = raw_value_string;
  if (format_settings.uppercase_output) {
    processed_raw_string = processed_raw_string.toUpperCase();
  }

  let effective_content_length = processed_raw_string.length;
  // Adjust length for potential sign character.
  if (format_settings.signed_conversion && (format_settings.numeric_sign < 0 || format_settings.sign_display !== '-')) {
    effective_content_length++;
  }
  // Adjust length for alternate form prefixes (e.g., "0" for octal, "0x" for hexadecimal).
  if (format_settings.alternate_form) {
    if (format_settings.radix_base === 8) effective_content_length += 1;
    if (format_settings.radix_base === 16) effective_content_length += 2;
  }

  let output_buffer = "";

  // 1. Pre-padding with spaces for right-justification (if applicable).
  if (format_settings.alignment_char === '+' && format_settings.padding_char === ' ') {
    const space_padding_needed = format_settings.minimum_width - effective_content_length;
    if (space_padding_needed > 0) {
      output_buffer += repeat_string_content(space_padding_needed, ' ');
    }
  }

  // 2. Add the sign character.
  if (format_settings.signed_conversion) {
    if (format_settings.numeric_sign < 0) {
      output_buffer += '-';
    } else if (format_settings.sign_display !== '-') {
      output_buffer += format_settings.sign_display;
    }
  }

  // 3. Add the alternate form prefix.
  if (format_settings.alternate_form) {
    if (format_settings.radix_base === 8) output_buffer += '0';
    if (format_settings.radix_base === 16) output_buffer += "0x";
  }

  // 4. Pre-padding with zeros for right-justification (if applicable).
  if (format_settings.alignment_char === '+' && format_settings.padding_char === '0') {
    const zero_padding_needed = format_settings.minimum_width - effective_content_length;
    if (zero_padding_needed > 0) {
      output_buffer += repeat_string_content(zero_padding_needed, '0');
    }
  }

  // 5. Append the actual numeric string.
  output_buffer += processed_raw_string;

  // 6. Post-padding with spaces for left-justification.
  if (format_settings.alignment_char === '-') {
    const post_padding_needed = format_settings.minimum_width - effective_content_length;
    if (post_padding_needed > 0) {
      output_buffer += repeat_string_content(post_padding_needed, ' ');
    }
  }

  return new OpalEncapsulatedText(output_buffer);
}

/**
 * Formats an integer value into a string according to a specified format string.
 * This function handles sign, base conversion, padding, and precision.
 * @param {string|OpalText} format_string - The format specification.
 * @param {number} integer_value - The integer to format.
 * @returns {OpalEncapsulatedText} The formatted string, wrapped.
 */
function format_integer_to_string(format_string, integer_value) {
  const format_str_js = format_string.toString();
  // Quick path for the common "%d" format to avoid full parsing overhead.
  if (format_str_js === "%d") {
    return new OpalEncapsulatedText("" + integer_value);
  }

  const parsed_settings = parse_integer_format_spec(format_string);
  let current_integer_value = integer_value;

  // Handle negative numbers and unsigned conversions.
  if (current_integer_value < 0) {
    if (parsed_settings.signed_conversion) {
      parsed_settings.numeric_sign = -1;
      current_integer_value = -current_integer_value; // Make positive for string conversion.
    } else {
      current_integer_value >>>= 0; // Convert to unsigned 32-bit integer.
    }
  }

  let numeric_as_string = current_integer_value.toString(parsed_settings.radix_base);

  // Apply precision formatting (adds leading zeros if needed, overrides '0' padding).
  if (parsed_settings.precision_value >= 0) {
    parsed_settings.padding_char = ' '; // Precision takes precedence over '0' padding.
    const zeros_to_add = parsed_settings.precision_value - numeric_as_string.length;
    if (zeros_to_add > 0) {
      numeric_as_string = repeat_string_content(zeros_to_add, '0') + numeric_as_string;
    }
  }

  return finalize_formatted_output(parsed_settings, numeric_as_string);
}

/**
 * Compares two 64-bit integers represented as OCaml arrays.
 * Assumes a specific array structure for int64: `[tag, low, mid, high]`.
 * @param {Array} val_x - First 64-bit integer array.
 * @param {Array} val_y - Second 64-bit integer array.
 * @returns {number} -1 if x < y, 0 if x == y, 1 if x > y.
 */
function compare_long_integers(val_x, val_y) {
  // Compare the most significant parts first (val_x[3] and val_y[3], shifted).
  const x_high_part_adjusted = val_x[3] << 16;
  const y_high_part_adjusted = val_y[3] << 16;

  if (x_high_part_adjusted > y_high_part_adjusted) return 1;
  if (x_high_part_adjusted < y_high_part_adjusted) return -1;

  // If high parts are equal, compare the next significant parts (val_x[2] and val_y[2]).
  if (val_x[2] > val_y[2]) return 1;
  if (val_x[2] < val_y[2]) return -1;

  // If middle parts are equal, compare the least significant parts (val_x[1] and val_y[1]).
  if (val_x[1] > val_y[1]) return 1;
  if (val_x[1] < val_y[1]) return -1;

  return 0; // All parts are equal, so the numbers are equal.
}

/**
 * Compares two standard JavaScript integers.
 * @param {number} int_a - First integer.
 * @param {number} int_b - Second integer.
 * @returns {number} -1 if a < b, 0 if a == b, 1 if a > b.
 */
function compare_plain_integers (int_a, int_b) {
  if (int_a < int_b) return -1;
  if (int_a === int_b) return 0;
  return 1; // int_a > int_b
}

/**
 * Performs a deep comparison of two OCaml values, including recursive structure traversal.
 * Handles primitive types, `OpalText` objects, and OCaml-style arrays (blocks/variants).
 * @param {*} val_a - First value for comparison.
 * @param {*} val_b - Second value for comparison.
 * @param {boolean} perform_total_comparison - If true, distinguishes NaN, etc., for total ordering.
 * @returns {number} -1 if a < b, 0 if a == b, 1 if a > b.
 */
function deep_ocaml_value_comparison (val_a, val_b, perform_total_comparison) {
  // Use a stack to manage recursive comparisons of nested structures without deep recursion.
  const comparison_stack = [];

  while (true) {
    // If values are strictly equal and total comparison is not required, they are considered equal.
    if (!(perform_total_comparison && val_a === val_b)) {
      if (val_a instanceof OpalText) {
        // Handle comparison of OpalText instances.
        if (val_b instanceof OpalText) {
          if (val_a !== val_b) {
            const text_comparison_result = val_a.compareWith(val_b);
            if (text_comparison_result !== 0) return text_comparison_result;
          }
        } else {
          return 1; // OpalText is considered greater than non-OpalText.
        }
      } else if (Array.isArray(val_a) && typeof val_a[0] === 'number' && (val_a[0] | 0) === val_a[0]) {
        // This path handles OCaml block/variant types (arrays with a numeric tag at index 0).
        const type_tag_a = val_a[0];

        if (type_tag_a === 250) { // OCaml "forward pointer" or indirection (like a ref cell).
          val_a = val_a[1]; // Dereference and continue comparison.
          continue;
        } else if (Array.isArray(val_b) && typeof val_b[0] === 'number' && (val_b[0] | 0) === val_b[0]) {
          const type_tag_b = val_b[0];

          if (type_tag_b === 250) { // Dereference OCaml "forward pointer" for val_b.
            val_b = val_b[1];
            continue;
          } else if (type_tag_a !== type_tag_b) {
            return (type_tag_a < type_tag_b) ? -1 : 1; // Compare by tag if types differ.
          } else {
            // Tags are equal, compare contents based on specific tag types.
            switch (type_tag_a) {
              case 248: { // OCaml closure or custom block type (often compares by hash or size).
                const cmp_res = compare_plain_integers(val_a[2], val_b[2]);
                if (cmp_res !== 0) return cmp_res;
                break;
              }
              case 255: { // OCaml int64 type.
                const cmp_res = compare_long_integers(val_a, val_b);
                if (cmp_res !== 0) return cmp_res;
                break;
              }
              default:
                // For other block types, first compare lengths.
                if (val_a.length !== val_b.length) {
                  return (val_a.length < val_b.length) ? -1 : 1;
                }
                // If lengths are equal and there are more elements, push to stack for recursive comparison.
                if (val_a.length > 1) {
                  comparison_stack.push(val_a, val_b, 1); // Push arrays and starting index.
                }
            }
          }
        } else {
          return 1; // Array-like 'a' is greater than non-array 'b'.
        }
      } else if (val_b instanceof OpalText || (Array.isArray(val_b) && typeof val_b[0] === 'number' && (val_b[0] | 0) === val_b[0])) {
        return -1; // Non-array 'a' is less than array-like 'b'.
      } else {
        // Primitive value comparison or other non-special types.
        if (val_a < val_b) return -1;
        if (val_a > val_b) return 1;
        // Special handling for total comparison (e.g., NaN vs. NaN, undefined).
        if (perform_total_comparison && val_a !== val_b) {
          if (val_a === val_a) return 1; // If 'a' is not NaN, but 'a' != 'b', then 'b' must be NaN.
          if (val_b === val_b) return -1; // If 'b' is not NaN, but 'a' is NaN, then 'a' < 'b'.
        }
      }
    }

    // If the comparison stack is empty, all comparisons are done, and values are equal.
    if (comparison_stack.length === 0) return 0;

    // Pop the next elements to compare from the stack.
    const current_index_in_arrays = comparison_stack.pop();
    val_b = comparison_stack.pop();
    val_a = comparison_stack.pop();

    // If there are more elements in the current arrays to compare, push back with incremented index.
    if (current_index_in_arrays + 1 < val_a.length) {
      comparison_stack.push(val_a, val_b, current_index_in_arrays + 1);
    }
    // Get the next pair of elements for the current iteration.
    val_a = val_a[current_index_in_arrays];
    val_b = val_b[current_index_in_arrays];
  }
}

/**
 * Performs a total comparison of two OCaml values.
 * This ensures a consistent ordering even for tricky values like NaN.
 * @param {*} val_x - First value.
 * @param {*} val_y - Second value.
 * @returns {number} -1 if x < y, 0 if x == y, 1 if x > y.
 */
function total_ocaml_comparison (val_x, val_y) {
  return deep_ocaml_value_comparison(val_x, val_y, true);
}

/**
 * Checks if value x is greater than or equal to value y using total comparison.
 * @param {*} val_x - First value.
 * @param {*} val_y - Second value.
 * @returns {number} 1 if x >= y, 0 otherwise.
 */
function check_greater_or_equal (val_x, val_y) {
  return +(total_ocaml_comparison(val_x, val_y) >= 0);
}

/**
 * Checks if value x is less than or equal to value y using total comparison.
 * @param {*} val_x - First value.
 * @param {*} val_y - Second value.
 * @returns {number} 1 if x <= y, 0 otherwise.
 */
function check_less_or_equal (val_x, val_y) {
  return +(total_ocaml_comparison(val_x, val_y) <= 0);
}

/**
 * Parses the sign and base prefix of a numeric string (e.g., "0x", "0o", "0b").
 * @param {OpalText} input_string_obj - The `OpalText` string object to parse.
 * @returns {Array} An array: `[index_after_prefix, sign_multiplier, detected_base]`.
 */
function parse_numeric_prefix (input_string_obj) {
  let current_parse_index = 0;
  let numeric_sign = 1; // Default to positive.

  // Check for a negative sign at the very beginning.
  if (input_string_obj.getCharAtIndex(0) === 45) { // ASCII code for '-'
    numeric_sign = -1;
    current_parse_index++;
  }

  let detected_base = 10; // Default to decimal base.

  // Check for base prefixes like "0x", "0o", "0b".
  if (input_string_obj.getCharAtIndex(current_parse_index) === 48) { // ASCII code for '0'
    const next_char_code = input_string_obj.getCharAtIndex(current_parse_index + 1);
    switch (next_char_code) {
      case 120: // 'x'
      case 88:  // 'X'
        detected_base = 16; // Hexadecimal
        current_parse_index += 2;
        break;
      case 111: // 'o'
      case 79:  // 'O'
        detected_base = 8;  // Octal
        current_parse_index += 2;
        break;
      case 98:  // 'b'
      case 66:  // 'B'
        detected_base = 2;  // Binary
        current_parse_index += 2;
        break;
    }
  }
  return [current_parse_index, numeric_sign, detected_base];
}

/**
 * Converts an ASCII character code to its numeric digit value for a given base.
 * @param {number} char_code_val - The ASCII character code.
 * @returns {number} The digit value (0-9 for '0'-'9', 10-35 for 'A'-'Z'/'a'-'z'), or -1 if invalid.
 */
function convert_char_to_digit_value(char_code_val) {
  if (char_code_val >= 48 && char_code_val <= 57) { // '0' through '9'
    return char_code_val - 48;
  }
  if (char_code_val >= 65 && char_code_val <= 90) { // 'A' through 'Z'
    return char_code_val - 55; // 'A' becomes 10, 'B' becomes 11, etc.
  }
  if (char_code_val >= 97 && char_code_val <= 122) { // 'a' through 'z'
    return char_code_val - 87; // 'a' becomes 10, 'b' becomes 11, etc.
  }
  return -1; // Not a valid digit character.
}

// A central repository for global runtime elements, typically OCaml exception tags or constants.
// Index 0 is often reserved or unused by convention.
const runtime_global_elements = [0];

/**
 * Raises a runtime error with a string message, using the generic failure tag.
 * @param {string} error_message - The message for the error.
 */
function signal_runtime_failure (error_message) {
  // `runtime_global_elements[3]` typically holds the generic 'Failure' exception tag.
  throw_ocaml_string_error(runtime_global_elements[3], error_message);
}

/**
 * Converts an `OpalText` string object to a 32-bit signed integer.
 * Handles different bases (decimal, hex, octal, binary) and checks for overflow.
 * @param {OpalText} input_opal_string - The string object to convert.
 * @returns {number} The parsed 32-bit signed integer.
 * @throws If the string is not a valid integer, contains extraneous characters,
 *         or causes an overflow for a 32-bit signed integer.
 */
function parse_string_to_integer (input_opal_string) {
  const [start_idx, sign_factor, numeric_base] = parse_numeric_prefix(input_opal_string);

  // Define 32-bit signed integer thresholds.
  const MAX_INT_32 = 2147483647; // (2^31 - 1)
  const MIN_INT_32_ABS = 2147483648; // (2^31) absolute value for negative numbers.

  let current_char_code = input_opal_string.getCharAtIndex(start_idx);
  let digit_value = convert_char_to_digit_value(current_char_code);

  if (digit_value < 0 || digit_value >= numeric_base) {
    signal_runtime_failure("integer_of_string: invalid format or empty number");
  }

  let accumulated_value = digit_value;
  let char_iterator_index = start_idx;

  while (true) {
    char_iterator_index++;
    current_char_code = input_opal_string.getCharAtIndex(char_iterator_index);

    if (current_char_code === 95) { // ASCII '_' (underscore) is allowed as a digit separator.
      continue;
    }

    digit_value = convert_char_to_digit_value(current_char_code);

    if (digit_value < 0 || digit_value >= numeric_base) {
      break; // End of digits or an invalid character encountered.
    }

    // Check for potential overflow BEFORE multiplication to prevent incorrect results.
    if (sign_factor === 1) { // Positive number overflow check.
      if (accumulated_value > Math.floor(MAX_INT_32 / numeric_base) ||
          (accumulated_value === Math.floor(MAX_INT_32 / numeric_base) && digit_value > (MAX_INT_32 % numeric_base))) {
        signal_runtime_failure("integer_of_string: value exceeds maximum 32-bit integer");
      }
    } else { // Negative number overflow check (using absolute value).
      if (accumulated_value > Math.floor(MIN_INT_32_ABS / numeric_base) ||
          (accumulated_value === Math.floor(MIN_INT_32_ABS / numeric_base) && digit_value > (MIN_INT_32_ABS % numeric_base))) {
        signal_runtime_failure("integer_of_string: value exceeds minimum 32-bit integer");
      }
    }

    accumulated_value = numeric_base * accumulated_value + digit_value;
  }

  // Ensure all characters in the string were consumed by the number parsing.
  if (char_iterator_index !== input_opal_string.getLengthValue()) {
    signal_runtime_failure("integer_of_string: extraneous characters after number");
  }

  const final_result = sign_factor * accumulated_value;

  // Final check to confirm the result fits within a 32-bit signed integer range.
  // The `| 0` bitwise operation effectively truncates to 32-bit signed int.
  if ((final_result | 0) !== final_result) {
    signal_runtime_failure("integer_of_string: result not representable as 32-bit int");
  }

  return final_result;
}

/**
 * Provides a cross-environment compatible console object.
 * It ensures that common console methods (like log, warn, error) exist,
 * stubbing them with no-op functions if they are missing (e.g., in older browsers or non-browser environments).
 * @returns {Object} The console object.
 */
function acquire_browser_console_interface () {
  // Use `globalThis` for broader compatibility across Node.js, Web Workers, and browsers.
  const current_console_instance = globalThis.console || {};

  // A comprehensive list of standard console methods.
  const standard_console_methods = [
    "log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
    "trace", "group", "groupCollapsed", "groupEnd", "time", "timeEnd",
    "clear", "count", "table", "profile", "profileEnd", "timeStamp", "memory" // Added more methods.
  ];

  // A no-operation function to use as a stub.
  const no_operation_function = function () {};

  // Iterate through standard methods and stub any that are missing.
  for (let i = 0; i < standard_console_methods.length; i++) {
    const method_name = standard_console_methods[i];
    if (typeof current_console_instance[method_name] !== 'function') {
      current_console_instance[method_name] = no_operation_function;
    }
  }
  return current_console_instance;
}

/**
 * Converts a standard JavaScript array into an OCaml-style array.
 * OCaml arrays are typically represented with a leading header element (often 0).
 * @param {Array} js_array - The JavaScript array to convert.
 * @returns {Array} The new OCaml-style array.
 */
function convert_js_to_ocaml_array(js_array) {
  // Create a new array, starting with the OCaml block header (0).
  const ocaml_array_wrapper = [0];
  // Concatenate the elements from the original JS array to the wrapper.
  return ocaml_array_wrapper.concat(js_array);
}

/**
 * Creates an OCaml-style array (vector) of a specified logical length,
 * initialized with a given value. Includes the OCaml header.
 * @param {number} array_length - The desired logical length of the array (excluding header).
 * @param {*} initial_element - The value to fill the array with.
 * @returns {Array} The newly created OCaml-style array.
 * @throws If `array_length` is negative.
 */
function create_ocaml_vector (array_length, initial_element) {
  if (array_length < 0) {
    signal_invalid_argument("Vector length cannot be negative");
  }
  // Allocate array for logical length + 1 for the OCaml header.
  const vector_container = new Array(array_length + 1);
  vector_container[0] = 0; // OCaml block header.
  // Fill the elements from index 1 up to `array_length`.
  for (let i = 1; i <= array_length; i++) {
    vector_container[i] = initial_element;
  }
  return vector_container;
}

/**
 * Retrieves the list of currently open output channels (stub function).
 * In this context, it typically represents an empty list (OCaml `0`).
 * @returns {number} Always 0.
 */
function get_output_channel_list () {
  // In a real OCaml runtime, this might return a list of channel descriptors.
  // Here, it's a stub, returning 0 to signify an empty list.
  return 0;
}

/**
 * Performs multiplication of two 32-bit integers, emulating OCaml's fixed-width
 * integer arithmetic behavior. This handles potential overflows by truncating
 * the result to a 32-bit signed integer.
 * @param {number} factor_x - First integer factor.
 * @param {number} factor_y - Second integer factor.
 * @returns {number} The 32-bit signed integer product.
 */
function perform_ocaml_int_multiplication(factor_x, factor_y) {
  // This technique splits one factor into 16-bit parts, multiplies, and recombines.
  // The final `| 0` bitwise operation ensures the result is a 32-bit signed integer.
  const high_part_of_x = factor_x >> 16; // Extract the upper 16 bits of x.
  const low_part_of_x = factor_x & 0xFFFF; // Extract the lower 16 bits of x.

  // Multiply parts and combine. The `<< 16` on the first term helps shift it
  // into the correct position, and the final `| 0` handles overall truncation.
  return (((high_part_of_x * factor_y) << 16) + (low_part_of_x * factor_y)) | 0;
}

/**
 * Registers a global value in the `runtime_global_elements` array.
 * The provided `index_key` is adjusted by +1 to account for the reserved index 0.
 * @param {number} index_key - The logical numeric index for the global value.
 * @param {*} value_to_store - The value to associate with the index.
 */
function register_runtime_global (index_key, value_to_store) {
  runtime_global_elements[index_key + 1] = value_to_store;
}

// A registry for named OCaml values, accessible by string keys (e.g., for modules).
const named_ocaml_value_registry = {};

/**
 * Registers a named value in the global registry.
 * This allows OCaml modules or values to be accessed by a symbolic name.
 * @param {string} name_key - The string name for the value.
 * @param {*} value_to_register - The value to register.
 * @returns {number} Always 0 (OCaml convention).
 */
function register_named_ocaml_value(name_key, value_to_register) {
  named_ocaml_value_registry[name_key] = value_to_register;
  return 0;
}

/**
 * Main application logic, encapsulated in an Immediately Invoked Function Expression (IIFE).
 * This block simulates the top-level execution of an OCaml program.
 */
(function () {
  /**
   * Helper function for OCaml-style function application, supporting currying.
   * This is a simplified wrapper for `execute_ocaml_function` when only one argument is applied.
   * @param {Function} fn_ref - The function to apply.
   * @param {*} arg_val - The argument to pass.
   * @returns {*} The result of the application.
   */
  function apply_ocaml_func_wrapper(fn_ref, arg_val) {
    return (fn_ref.length === 1) ? fn_ref(arg_val) : execute_ocaml_function(fn_ref, [arg_val]);
  }

  // --- Global Exception Definitions and Registrations ---
  const failure_exception_data = [0, new OpalText("Failure")];
  const invalid_arg_exception_data = [0, new OpalText("Invalid_argument")];

  // Register common OCaml exceptions into the global runtime elements array.
  // Note: Indices are `key + 1` due to the `runtime_global_elements[0]` convention.
  register_runtime_global(6, [0, new OpalText("Not_found")]);       // Access via runtime_global_elements[7]
  register_runtime_global(5, [0, new OpalText("Division_by_zero")]); // Access via runtime_global_elements[6]
  register_runtime_global(3, invalid_arg_exception_data);          // Access via runtime_global_elements[4]
  register_runtime_global(2, failure_exception_data);              // Access via runtime_global_elements[3]

  // --- Application-Specific String Literals and Constants ---
  const decimal_format_string = new OpalText("%d");
  const exit_handler_name = new OpalText("Pervasives.do_at_exit");
  const empty_list_marker = [0, 0, 0]; // Represents an empty OCaml list (often `[]` or `None`).
  const split_operation_name = new OpalText("split_n");
  const no_game_output_message = new OpalText("NO GAME");
  const get_input_operation_name = new OpalText("get_input");
  const whitespace_regex_pattern = new OpalText("\\s");

  /**
   * Helper function for finding the maximum of two values using OCaml comparison logic.
   * @param {*} val1 - First value.
   * @param {*} val2 - Second value.
   * @returns {*} The greater of the two values.
   */
  function find_maximum_value(val1, val2) {
    return check_greater_or_equal(val1, val2) ? val1 : val2;
  }

  /**
   * Function to execute registered exit handlers.
   * This mimics OCaml's `Pervasives.do_at_exit` behavior, iterating through a list of channels.
   * @returns {number} Always 0 (OCaml convention).
   */
  function run_exit_routines() {
    let current_channel_list = get_output_channel_list(); // `0` typically means empty list.
    while (current_channel_list) { // Loop while there are channels in the list.
      const next_channel_node = get_ocaml_array_element(current_channel_list, 1); // Get the tail of the list.
      try {
        // Original code had an empty try-catch block here, implying no specific action
        // for this type of channel, or errors are silently ignored.
      } catch (err) {
        // Log or handle error if necessary, but original implies silent ignore.
      }
      current_channel_list = next_channel_node; // Move to the next channel.
    }
    return 0;
  }
  // Register the exit handler function by its named key.
  register_named_ocaml_value(exit_handler_name, run_exit_routines);

  /**
   * Reverses an OCaml-style list (represented as `[0, head, tail]`).
   * This is an iterative process, building a new list in reverse.
   * @param {Array|number} input_list - The OCaml list to reverse (0 for empty list).
   * @returns {Array|number} The reversed OCaml list.
   */
  function reverse_ocaml_list(input_list) {
    let current_list_segment = input_list;
    let reversed_list_accumulator = 0; // Initialize with OCaml's empty list marker (0).
    while (current_list_segment) {
      const head_element = get_ocaml_array_element(current_list_segment, 0);
      // Prepend the head element to the accumulator.
      reversed_list_accumulator = [0, head_element, reversed_list_accumulator];
      current_list_segment = get_ocaml_array_element(current_list_segment, 1); // Move to the tail.
    }
    return reversed_list_accumulator;
  }

  /**
   * Maps a transformation function over each element of an OCaml-style list.
   * @param {Function} transformation_func - The function to apply to each element.
   * @param {Array|number} input_list_to_map - The OCaml list.
   * @returns {Array|number} A new OCaml list with transformed elements.
   */
  function map_list_elements(transformation_func, input_list_to_map) {
    if (!input_list_to_map) {
      return 0; // If input list is empty, return an empty list.
    }
    const tail_list = get_ocaml_array_element(input_list_to_map, 1);
    const head_element = get_ocaml_array_element(input_list_to_map, 0);

    // Recursively apply transformation to the head and map the tail.
    const transformed_head = apply_ocaml_func_wrapper(transformation_func, head_element);
    const transformed_tail = map_list_elements(transformation_func, tail_list);

    return [0, transformed_head, transformed_tail]; // Construct a new list node.
  }

  // --- Global Configuration and Type Information ---
  const global_runtime_configuration = [0, 0]; // Placeholder for global configuration.
  const regex_object_constructor = RegExp;
  const standard_javascript_array_type = Array;

  /**
   * An identity transformation function. Returns its input unchanged.
   * @param {*} value - Any value.
   * @returns {*} The same value.
   */
  function identity_transform(value) {
    return value;
  }

  /**
   * Wraps a non-array value into an `OpalEncapsulatedText` if it's not an array.
   * If it's an array, it returns `0` (OCaml's `None` for option types).
   * @param {*} value_to_wrap - The value to potentially wrap.
   * @returns {Array|number} `[0, OpalEncapsulatedText]` or `0`.
   */
  function wrap_non_array_value(value_to_wrap) {
    if (value_to_wrap instanceof standard_javascript_array_type) {
      return 0; // Returns 0, analogous to OCaml's 'None' for array inputs.
    }
    return [0, new OpalEncapsulatedText(value_to_wrap.toString())]; // Wraps in 'Some' with OpalEncapsulatedText.
  }
  // Register this converter into global_runtime_configuration.
  global_runtime_configuration[1] = [0, wrap_non_array_value, global_runtime_configuration[1]];

  const console_interface_instance = acquire_browser_console_interface(); // Get the console interface.

  /**
   * Helper for function application where arguments are swapped.
   * This is a curried application `func(arg2)(arg1)`.
   * @param {Function} func_to_apply - The function.
   * @param {*} arg1 - The first argument.
   * @param {*} arg2 - The second argument.
   * @returns {*} The result of the function call.
   */
  function apply_swapped_args(func_to_apply, arg1, arg2) {
    // Apply the function with arg2 first, then apply the resulting (potentially curried)
    // function with arg1.
    return apply_ocaml_func_wrapper(execute_ocaml_function(func_to_apply, [arg2]), arg1);
  }

  /**
   * Converts any given value to its string representation using `toString()`.
   * @param {*} value_obj - The object to convert.
   * @returns {string} The string representation.
   */
  function convert_to_string_repr(value_obj) {
    return value_obj.toString();
  }

  /**
   * Logs a value to the console using the `log` method.
   * @param {*} value_to_log - The value to log.
   * @returns {*} The result of the console log operation.
   */
  function output_to_console_log(value_to_log) {
    return console_interface_instance.log(convert_to_string_repr(value_to_log));
  }

  /**
   * Swaps two elements in an OCaml-style array at specified indices.
   * @param {Array} target_arr - The OCaml-style array.
   * @param {number} index_a - The logical index of the first element.
   * @param {number} index_b - The logical index of the second element.
   * @returns {number} Always 0 (OCaml convention).
   */
  function swap_array_elements(target_arr, index_a, index_b) {
    const temporary_value = get_ocaml_array_element(target_arr, index_a);
    set_ocaml_array_element(target_arr, index_a, get_ocaml_array_element(target_arr, index_b));
    return set_ocaml_array_element(target_arr, index_b, temporary_value);
  }

  /**
   * Splits an OCaml list into a head segment of `count_n` elements and a remaining tail list.
   * @param {number} count_n - The number of elements to take for the head segment.
   * @param {Array|number} source_list - The original OCaml list.
   * @returns {Array} `[0, head_segment_list, remaining_tail_list]`.
   * @throws If the list has fewer than `count_n` elements.
   */
  function split_ocaml_list_at_n(count_n, source_list) {
    if (!source_list) {
      if (count_n === 0) {
        return [0, 0, 0]; // If count is 0 and list is empty, return empty head and tail.
      }
      throw [0, invalid_arg_exception_data, split_operation_name]; // Error if list is too short.
    }
    if (count_n <= 0) {
      return [0, 0, source_list]; // No elements to take, return empty head and original list as tail.
    }

    const head_element = get_ocaml_array_element(source_list, 0);
    const tail_list = get_ocaml_array_element(source_list, 1);

    // Recursively split the tail, then reconstruct the head segment.
    const recursive_split_result = split_ocaml_list_at_n(count_n - 1, tail_list);
    const new_head_segment = [0, head_element, recursive_split_result[1]]; // Prepend current head.
    const remaining_tail = recursive_split_result[2];

    return [0, new_head_segment, remaining_tail];
  }

  /**
   * Wrapper function to parse an `OpalText` string to an integer.
   * @param {OpalText} string_obj - The string object.
   * @returns {number} The parsed integer.
   */
  function parse_string_to_int_wrapper(string_obj) {
    return parse_string_to_integer(string_obj);
  }

  /**
   * Calculates the running product of a segment of an OCaml-style array.
   * This multiplies elements from `start_offset` for `segment_length` elements.
   * @param {number} segment_length - The number of elements in the segment.
   * @param {number} start_offset - The starting logical index in the source array.
   * @param {Array} source_array - The OCaml-style array.
   * @returns {number} The product of the elements in the segment.
   */
  function calculate_running_product(segment_length, start_offset, source_array) {
    let current_running_product = 1;
    const end_index_inclusive = segment_length - 1;

    if (end_index_inclusive < 0) { // If segment length is 0, the product is 1.
      return 1;
    }

    for (let current_idx = 0; current_idx <= end_index_inclusive; current_idx++) {
      const array_element = get_ocaml_array_element(source_array, start_offset + current_idx);
      current_running_product = perform_ocaml_int_multiplication(current_running_product, array_element);
    }
    return current_running_product;
  }

  /**
   * Updates an element in a binary heap structure (represented as an OCaml array)
   * and re-establishes the heap property by propagating changes upwards.
   * This assumes a max-heap property where parents are greater than children.
   * @param {Array} heap_array - The OCaml-style array representing the heap.
   * @param {number} element_index - The logical index of the element to update.
   * @param {number} new_value - The new value for the element.
   * @returns {number} Always 0 (OCaml convention).
   */
  function update_heap_element(heap_array, element_index, new_value) {
    // Calculate the offset for the root of the heap within the array structure.
    // The original code uses (ai.length-1+1|0)/2|0; caml_array_set(ai,(ak+aj|0)-1|0,al);
    // This is `(total_array_length / 2) - 1` if `ak` is 0, which means the array is 1-indexed for the heap,
    // and the data starts at index `(total_array_length / 2)`
    // Re-evaluating original: `aj=(ai.length-1+1|0)/2|0; caml_array_set(ai,(ak+aj|0)-1|0,al);`
    // `ai.length-1` is effective length. `+1` makes it `effective_length+1`. `|0)/2|0` is `Math.floor(length/2)`.
    // This `aj` is a `heap_root_offset`.
    // `(ak+aj|0)-1|0` is the actual index. `ak` is `element_index`.
    const heap_root_offset = Math.floor((heap_array.length - 1 + 1) / 2);
    set_ocaml_array_element(heap_array, (element_index + heap_root_offset) - 1, new_value);

    let current_position_in_heap = (element_index + heap_root_offset) - 1;
    while (current_position_in_heap > 0) {
      const parent_position = Math.floor((current_position_in_heap - 1) / 2);
      const left_child_value = get_ocaml_array_element(heap_array, (2 * parent_position) + 1);
      const right_child_value = get_ocaml_array_element(heap_array, (2 * parent_position) + 2);
      // Update the parent with the maximum value of its children (for a max-heap).
      set_ocaml_array_element(heap_array, parent_position, find_maximum_value(left_child_value, right_child_value));
      current_position_in_heap = parent_position;
    }
    return 0;
  }

  /**
   * Retrieves the root element (maximum value in a max-heap) of a heap structure.
   * @param {Array} heap_structure - The OCaml-style array representing the heap.
   * @returns {*} The root element.
   */
  function get_heap_root_value(heap_structure) {
    return get_ocaml_array_element(heap_structure, 0); // Root is typically at logical index 0.
  }

  // --- Main Application Execution Flow ---

  // Read input from standard input using Node.js 'fs' module.
  const raw_input_data_from_stdin = require("fs").readFileSync("/dev/stdin", "utf8");

  // Process the raw input data through a chain of transformations:
  // 1. Split by whitespace.
  // 2. Identity transform (no-op).
  // 3. Convert to OCaml-style array.
  // 4. Reverse the OCaml list.
  // 5. Convert each string element to an `OpalEncapsulatedText` object.
  const processed_input_list = apply_swapped_args(
    apply_swapped_args(
      apply_swapped_args(
        apply_swapped_args(
          // Step 1: Split raw string by whitespace.
          raw_input_data_from_stdin.split(new regex_object_constructor(convert_to_string_repr(whitespace_regex_pattern))),
          identity_transform // Step 2: Identity transformation.
        ),
        convert_js_to_ocaml_array // Step 3: Convert to OCaml array.
      ),
      reverse_ocaml_list // Step 4: Reverse the list.
    ),
    function (str_val) { return new OpalEncapsulatedText(str_val); } // Step 5: Wrap strings.
  );

  let current_input_segment_for_processing = processed_input_list;
  let has_processed_any_game_data = false; // Flag to track if any game input was valid.

  // Main processing loop for game rounds based on input lines.
  while (current_input_segment_for_processing) {
    const next_segment_tail = get_ocaml_array_element(current_input_segment_for_processing, 1);
    if (!next_segment_tail) {
      // If no next segment, it means we've consumed all input or encountered an incomplete line.
      break; // Exit the loop.
    }

    const first_value_string = get_ocaml_array_element(current_input_segment_for_processing, 0);
    const second_value_string = get_ocaml_array_element(next_segment_tail, 0);

    const first_integer_value = parse_string_to_int_wrapper(first_value_string);
    const second_integer_value = parse_string_to_int_wrapper(second_value_string);

    // Check for the termination condition: "0 0".
    if (first_integer_value === 0 && second_integer_value === 0) {
      if (!has_processed_any_game_data) {
        output_to_console_log(no_game_output_message);
      }
      return; // Terminate application gracefully.
    }

    let current_game_state_details; // Data structure to hold game parameters.
    const split_result_for_game_params = split_ocaml_list_at_n(first_integer_value, get_ocaml_array_element(next_segment_tail, 1));
    const head_list_of_integer_strings = split_result_for_game_params[1];
    const remaining_input_for_next_round = split_result_for_game_params[2];

    // Map the string elements in the head list to actual integers.
    const initial_values_as_integers_list = map_list_elements(parse_string_to_int_wrapper, head_list_of_integer_strings);

    // Construct the game state object.
    current_game_state_details = [0, [0, first_integer_value, second_integer_value, initial_values_as_integers_list, remaining_input_for_next_round]];

    if (current_game_state_details) {
      has_processed_any_game_data = true; // Mark that we've processed valid game input.

      const game_parameters = get_ocaml_array_element(current_game_state_details, 0);
      const K_parameter = get_ocaml_array_element(game_parameters, 1); // Original aJ[2]
      const L_parameter = get_ocaml_array_element(game_parameters, 0); // Original aJ[1]
      const initial_value_list_from_params = get_ocaml_array_element(game_parameters, 2); // Original aJ[3]

      let initial_array_representation;
      if (initial_value_list_from_params) {
        let list_element_count = 0;
        let list_traversal_node = initial_value_list_from_params;
        let placeholder_initial_val = 0;

        // First pass: count elements and get a placeholder initial value.
        while (list_traversal_node) {
          placeholder_initial_val = get_ocaml_array_element(list_traversal_node, 0);
          list_element_count++;
          list_traversal_node = get_ocaml_array_element(list_traversal_node, 1);
        }

        // Create an OCaml-style array with the determined size.
        initial_array_representation = create_ocaml_vector(list_element_count, placeholder_initial_val);

        let array_filling_index = 0;
        let list_source_for_filling = initial_value_list_from_params;
        // Second pass: fill the created array with list elements.
        while (list_source_for_filling) {
          const element_to_copy = get_ocaml_array_element(list_source_for_filling, 0);
          set_ocaml_array_element(initial_array_representation, array_filling_index, element_to_copy);
          array_filling_index++;
          list_source_for_filling = get_ocaml_array_element(list_source_for_filling, 1);
        }
      } else {
        initial_array_representation = [0]; // Represent an empty OCaml array.
      }

      // Create a 'product_sum' array (original `aZ`), storing products of K-length segments.
      const product_array_logical_length = (initial_array_representation.length - 1 - K_parameter) + 1;
      const segment_product_array = create_ocaml_vector(product_array_logical_length, 0);

      // Populate the `segment_product_array`.
      for (let segment_idx = 0; segment_idx < product_array_logical_length; segment_idx++) {
        set_ocaml_array_element(segment_product_array, segment_idx,
                                 calculate_running_product(K_parameter, segment_idx, initial_array_representation));
      }

      // Create a 'heap' data structure (original `a5`), which will store max products.
      const heap_structure_size = (2 * product_array_logical_length) - 1;
      const max_product_heap = create_ocaml_vector(heap_structure_size, 0);

      // Initialize the heap with values from the `segment_product_array`.
      for (let heap_init_idx = 0; heap_init_idx < product_array_logical_length; heap_init_idx++) {
        update_heap_element(max_product_heap, heap_init_idx, get_ocaml_array_element(segment_product_array, heap_init_idx));
      }

      const initial_max_product_from_heap = get_heap_root_value(max_product_heap);
      let overall_maximum_product_seen = -1; // Initialize with a small value.

      // Main game loop, iterating `L_parameter` times.
      for (let current_iteration = 0; current_iteration < L_parameter; current_iteration++) {
        // Update the overall maximum product with the current max from the heap.
        overall_maximum_product_seen = find_maximum_value(overall_maximum_product_seen, get_heap_root_value(max_product_heap));

        // The index of the first element to modify in the current iteration.
        const first_modification_index = current_iteration;

        // Inner loop for modifying elements further down the array.
        const inner_loop_start_index = current_iteration + 1;
        const inner_loop_end_index = L_parameter - 1;

        if (inner_loop_start_index <= inner_loop_end_index) {
          for (let second_modification_index = inner_loop_start_index; second_modification_index <= inner_loop_end_index; second_modification_index++) {
            // Swap elements in `initial_array_representation` to explore different permutations.
            swap_array_elements(initial_array_representation, first_modification_index, second_modification_index);

            // A closure to recompute segment products and update the heap for affected indices.
            const recompute_and_update_heap_closure = function (heap_ref, temp_tracking_list_ref, k_val_ref, source_arr_ref) {
              return function (affected_array_index) {
                // Determine the range of segment products that are affected by the change at `affected_array_index`.
                const effective_segment_start = find_maximum_value(0, affected_array_index - k_val_ref + 1);
                const max_possible_segment_idx = source_arr_ref.length - 1 - k_val_ref;
                const actual_segment_end = check_less_or_equal(max_possible_segment_idx, affected_array_index) ? max_possible_segment_idx : affected_array_index;

                if (!(actual_segment_end < effective_segment_start)) {
                  for (let update_segment_idx = effective_segment_start; update_segment_idx <= actual_segment_end; update_segment_idx++) {
                    const new_segment_product = calculate_running_product(k_val_ref, update_segment_idx, source_arr_ref);
                    // Store the update in `temp_tracking_list_ref` and update the heap.
                    temp_tracking_list_ref[1] = [0, [0, update_segment_idx, new_segment_product], temp_tracking_list_ref[1]];
                    update_heap_element(heap_ref, update_segment_idx, new_segment_product);
                  }
                }
                return 0;
              };
            }(max_product_heap, [0,0], K_parameter, initial_array_representation); // Pass `[0,0]` as a mutable ref cell for `temp_tracking_list_ref`.

            recompute_and_update_heap_closure(first_modification_index);
            recompute_and_update_heap_closure(second_modification_index);

            // After temporary modifications, get the new max from the heap.
            const current_heap_max_after_temp_mods = get_heap_root_value(max_product_heap);
            let temporary_updates_list = [0,0][1]; // Access the list stored in the ref cell.

            // Revert heap updates that were temporary for this sub-iteration.
            while (temporary_updates_list) {
              const [_, update_idx, original_val] = get_ocaml_array_element(temporary_updates_list, 0); // Destructure [0, index, value]
              update_heap_element(max_product_heap, update_idx, original_val); // Restore original value.
              temporary_updates_list = get_ocaml_array_element(temporary_updates_list, 1);
            }

            // Swap back elements to restore the array for the next inner iteration.
            swap_array_elements(initial_array_representation, first_modification_index, second_modification_index);

            // Update `overall_maximum_product_seen` with the maximum observed during this permutation.
            overall_maximum_product_seen = find_maximum_value(overall_maximum_product_seen, current_heap_max_after_temp_mods);
          }
        }
      }

      // Final output based on the calculated maximum product.
      if (overall_maximum_product_seen < initial_max_product_from_heap) {
        output_to_console_log(no_game_output_message);
      } else {
        const final_difference_result = overall_maximum_product_seen - initial_max_product_from_heap;
        output_to_console_log(format_integer_to_string(decimal_format_string, final_difference_result));
      }

      // Move to the remaining input segment for the next game round.
      current_input_segment_for_processing = get_ocaml_array_element(game_parameters, 3);
    } else {
      // This branch should theoretically not be reached if `0 0` is handled earlier.
      // If `current_game_state_details` is null, it means there was an issue in parsing
      // or an unexpected termination without the explicit `0 0` signal.
      // For robustness, ensure `current_input_segment_for_processing` advances or loop breaks.
      // (Original code had `var bz=aJ[4],aB=bz;continue;` which advances the input pointer).
      // Here, it would be `current_input_segment_for_processing = remaining_input_for_next_round;`
      // But since the `0 0` case causes a `return`, this else block is unreachable.
    }
  }

  // Execute any registered exit routines after the main processing loop.
  run_exit_routines();
  return; // Explicit return from the IIFE.

  // This `throw` statement is typically unreachable in normal execution
  // if the input processing completes or `0 0` is encountered.
  // It signifies a failure to "get_input" if execution reaches here.
  throw [0, failure_exception_data, get_input_operation_name];
})();