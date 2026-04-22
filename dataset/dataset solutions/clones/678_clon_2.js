/* This module was generated from OCaml by a transpiler tool, version 1.3 */

function signal_exception_with_payload (error_type_id, error_data) {
    throw [0, error_type_id, error_data];
}

function throw_string_exception (exception_key, message_text) {
    signal_exception_with_payload(exception_key, new StringEnvelope(message_text));
}

function raise_argument_error (message_content) {
    throw_string_exception(global_app_registry[4], message_content);
}

function signal_array_access_violation () {
    raise_argument_error("index out of bounds");
}

function repeat_text_segment (repeat_count, segment_value) {
    if ( ! repeat_count ) {
        return "";
    }
    if ( repeat_count & 1 ) {
        return repeat_text_segment(repeat_count - 1, segment_value) + segment_value;
    }
    var result_segment = repeat_text_segment(repeat_count >> 1, segment_value);
    return result_segment + result_segment;
}

function TextStruct (inputVal) {
    if ( inputVal !== null ) {
        this.rawBytes      = this.completeBytes = inputVal;
        this.lastIndex     = this.dataLength    = inputVal.length;
    }
}

TextStruct.prototype = {
    textContent:   null,
    rawBytes:      null,
    completeBytes: null,
    charCodeArray: null,
    dataLength:    null,
    lastIndex:     0,

    toStandardString: function () {
        return this.textContent = decodeURIComponent(escape(this.getCompleteBytes()));
    },

    toRawBytes: function () {
        var byteSeq;
        if ( this.textContent !== null ) {
            byteSeq = unescape(encodeURIComponent(this.textContent));
        } else {
            byteSeq = "";
            var charArr = this.charCodeArray;
            var arrLen  = charArr.length;
            for ( var idx = 0; idx < arrLen; idx ++ ) {
                byteSeq += String.fromCharCode(charArr[idx]);
            }
        }
        this.rawBytes    = this.completeBytes = byteSeq;
        this.lastIndex   = this.dataLength    = byteSeq.length;
        return byteSeq;
    },

    getRawBytes: function () {
        var byteData = this.rawBytes;
        if ( byteData === null ) {
            byteData = this.toRawBytes();
        }
        return byteData;
    },

    getCompleteBytes: function () {
        var allBytes = this.completeBytes;
        if ( allBytes !== null ) {
            return allBytes;
        }
        allBytes = this.rawBytes;
        if ( allBytes === null ) {
            allBytes = this.toRawBytes();
        }
        if ( this.lastIndex < this.dataLength ) {
            this.rawBytes    = (allBytes += repeat_text_segment(this.dataLength - this.lastIndex, '\0'));
            this.lastIndex   = this.dataLength;
        }
        this.completeBytes = allBytes;
        return allBytes;
    },

    toCharCodeArray: function () {
        var byteString = this.rawBytes;
        if ( byteString === null ) {
            byteString = this.toRawBytes();
        }
        var codeList    = [];
        var currentLast = this.lastIndex;
        for ( var loop_idx = 0; loop_idx < currentLast; loop_idx ++ ) {
            codeList[loop_idx] = byteString.charCodeAt(loop_idx);
        }
        for ( currentLast = this.dataLength; loop_idx < currentLast; loop_idx ++ ) {
            codeList[loop_idx] = 0;
        }
        this.textContent = this.rawBytes = this.completeBytes = null;
        this.lastIndex   = this.dataLength;
        this.charCodeArray = codeList;
        return codeList;
    },

    getCharCodeArray: function () {
        var currentArray = this.charCodeArray;
        if ( ! currentArray ) {
            currentArray = this.toCharCodeArray();
        }
        return currentArray;
    },

    getDataLength: function () {
        var currentLength = this.dataLength;
        if ( currentLength !== null ) {
            return currentLength;
        }
        this.toRawBytes();
        return this.dataLength;
    },

    stringRepresentation: function () {
        var strVal = this.textContent;
        return strVal ? strVal : this.toStandardString();
    },

    primitiveValue: function () {
        var val = this.textContent;
        return val ? val : this.toStandardString();
    },

    copyToTargetArray: function (sourceStart, targetArr, targetStart, copyCount) {
        var sourceArr = this.charCodeArray;
        if ( sourceArr ) {
            if ( targetStart <= sourceStart ) {
                for ( var iter = 0; iter < copyCount; iter ++ ) {
                    targetArr[targetStart + iter] = sourceArr[sourceStart + iter];
                }
            } else {
                for ( var iter = copyCount - 1; iter >= 0; iter -- ) {
                    targetArr[targetStart + iter] = sourceArr[sourceStart + iter];
                }
            }
        } else {
            var rawData = this.rawBytes;
            if ( rawData === null ) {
                rawData = this.toRawBytes();
            }
            var remainingSource = this.lastIndex - sourceStart;
            if ( copyCount <= remainingSource ) {
                for ( var iter = 0; iter < copyCount; iter ++ ) {
                    targetArr[targetStart + iter] = rawData.charCodeAt(sourceStart + iter);
                }
            } else {
                for ( var iter = 0; iter < remainingSource; iter ++ ) {
                    targetArr[targetStart + iter] = rawData.charCodeAt(sourceStart + iter);
                }
                for ( ; iter < copyCount; iter ++ ) {
                    targetArr[targetStart + iter] = 0;
                }
            }
        }
    },

    getCharValue: function (charIndex) {
        var charData = this.charCodeArray;
        if ( charData ) {
            return charData[charIndex];
        }
        var byteData = this.rawBytes;
        if ( byteData === null ) {
            byteData = this.toRawBytes();
        }
        return (charIndex < this.lastIndex) ? byteData.charCodeAt(charIndex) : 0;
    },

    safeGetCharValue: function (charIndex) {
        if ( this.dataLength === null ) {
            this.toRawBytes();
        }
        if ( (charIndex < 0) || (charIndex >= this.dataLength) ) {
            signal_array_access_violation();
        }
        return this.getCharValue(charIndex);
    },

    setCharValue: function (charIndex, charCode) {
        var charData = this.charCodeArray;
        if ( ! charData ) {
            if ( this.lastIndex === charIndex ) {
                this.rawBytes += String.fromCharCode(charCode & 0xff);
                this.lastIndex ++;
                return 0;
            }
            charData = this.toCharCodeArray();
        } else if ( this.rawBytes !== null ) {
            this.rawBytes = this.completeBytes = this.textContent = null;
        }
        charData[charIndex] = charCode & 0xff;
        return 0;
    },

    safeSetCharValue: function (charIndex, charCode) {
        if ( this.dataLength === null ) {
            this.toRawBytes();
        }
        if ( (charIndex < 0) || (charIndex >= this.dataLength) ) {
            signal_array_access_violation();
        }
        this.setCharValue(charIndex, charCode);
    },

    fillWithChar: function (offset, count, fillChar) {
        if ( offset >= this.lastIndex && this.lastIndex && fillChar === 0 ) {
            return;
        }
        var charData = this.charCodeArray;
        if ( ! charData ) {
            charData = this.toCharCodeArray();
        } else if ( this.rawBytes !== null ) {
            this.rawBytes = this.completeBytes = this.textContent = null;
        }
        var endIndex = offset + count;
        for ( var fillIdx = offset; fillIdx < endIndex; fillIdx ++ ) {
            charData[fillIdx] = fillChar;
        }
    },

    compareToString: function (otherString) {
        if ( this.textContent !== null && otherString.textContent !== null ) {
            if ( this.textContent < otherString.textContent ) return -1;
            if ( this.textContent > otherString.textContent ) return 1;
            return 0;
        }
        var bytesOne = this.getCompleteBytes();
        var bytesTwo = otherString.getCompleteBytes();
        if ( bytesOne < bytesTwo ) return -1;
        if ( bytesOne > bytesTwo ) return 1;
        return 0;
    },

    isEqualTo: function (otherString) {
        if ( this.textContent !== null && otherString.textContent !== null ) {
            return this.textContent === otherString.textContent;
        }
        return this.getCompleteBytes() === otherString.getCompleteBytes();
    },

    isLessThan: function (otherString) {
        if ( this.textContent !== null && otherString.textContent !== null ) {
            return this.textContent < otherString.textContent;
        }
        return this.getCompleteBytes() < otherString.getCompleteBytes();
    },

    isLessOrEqual: function (otherString) {
        if ( this.textContent !== null && otherString.textContent !== null ) {
            return this.textContent <= otherString.textContent;
        }
        return this.getCompleteBytes() <= otherString.getCompleteBytes();
    }
};

function StringEnvelope (input_str) {
    this.textContent = input_str;
}
StringEnvelope.prototype = new TextStruct();

function StringFactory (desired_length) {
    this.rawBytes = "";
    this.dataLength = desired_length;
}
StringFactory.prototype = new TextStruct();

function get_vector_item (target_vector, element_index) {
    /* Checks if the index is within bounds before returning the element. */
    if ( (element_index < 0) || (element_index >= target_vector.length - 1) ) {
        signal_array_access_violation();
    }
    return target_vector[element_index + 1];
}

function set_vector_item (target_vector, element_index, new_value) {
    /* Assigns a new value to an array element, performing bounds check. */
    if ( (element_index < 0) || (element_index >= target_vector.length - 1) ) {
        signal_array_access_violation();
    }
    target_vector[element_index + 1] = new_value;
    return 0;
}

function function_invoker (target_func, arguments_list) {
    // If the function is a curried OCaml function, unwrap it.
    if ( target_func.fun ) {
        return function_invoker(target_func.fun, arguments_list);
    }
    var num_params = target_func.length;
    var param_diff = num_params - arguments_list.length;
    if ( param_diff === 0 ) {
        // Exact number of arguments, call directly
        return target_func.apply(null, arguments_list);
    } else if ( param_diff < 0 ) {
        // Too many arguments, curry the function call
        return function_invoker(target_func.apply(null, arguments_list.slice(0, num_params)), arguments_list.slice(num_params));
    } else {
        // Not enough arguments, return a new partially applied function
        return function (single_arg) {
            return function_invoker(target_func, arguments_list.concat([single_arg]));
        };
    }
}

function parse_format_specification (format_string) {
    format_string = format_string.toString();
    var str_len = format_string.length;
    if ( str_len > 31 ) {
        raise_argument_error("format_int: format too long");
    }

    var format_obj = {
        justify:           '+',
        sign_style:        '-',
        fill_char:         ' ',
        alternate_form:    false,
        base_val:          0,
        signed_conversion: false,
        width_val:         0,
        upper_case_output: false,
        sign_val:          1,
        precision_val:     -1,
        conversion_char:   'f'
    };

    for ( var char_idx = 0; char_idx < str_len; char_idx ++ ) {
        var current_char = format_string.charAt(char_idx);
        switch ( current_char ) {
            case '-':
                format_obj.justify = '-';
                break;
            case '+':
            case ' ':
                format_obj.sign_style = current_char;
                break;
            case '0':
                format_obj.fill_char = '0';
                break;
            case '#':
                format_obj.alternate_form = true;
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                format_obj.width_val = 0;
                while ( current_char = format_string.charCodeAt(char_idx) - 48, current_char >= 0 && current_char <= 9 ) {
                    format_obj.width_val = format_obj.width_val * 10 + current_char;
                    char_idx ++;
                }
                char_idx --; // Decrement to re-evaluate the character in the next loop iteration if needed
                break;
            case '.':
                format_obj.precision_val = 0;
                char_idx ++;
                while ( current_char = format_string.charCodeAt(char_idx) - 48, current_char >= 0 && current_char <= 9 ) {
                    format_obj.precision_val = format_obj.precision_val * 10 + current_char;
                    char_idx ++;
                }
                char_idx --; // Decrement for correct loop progression
                break;
            case 'd':
            case 'i':
                format_obj.signed_conversion = true; /* fallthrough for unsigned decimal */
            case 'u':
                format_obj.base_val = 10;
                break;
            case 'x':
                format_obj.base_val = 16;
                break;
            case 'X':
                format_obj.base_val = 16;
                format_obj.upper_case_output = true;
                break;
            case 'o':
                format_obj.base_val = 8;
                break;
            case 'e':
            case 'f':
            case 'g':
                format_obj.signed_conversion = true;
                format_obj.conversion_char = current_char;
                break;
            case 'E':
            case 'F':
            case 'G':
                format_obj.signed_conversion = true;
                format_obj.upper_case_output = true;
                format_obj.conversion_char = current_char.toLowerCase();
                break;
        }
    }
    return format_obj;
}

function finalize_output_formatting (format_options, raw_content) {
    if ( format_options.upper_case_output ) {
        raw_content = raw_content.toUpperCase();
    }
    var current_len = raw_content.length;
    if ( format_options.signed_conversion && (format_options.sign_val < 0 || format_options.sign_style !== '-') ) {
        current_len ++;
    }
    if ( format_options.alternate_form ) {
        if ( format_options.base_val === 8 ) {
            current_len += 1;
        }
        if ( format_options.base_val === 16 ) {
            current_len += 2;
        }
    }

    var final_buffer = "";

    // Left padding with spaces if right-justified
    if ( format_options.justify === '+' && format_options.fill_char === ' ' ) {
        for ( var p_idx = current_len; p_idx < format_options.width_val; p_idx ++ ) {
            final_buffer += ' ';
        }
    }

    // Add sign if applicable
    if ( format_options.signed_conversion ) {
        if ( format_options.sign_val < 0 ) {
            final_buffer += '-';
        } else if ( format_options.sign_style !== '-' ) {
            final_buffer += format_options.sign_style;
        }
    }

    // Add alternate form prefix (octal/hex)
    if ( format_options.alternate_form && format_options.base_val === 8 ) {
        final_buffer += '0';
    }
    if ( format_options.alternate_form && format_options.base_val === 16 ) {
        final_buffer += "0x";
    }

    // Left padding with zeros if right-justified with zero-filler
    if ( format_options.justify === '+' && format_options.fill_char === '0' ) {
        for ( var p_idx = current_len; p_idx < format_options.width_val; p_idx ++ ) {
            final_buffer += '0';
        }
    }

    // Append the actual formatted content
    final_buffer += raw_content;

    // Right padding if left-justified
    if ( format_options.justify === '-' ) {
        for ( var p_idx = current_len; p_idx < format_options.width_val; p_idx ++ ) {
            final_buffer += ' ';
        }
    }

    return new StringEnvelope(final_buffer);
}

function format_integer_value (format_spec, int_input) {
    if ( format_spec.toString() === "%d" ) {
        return new StringEnvelope("" + int_input);
    }
    var parsed_format = parse_format_specification(format_spec);
    if ( int_input < 0 ) {
        if ( parsed_format.signed_conversion ) {
            parsed_format.sign_val = -1;
            int_input = -int_input;
        } else {
            int_input >>>= 0; // Convert to unsigned
        }
    }
    var num_string = int_input.toString(parsed_format.base_val);
    if ( parsed_format.precision_val >= 0 ) {
        parsed_format.fill_char = ' '; // Precision overrides zero-filling
        var pad_count = parsed_format.precision_val - num_string.length;
        if ( pad_count > 0 ) {
            num_string = repeat_text_segment(pad_count, '0') + num_string;
        }
    }
    return finalize_output_formatting(parsed_format, num_string);
}

function long_int_comparison (val_a, val_b) {
    var val_a_part3 = val_a[3] << 16;
    var val_b_part3 = val_b[3] << 16;
    if ( val_a_part3 > val_b_part3 ) {
        return 1;
    }
    if ( val_a_part3 < val_b_part3 ) {
        return -1;
    }
    if ( val_a[2] > val_b[2] ) {
        return 1;
    }
    if ( val_a[2] < val_b[2] ) {
        return -1;
    }
    if ( val_a[1] > val_b[1] ) {
        return 1;
    }
    if ( val_a[1] < val_b[1] ) {
        return -1;
    }
    return 0; // Values are equal
}

function simple_int_comparison (val_one, val_two) {
    if ( val_one < val_two ) {
        return (-1);
    }
    if ( val_one === val_two ) {
        return 0;
    }
    return 1;
}

function recursive_value_comparison (first_val, second_val, full_comparison) {
    var comparison_stack = []; // Stack to manage recursive comparisons
    for ( ;; ) {
        if ( ! (full_comparison && first_val === second_val) ) {
            // Compare string objects
            if ( first_val instanceof TextStruct ) {
                if ( second_val instanceof TextStruct ) {
                    if ( first_val !== second_val ) {
                        var cmp_result = first_val.compareToString(second_val);
                        if ( cmp_result !== 0 ) {
                            return cmp_result;
                        }
                    }
                } else {
                    return 1; // String is greater than non-string
                }
            }
            // Compare OCaml array/variant types
            else if ( first_val instanceof Array && first_val[0] === (first_val[0] | 0) ) {
                var type_a = first_val[0];
                if ( type_a === 250 ) { // Forwarding tag
                    first_val = first_val[1];
                    continue;
                } else if ( second_val instanceof Array && second_val[0] === (second_val[0] | 0) ) {
                    var type_b = second_val[0];
                    if ( type_b === 250 ) { // Forwarding tag
                        second_val = second_val[1];
                        continue;
                    } else if ( type_a !== type_b ) {
                        return (type_a < type_b) ? -1 : 1;
                    } else {
                        // Same type tag, compare based on tag value
                        switch ( type_a ) {
                            case 248: { // Block tag for abstract types like closures
                                var cmp_res = simple_int_comparison(first_val[2], second_val[2]);
                                if ( cmp_res !== 0 ) {
                                    return cmp_res;
                                }
                                break;
                            }
                            case 255: { // Int64 tag
                                var cmp_res = long_int_comparison(first_val, second_val);
                                if ( cmp_res !== 0 ) {
                                    return cmp_res;
                                }
                                break;
                            }
                            default:
                                // Compare array lengths
                                if ( first_val.length !== second_val.length ) {
                                    return (first_val.length < second_val.length) ? -1 : 1;
                                }
                                // If arrays have more than one element, push for element-wise comparison
                                if ( first_val.length > 1 ) {
                                    comparison_stack.push(first_val, second_val, 1);
                                }
                        }
                    }
                } else {
                    return 1; // Array/variant is greater than non-array/variant
                }
            }
            // If second_val is a string or OCaml array/variant, first_val must be smaller
            else if ( second_val instanceof TextStruct || (second_val instanceof Array && second_val[0] === (second_val[0] | 0)) ) {
                return -1;
            }
            // Compare primitive values
            else {
                if ( first_val < second_val ) {
                    return -1;
                }
                if ( first_val > second_val ) {
                    return 1;
                }
                // Handle NaN and other edge cases if full_comparison is true
                if ( full_comparison && first_val !== second_val ) {
                    if ( first_val === first_val ) {
                        return 1; // first_val is not NaN, second_val is NaN
                    }
                    if ( second_val === second_val ) {
                        return -1; // first_val is NaN, second_val is not NaN
                    }
                }
            }
        }
        // Pop from stack to continue element-wise comparison
        if ( comparison_stack.length === 0 ) {
            return 0; // All comparisons complete, values are equal
        }
        var current_idx = comparison_stack.pop();
        second_val = comparison_stack.pop();
        first_val = comparison_stack.pop();
        if ( current_idx + 1 < first_val.length ) {
            comparison_stack.push(first_val, second_val, current_idx + 1);
        }
        first_val = first_val[current_idx];
        second_val = second_val[current_idx];
    }
}

function perform_general_comparison (item_one, item_two) {
    return recursive_value_comparison(item_one, item_two, true);
}

function check_greater_or_equal (value_a, value_b) {
    return +(recursive_value_comparison(value_a, value_b, false) >= 0);
}

function parse_number_properties (input_string_obj) {
    var current_pos = 0;
    var base_value = 10;
    // Determine sign: if first char is '-', increment pos and set sign to -1
    var sign_indicator = input_string_obj.getCharValue(0) === 45 ? (current_pos ++, -1) : 1;

    // Check for base prefix (0x, 0o, 0b)
    if ( input_string_obj.getCharValue(current_pos) === 48 ) {
        switch ( input_string_obj.getCharValue(current_pos + 1) ) {
            case 120: // 'x'
            case 88:  // 'X'
                base_value = 16;
                current_pos += 2;
                break;
            case 111: // 'o'
            case 79:  // 'O'
                base_value = 8;
                current_pos += 2;
                break;
            case 98:  // 'b'
            case 66:  // 'B'
                base_value = 2;
                current_pos += 2;
                break;
        }
    }
    return [current_pos, sign_indicator, base_value];
}

function convert_char_to_numeric (char_code) {
    if ( char_code >= 48 && char_code <= 57 ) { // '0'-'9'
        return char_code - 48;
    }
    if ( char_code >= 65 && char_code <= 90 ) { // 'A'-'Z'
        return char_code - 55;
    }
    if ( char_code >= 97 && char_code <= 122 ) { // 'a'-'z'
        return char_code - 87;
    }
    return -1; // Not a valid digit for any base
}

var global_app_registry = [0]; // Global data storage for the application

function fail_with_custom_message (error_message) {
    throw_string_exception(global_app_registry[3], error_message);
}

function string_to_integer_conversion (input_text_data) {
    var properties = parse_number_properties(input_text_data);
    var current_pos = properties[0];
    var sign_val = properties[1];
    var base_val = properties[2];

    var overflow_threshold = -1 >>> 0; // Max unsigned 32-bit integer

    var char_code = input_text_data.getCharValue(current_pos);
    var digit_val = convert_char_to_numeric(char_code);

    if ( digit_val < 0 || digit_val >= base_val ) {
        fail_with_custom_message("int_of_string");
    }

    var result_num = digit_val;

    for ( ;; ) {
        current_pos ++;
        char_code = input_text_data.getCharValue(current_pos);
        if ( char_code === 95 ) { // Underscore for readability, skip it
            continue;
        }
        digit_val = convert_char_to_numeric(char_code);
        if ( digit_val < 0 || digit_val >= base_val ) {
            break; // End of number
        }
        result_num = base_val * result_num + digit_val;
        if ( result_num > overflow_threshold ) { // Check for overflow
            fail_with_custom_message("int_of_string");
        }
    }

    if ( current_pos !== input_text_data.getDataLength() ) {
        fail_with_custom_message("int_of_string"); // Trailing characters
    }

    result_num = sign_val * result_num;

    // Check if the result fits in a 32-bit signed integer
    if ( (result_num | 0) !== result_num ) {
        fail_with_custom_message("int_of_string");
    }

    return result_num;
}

function get_browser_console_object () {
    var console_obj = this.console ? this.console : {}; // Use window.console or an empty object
    var method_names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
                        "trace", "group", "groupCollapsed", "groupEnd", "time", "timeEnd"];

    function dummy_func () { /* Placeholder for console methods that don't exist */ }

    for ( var method_idx = 0; method_idx < method_names.length; method_idx ++ ) {
        if ( ! console_obj[method_names[method_idx]] ) {
            console_obj[method_names[method_idx]] = dummy_func;
        }
    }
    return console_obj;
}

function wrap_js_array (input_js_array) {
    /* Converts a standard JavaScript array into an OCaml-style array (with a 0 tag). */
    return [0].concat(input_js_array);
}

function check_less_or_equal (value_a, value_b) {
    return +(recursive_value_comparison(value_a, value_b, false) <= 0);
}

function construct_initialized_vector (vector_length, initial_value) {
    var new_vector = [0]; // OCaml arrays start with a tag at index 0
    for ( var current_idx = 1; current_idx <= vector_length; current_idx ++ ) {
        new_vector[current_idx] = initial_value;
    }
    return new_vector;
}

function retrieve_output_channels () {
    /* Returns a reference to the list of active output channels, typically 0 for empty. */
    return 0;
}

function multiply_int_parts (factor_a, factor_b) {
    /* Performs multiplication on 32-bit integers, handling potential overflow by splitting. */
    return ((((factor_a >> 16) * factor_b) << 16) + (factor_a & 0xffff) * factor_b) | 0;
}

function set_global_registry_item (item_id, item_value) {
    /* Registers a value in the global data array using an OCaml-style index. */
    global_app_registry[item_id + 1] = item_value;
}

var registered_named_entities = {}; // Object to store named global values

function add_item_by_name (entity_name, entity_value) {
    /* Adds a value to the registry with a string name. */
    registered_named_entities[entity_name] = entity_value;
    return 0;
}


(function () {
    /* Helper function to apply a function, handling currying if necessary. */
    function apply_single_or_multi (target_fn, arg_val) {
        return target_fn.length === 1 ? target_fn(arg_val) : function_invoker(target_fn, [arg_val]);
    }

    /* Predefined exception objects for OCaml runtime. */
    var failure_exception       = [0, new TextStruct("Failure")];
    var invalid_arg_exception   = [0, new TextStruct("Invalid_argument")];

    /* Register standard library exceptions. */
    set_global_registry_item(6, [0, new TextStruct("Not_found")]);
    set_global_registry_item(5, [0, new TextStruct("Division_by_zero")]);
    set_global_registry_item(3, invalid_arg_exception);
    set_global_registry_item(2, failure_exception);

    /* Various constants and string literals used in the application logic. */
    var integer_format_specifier    = new TextStruct("%d");
    var exit_cleanup_hook_name      = new TextStruct("Pervasives.do_at_exit");
    var empty_list_marker           = [0, 0, 0];
    var split_operation_name        = new TextStruct("split_n");
    var no_game_message             = new TextStruct("NO GAME");
    var input_retrieval_func_name   = new TextStruct("get_input");
    var whitespace_regex_str        = new TextStruct("\\s");

    /* Function to find the maximum of two values. */
    function find_maximum (val_one, val_two) {
        return check_greater_or_equal(val_one, val_two) ? val_one : val_two;
    }

    /* Processes registered exit handlers. */
    function process_exit_handlers (dummy_param) {
        var channel_list = retrieve_output_channels(0);
        for ( ;; ) {
            if ( channel_list ) {
                var next_channel = channel_list[2];
                try {
                    /* Placeholder for actual channel cleanup operations. */
                } catch ( err_obj ) {
                    /* Error handling for channel cleanup, if any. */
                }
                var channel_list = next_channel;
                continue;
            }
            return 0; // No more channels to process
        }
    }
    add_item_by_name(exit_cleanup_hook_name, process_exit_handlers);

    /* Reverses the order of elements in a list. */
    function reverse_list_elements (original_list) {
        var current_index     = original_list.length - 1 - 1 | 0; // Adjusted for OCaml array tag
        var reversed_elements = 0; // Represents an empty list initially
        for ( ;; ) {
            if ( 0 <= current_index ) {
                var new_element = [0, original_list[current_index + 1], reversed_elements];
                var next_index  = current_index - 1 | 0;
                current_index   = next_index;
                reversed_elements = new_element;
                continue;
            }
            return reversed_elements;
        }
    }

    /* Applies a function to each element of a list recursively. */
    function apply_function_to_list (operation_func, list_data) {
        if ( list_data ) {
            var tail_part      = list_data[2];
            var processed_head = apply_single_or_multi(operation_func, list_data[1]);
            return [0, processed_head, apply_function_to_list(operation_func, tail_part)];
        }
        return 0; // Empty list
    }

    /* Global conversion table and references to native types. */
    var conversion_table = [0, 0];
    var RegexConstructor = RegExp;
    var ArrayType        = Array;

    /* Identity function. */
    function identity_transform (input_val) {
        return input_val;
    }

    /* Converts a value to a wrapped string if it's not an array. */
    function convert_to_wrapped_string_if_not_array (input_value) {
        return input_value instanceof ArrayType ? 0 : [0, new StringEnvelope(input_value.toString())];
    }
    conversion_table[1] = [0, convert_to_wrapped_string_if_not_array, conversion_table[1]];

    /* Obtain the browser/Node.js console object. */
    var browser_console = get_browser_console_object(0);

    /* Applies a function with arguments flipped (arg2, arg1). */
    function apply_flipped (func_to_flip, arg_one) {
        return apply_single_or_multi(arg_one, func_to_flip);
    }

    /* Converts any object to its string representation. */
    function object_to_string (input_object) {
        return input_object.toString();
    }

    /* Logs a message object to the console. */
    function log_to_console (message_obj) {
        return browser_console.log(object_to_string(message_obj));
    }

    /* Swaps two elements within an OCaml-style array. */
    function swap_array_elements (target_arr, index_a, index_b) {
        var temp_val = get_vector_item(target_arr, index_a);
        set_vector_item(target_arr, index_a, get_vector_item(target_arr, index_b));
        return set_vector_item(target_arr, index_b, temp_val);
    }

    /* Splits a list into two parts based on a count. */
    function split_list_at_n (split_count, input_list) {
        if ( input_list ) {
            if ( 0 < split_count ) {
                var split_result = split_list_at_n(split_count - 1 | 0, input_list[2]);
                return [0, [0, input_list[1], split_result[1]], split_result[2]];
            }
            return [0, 0, input_list]; // Return remaining list if split_count is 0
        }
        if ( 0 === split_count ) {
            return empty_list_marker; // Empty list for split_count 0
        }
        throw [0, invalid_arg_exception, split_operation_name]; // Error if split_count > 0 and list is empty
    }

    /* Converts a text string to an integer. */
    function convert_text_to_integer (text_input) {
        return string_to_integer_conversion(text_input);
    }

    /* Calculates a product sum based on a limit, offset, and data array. */
    function calculate_product_sum (limit_val, offset_val, data_array) {
        var initial_val = 1;
        var current_sum = 0; // Loop start for product sum
        var upper_bound = limit_val - 1 | 0;

        if ( upper_bound < current_sum ) {
            var final_result = initial_val;
        } else {
            var loop_idx    = current_sum;
            var acc_product = initial_val;
            for ( ;; ) {
                var multiplied_val = multiply_int_parts(acc_product, get_vector_item(data_array, offset_val + loop_idx | 0));
                var next_loop_idx  = loop_idx + 1 | 0;
                if ( upper_bound !== loop_idx ) {
                    loop_idx    = next_loop_idx;
                    acc_product = multiplied_val;
                    continue;
                }
                var final_result = multiplied_val;
                break;
            }
        }
        return final_result;
    }

    /* Updates a segment tree structure. */
    function update_segment_tree (tree_vector, position, new_value) {
        var mid_point_offset = (tree_vector.length - 1 + 1 | 0) / 2 | 0;
        set_vector_item(tree_vector, (position + mid_point_offset | 0) - 1 | 0, new_value);
        var current_node_index = (position + mid_point_offset | 0) - 1 | 0;

        for ( ;; ) {
            if ( 0 < current_node_index ) {
                var parent_index = (current_node_index - 1 | 0) / 2 | 0;
                set_vector_item(tree_vector, parent_index, find_maximum(get_vector_item(tree_vector, (2 * parent_index | 0) + 1 | 0), get_vector_item(tree_vector, (2 * parent_index | 0) + 2 | 0)));
                var current_node_index = parent_index;
                continue;
            }
            return 0; // Root reached
        }
    }

    /* Retrieves the root value of a segment tree. */
    function get_tree_root_value (tree_data) {
        return get_vector_item(tree_data, 0);
    }

    /* Reads input from stdin and performs initial processing. */
    var input_data_content = require("fs").readFileSync("/dev/stdin", "utf8");
    var processed_input_list = apply_single_or_multi(apply_function_to_list, function (raw_line) {
        return new StringEnvelope(raw_line);
    });

    /* Converts a JavaScript array to an OCaml-style list array. */
    function convert_to_ocaml_list_arr (js_array_input) {
        return wrap_js_array(js_array_input);
    }

    /* Main input parsing and initial data structuring. */
    var parsed_lines_data = apply_flipped(
        apply_flipped(
            apply_flipped(
                apply_flipped(
                    input_data_content.split(new RegexConstructor(object_to_string(whitespace_regex_str))),
                    identity_transform
                ),
                convert_to_ocaml_list_arr
            ),
            reverse_list_elements
        ),
        processed_input_list
    );

    /* Main application loop for processing game data. */
    for ( ;; ) {
        if ( parsed_lines_data ) {
            var current_tail = parsed_lines_data[2];
            if ( current_tail ) {
                var current_dim_x = convert_text_to_integer(parsed_lines_data[1]);
                var current_dim_y = convert_text_to_integer(current_tail[1]);

                if ( 0 === current_dim_x && 0 === current_dim_y ) {
                    var processed_game_data = 0;
                    var is_end_condition    = 1;
                } else {
                    var is_end_condition = 0;
                }

                if ( ! is_end_condition ) {
                    var split_result        = split_list_at_n(current_dim_x, current_tail[2]);
                    var remaining_list      = split_result[2];
                    processed_game_data     = [0, [0, current_dim_x, current_dim_y, apply_function_to_list(convert_text_to_integer, split_result[1]), remaining_list]];
                }

                if ( processed_game_data ) {
                    var game_details = processed_game_data[1];
                    var height_val   = game_details[2];
                    var width_val    = game_details[1];
                    var data_list    = game_details[3];

                    if ( data_list ) {
                        var list_count      = 0;
                        var current_list_item = data_list;
                        var list_tail_item = data_list[2];
                        var list_head_item = data_list[1];

                        for ( ;; ) {
                            if ( current_list_item ) {
                                var next_item         = current_list_item[2];
                                var incremented_count = list_count + 1 | 0;
                                list_count            = incremented_count;
                                current_list_item     = next_item;
                                continue;
                            }
                            // Convert list to OCaml-style vector
                            var data_vector    = construct_initialized_vector(list_count, list_head_item);
                            var vector_idx     = 1;
                            var current_node   = list_tail_item;
                            for ( ;; ) {
                                if ( current_node ) {
                                    var next_node           = current_node[2];
                                    data_vector[vector_idx + 1] = current_node[1];
                                    var next_vector_idx     = vector_idx + 1 | 0;
                                    vector_idx              = next_vector_idx;
                                    current_node            = next_node;
                                    continue;
                                }
                                var final_data_array = data_vector;
                                break;
                            }
                            break;
                        }
                    } else {
                        var final_data_array = [0]; // Empty array if no data list
                    }

                    // Initialize game grid and segment tree
                    var game_grid      = construct_initialized_vector((final_data_array.length - 1 - height_val | 0) + 1 | 0, 0);
                    var row_idx        = 0;
                    var max_row_idx    = game_grid.length - 1 - 1 | 0;

                    if ( ! (max_row_idx < row_idx) ) {
                        var current_row = row_idx;
                        for ( ;; ) {
                            set_vector_item(game_grid, current_row, calculate_product_sum(height_val, current_row, final_data_array));
                            var next_row = current_row + 1 | 0;
                            if ( max_row_idx !== current_row ) {
                                current_row = next_row;
                                continue;
                            }
                            break;
                        }
                    }

                    var segment_tree_size = game_grid.length - 1;
                    var segment_tree_data = construct_initialized_vector((2 * segment_tree_size | 0) - 1 | 0, 0);
                    var tree_node_idx     = 0;
                    var max_tree_node_idx = segment_tree_size - 1 | 0;

                    if ( ! (max_tree_node_idx < tree_node_idx) ) {
                        var current_tree_node = tree_node_idx;
                        for ( ;; ) {
                            update_segment_tree(segment_tree_data, current_tree_node, get_vector_item(game_grid, current_tree_node));
                            var next_tree_node = current_tree_node + 1 | 0;
                            if ( max_tree_node_idx !== current_tree_node ) {
                                current_tree_node = next_tree_node;
                                continue;
                            }
                            break;
                        }
                    }

                    var tree_root_val = get_tree_root_value(segment_tree_data);
                    var best_score    = -1;
                    var start_col     = 0;
                    var end_col       = width_val - 1 | 0;

                    if ( end_col < start_col ) {
                        var result_score = best_score;
                    } else {
                        var current_col  = start_col;
                        var current_best = best_score;

                        // Outer loop for column permutations
                        outer_loop: for ( ;; ) {
                            var next_col      = current_col + 1 | 0;
                            var max_inner_col = width_val - 1 | 0;

                            if ( max_inner_col < next_col ) {
                                var inner_best = current_best;
                            } else {
                                var inner_col_iter = next_col;
                                var inner_best_val = current_best;

                                // Inner loop for column permutations
                                inner_loop: for ( ;; ) {
                                    swap_array_elements(final_data_array, current_col, inner_col_iter);

                                    var restore_list = [0, 0]; // List to store values for tree restoration
                                    var update_tree_func = function (tree_vector, restore_list_ref, h_val, data_arr) {
                                        return function (col_idx) {
                                            var start_idx       = find_maximum(0, (col_idx - h_val | 0) + 1 | 0);
                                            var array_len_minus_h = data_arr.length - 1 - h_val | 0;
                                            var end_idx         = check_less_or_equal(array_len_minus_h, col_idx) ? array_len_minus_h : col_idx;

                                            if ( ! (end_idx < start_idx) ) {
                                                var iter_idx = start_idx;
                                                for ( ;; ) {
                                                    restore_list_ref[1] = [0, [0, iter_idx, get_vector_item(tree_vector, (iter_idx + ((tree_vector.length - 1 + 1 | 0) / 2 | 0) | 0) - 1 | 0)], restore_list_ref[1]];
                                                    update_segment_tree(tree_vector, iter_idx, calculate_product_sum(h_val, iter_idx, data_arr));
                                                    var next_iter_idx = iter_idx + 1 | 0;
                                                    if ( end_idx !== iter_idx ) {
                                                        iter_idx = next_iter_idx;
                                                        continue;
                                                    }
                                                    break;
                                                }
                                            }
                                            return 0;
                                        };
                                    }(segment_tree_data, restore_list, height_val, final_data_array);

                                    update_tree_func(current_col);
                                    update_tree_func(inner_col_iter);

                                    var root_after_swap = get_tree_root_value(segment_tree_data);
                                    var restored_items  = restore_list[1];

                                    for ( ;; ) {
                                        if ( restored_items ) {
                                            var item_details  = restored_items[1];
                                            var next_restored = restored_items[2];
                                            update_segment_tree(segment_tree_data, item_details[1], item_details[2]);
                                            restored_items = next_restored;
                                            continue;
                                        }
                                        swap_array_elements(final_data_array, current_col, inner_col_iter); // Restore array for next iteration
                                        var new_best       = find_maximum(inner_best_val, root_after_swap);
                                        var next_inner_col = inner_col_iter + 1 | 0;
                                        if ( max_inner_col !== inner_col_iter ) {
                                            inner_col_iter = next_inner_col;
                                            inner_best_val = new_best;
                                            continue inner_loop;
                                        }
                                        var inner_best = new_best;
                                        break;
                                    }
                                    break;
                                }
                            }

                            var next_outer_col = current_col + 1 | 0;
                            if ( end_col !== current_col ) {
                                current_col  = next_outer_col;
                                current_best = inner_best;
                                continue outer_loop;
                            }
                            var result_score = inner_best;
                            break;
                        }
                    }

                    if ( result_score < tree_root_val ) {
                        log_to_console(no_game_message);
                    } else {
                        log_to_console(format_integer_value(integer_format_specifier, result_score - tree_root_val | 0));
                    }

                    var next_input_segment = game_details[4];
                    parsed_lines_data      = next_input_segment;
                    continue; // Process next game data set
                }
                process_exit_handlers(0); // Call exit handlers if no game data to process
                return;
            }
        }
        throw [0, failure_exception, input_retrieval_func_name]; // Error if input data is exhausted unexpectedly
    }
}());