// This module contains utility functions adapted from a functional language compilation.
function runtime_throw_with_data(issue_type, payload) {
    throw [0, issue_type, payload];
}


function runtime_throw_with_text(issue_type, message_content) {
    runtime_throw_with_data(issue_type, new TextWrapper(message_content));
}


function runtime_invalid_input(message_content) {
    runtime_throw_with_text(global_system_registry[4], message_content);
}


function runtime_array_out_of_bounds() {
    runtime_invalid_input("index out of range");
}


function string_duplicator(count_val, char_sequence) {
    if (!count_val) {
        return "";
    }
    if (count_val & 1) {
        return string_duplicator(count_val - 1, char_sequence) + char_sequence;
    }
    var result_part = string_duplicator(count_val >> 1, char_sequence);
    return result_part + result_part;
}


function StringObject(input_value) {
    if (input_value !== null) {
        this._byte_storage = this._complete_byte_storage = input_value;
        this._last_idx = this._data_length = input_value.length;
    }
}

StringObject.prototype = {
    _text_representation: null,
    _byte_storage: null,
    _complete_byte_storage: null,
    _char_array: null,
    _data_length: null,
    _last_idx: 0,

    to_js_text: function () {
        return this._text_representation = decodeURIComponent(escape(this.get_complete_bytes()));
    },

    to_byte_sequence: function () {
        if (this._text_representation !== null) {
            var byte_buffer = unescape(encodeURIComponent(this._text_representation));
        } else {
            var byte_buffer = "",
                char_list = this._char_array,
                list_len = char_list.length;
            for (var idx_counter = 0; idx_counter < list_len; idx_counter++)
                byte_buffer += String.fromCharCode(char_list[idx_counter]);
        }
        this._byte_storage = this._complete_byte_storage = byte_buffer;
        this._last_idx = this._data_length = byte_buffer.length;
        return byte_buffer;
    },

    get_byte_data: function () {
        var byte_buffer = this._byte_storage;
        if (byte_buffer === null) byte_buffer = this.to_byte_sequence();
        return byte_buffer;
    },

    get_complete_bytes: function () {
        var byte_buffer = this._complete_byte_storage;
        if (byte_buffer !== null) return byte_buffer;
        byte_buffer = this._byte_storage;
        if (byte_buffer === null) byte_buffer = this.to_byte_sequence();
        if (this._last_idx < this._data_length) {
            this._byte_storage = (byte_buffer += string_duplicator(this._data_length - this._last_idx, '\0'));
            this._last_idx = this._data_length;
        }
        this._complete_byte_storage = byte_buffer;
        return byte_buffer;
    },

    to_char_list: function () {
        var byte_buffer = this._byte_storage;
        if (byte_buffer === null) byte_buffer = this.to_byte_sequence();
        var char_list = [],
            list_len = this._last_idx;
        for (var idx_counter = 0; idx_counter < list_len; idx_counter++) char_list[idx_counter] = byte_buffer.charCodeAt(idx_counter);
        for (list_len = this._data_length; idx_counter < list_len; idx_counter++) char_list[idx_counter] = 0;
        this._text_representation = this._byte_storage = this._complete_byte_storage = null;
        this._last_idx = this._data_length;
        this._char_array = char_list;
        return char_list;
    },

    get_char_data: function () {
        var char_list = this._char_array;
        if (!char_list) char_list = this.to_char_list();
        return char_list;
    },

    get_data_len: function () {
        var current_length = this._data_length;
        if (current_length !== null) return current_length;
        this.to_byte_sequence();
        return this._data_length;
    },

    to_string_repr: function () {
        var text_value = this._text_representation;
        return text_value ? text_value : this.to_js_text();
    },

    value_of_obj: function () {
        var text_value = this._text_representation;
        return text_value ? text_value : this.to_js_text();
    },

    copy_to_array_segment: function (src_start, dest_array, dest_start, copy_len) {
        var source_array = this._char_array;
        if (source_array) {
            if (dest_start <= src_start) {
                for (var idx_counter = 0; idx_counter < copy_len; idx_counter++) dest_array[dest_start + idx_counter] = source_array[src_start + idx_counter];
            } else {
                for (var idx_counter = copy_len - 1; idx_counter >= 0; idx_counter--) dest_array[dest_start + idx_counter] = source_array[src_start + idx_counter];
            }
        } else {
            var byte_buffer = this._byte_storage;
            if (byte_buffer === null) byte_buffer = this.to_byte_sequence();
            var remaining_src_len = this._last_idx - src_start;
            if (copy_len <= remaining_src_len)
                for (var idx_counter = 0; idx_counter < copy_len; idx_counter++) dest_array[dest_start + idx_counter] = byte_buffer.charCodeAt(src_start + idx_counter);
            else {
                for (var idx_counter = 0; idx_counter < remaining_src_len; idx_counter++) dest_array[dest_start + idx_counter] = byte_buffer.charCodeAt(src_start + idx_counter);
                for (; idx_counter < copy_len; idx_counter++) dest_array[dest_start + idx_counter] = 0;
            }
        }
    },

    get_char_at_idx: function (idx_counter) {
        var char_list = this._char_array;
        if (char_list) return char_list[idx_counter];
        var byte_buffer = this._byte_storage;
        if (byte_buffer === null) byte_buffer = this.to_byte_sequence();
        return (idx_counter < this._last_idx) ? byte_buffer.charCodeAt(idx_counter) : 0;
    },

    safe_get_char_at_idx: function (idx_counter) {
        if (!this._data_length) this.to_byte_sequence();
        if ((idx_counter < 0) || (idx_counter >= this._data_length)) runtime_array_out_of_bounds();
        return this.get_char_at_idx(idx_counter);
    },

    set_char_at_idx: function (idx_counter, char_code_val) {
        var char_list = this._char_array;
        if (!char_list) {
            if (this._last_idx === idx_counter) {
                this._byte_storage += String.fromCharCode(char_code_val & 0xff);
                this._last_idx++;
                return 0;
            }
            char_list = this.to_char_list();
        } else if (this._byte_storage !== null) {
            this._byte_storage = this._complete_byte_storage = this._text_representation = null;
        }
        char_list[idx_counter] = char_code_val & 0xff;
        return 0;
    },

    safe_set_char_at_idx: function (idx_counter, char_code_val) {
        if (this._data_length === null) this.to_byte_sequence();
        if ((idx_counter < 0) || (idx_counter >= this._data_length)) runtime_array_out_of_bounds();
        this.set_char_at_idx(idx_counter, char_code_val);
    },

    fill_segment: function (offset_pos, segment_len, fill_char_code) {
        if (offset_pos >= this._last_idx && this._last_idx && fill_char_code === 0) return;
        var char_list = this._char_array;
        if (!char_list) char_list = this.to_char_list();
        else if (this._byte_storage !== null) {
            this._byte_storage = this._complete_byte_storage = this._text_representation = null;
        }
        var end_pos = offset_pos + segment_len;
        for (var idx_counter = offset_pos; idx_counter < end_pos; idx_counter++) char_list[idx_counter] = fill_char_code;
    },

    compare_strings: function (other_string_obj) {
        if (this._text_representation !== null && other_string_obj._text_representation !== null) {
            if (this._text_representation < other_string_obj._text_representation) return -1;
            if (this._text_representation > other_string_obj._text_representation) return 1;
            return 0;
        }
        var first_bytes = this.get_complete_bytes();
        var second_bytes = other_string_obj.get_complete_bytes();
        if (first_bytes < second_bytes) return -1;
        if (first_bytes > second_bytes) return 1;
        return 0;
    },

    are_equal_strings: function (other_string_obj) {
        if (this._text_representation !== null && other_string_obj._text_representation !== null)
            return this._text_representation === other_string_obj._text_representation;
        return this.get_complete_bytes() === other_string_obj.get_complete_bytes();
    },

    is_less_than: function (other_string_obj) {
        if (this._text_representation !== null && other_string_obj._text_representation !== null)
            return this._text_representation < other_string_obj._text_representation;
        return this.get_complete_bytes() < other_string_obj.get_complete_bytes();
    },

    is_less_or_equal: function (other_string_obj) {
        if (this._text_representation !== null && other_string_obj._text_representation !== null)
            return this._text_representation <= other_string_obj._text_representation;
        return this.get_complete_bytes() <= other_string_obj.get_complete_bytes();
    }
};


function TextWrapper(initial_string) {
    this._text_representation = initial_string;
}
TextWrapper.prototype = new StringObject();


function StringCreator(initial_length) {
    this._byte_storage = "";
    this._data_length = initial_length;
}
StringCreator.prototype = new StringObject();


function vector_access_element(data_vector, element_index) {
    if ((element_index < 0) || (element_index >= data_vector.length - 1)) runtime_array_out_of_bounds();
    return data_vector[element_index + 1];
}


function vector_assign_element(data_vector, element_index, new_value) {
    if ((element_index < 0) || (element_index >= data_vector.length - 1)) runtime_array_out_of_bounds();
    data_vector[element_index + 1] = new_value;
    return 0;
}


function generic_function_caller(target_func, input_arguments) {
    if (target_func.fun)
        return generic_function_caller(target_func.fun, input_arguments);
    var func_arity = target_func.length;
    var diff_args = func_arity - input_arguments.length;
    if (diff_args === 0)
        return target_func.apply(null, input_arguments);
    else if (diff_args < 0)
        return generic_function_caller(target_func.apply(null, input_arguments.slice(0, func_arity)), input_arguments.slice(func_arity));
    else
        return function (additional_arg) {
            return generic_function_caller(target_func, input_arguments.concat([additional_arg]));
        };
}


function format_spec_parser(format_string) {
    format_string = format_string.to_string_repr();
    var string_len = format_string.length;
    if (string_len > 31) runtime_invalid_input("format_integer: specifier too long");
    var format_object = {
        alignment_type: '+',
        sign_display: '-',
        pad_char: ' ',
        alt_form: false,
        num_base: 0,
        signed_conversion: false,
        field_width: 0,
        upper_case_output: false,
        sign_value: 1,
        precision_val: -1,
        conversion_char: 'f'
    };

    for (var idx_counter = 0; idx_counter < string_len; idx_counter++) {
        var current_char = format_string.charAt(idx_counter);
        switch (current_char) {
            case '-':
                format_object.alignment_type = '-';
                break;
            case '+':
            case ' ':
                format_object.sign_display = current_char;
                break;
            case '0':
                format_object.pad_char = '0';
                break;
            case '#':
                format_object.alt_form = true;
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
                format_object.field_width = 0;
                while (current_char = format_string.charCodeAt(idx_counter) - 48, current_char >= 0 && current_char <= 9) {
                    format_object.field_width = format_object.field_width * 10 + current_char;
                    idx_counter++;
                }
                idx_counter--;
                break;
            case '.':
                format_object.precision_val = 0;
                idx_counter++;
                while (current_char = format_string.charCodeAt(idx_counter) - 48, current_char >= 0 && current_char <= 9) {
                    format_object.precision_val = format_object.precision_val * 10 + current_char;
                    idx_counter++;
                }
                idx_counter--;
                break;
            case 'd':
            case 'i':
                format_object.signed_conversion = true; /* fallthrough */
            case 'u':
                format_object.num_base = 10;
                break;
            case 'x':
                format_object.num_base = 16;
                break;
            case 'X':
                format_object.num_base = 16;
                format_object.upper_case_output = true;
                break;
            case 'o':
                format_object.num_base = 8;
                break;
            case 'e':
            case 'f':
            case 'g':
                format_object.signed_conversion = true;
                format_object.conversion_char = current_char;
                break;
            case 'E':
            case 'F':
            case 'G':
                format_object.signed_conversion = true;
                format_object.upper_case_output = true;
                format_object.conversion_char = current_char.toLowerCase();
                break;
        }
    }
    return format_object;
}


function finalize_formatting_output(format_object, raw_output_buffer) {
    if (format_object.upper_case_output) raw_output_buffer = raw_output_buffer.toUpperCase();
    var output_len = raw_output_buffer.length;
    if (format_object.signed_conversion && (format_object.sign_value < 0 || format_object.sign_display !== '-')) output_len++;
    if (format_object.alt_form) {
        if (format_object.num_base === 8) output_len += 1;
        if (format_object.num_base === 16) output_len += 2;
    }
    var final_output_buffer = "";
    if (format_object.alignment_type === '+' && format_object.pad_char === ' ')
        for (var idx_counter = output_len; idx_counter < format_object.field_width; idx_counter++) final_output_buffer += ' ';
    if (format_object.signed_conversion) {
        if (format_object.sign_value < 0) final_output_buffer += '-';
        else if (format_object.sign_display !== '-') final_output_buffer += format_object.sign_display;
    }
    if (format_object.alt_form && format_object.num_base === 8) final_output_buffer += '0';
    if (format_object.alt_form && format_object.num_base === 16) final_output_buffer += "0x";
    if (format_object.alignment_type === '+' && format_object.pad_char === '0')
        for (var idx_counter = output_len; idx_counter < format_object.field_width; idx_counter++) final_output_buffer += '0';
    final_output_buffer += raw_output_buffer;
    if (format_object.alignment_type === '-')
        for (var idx_counter = output_len; idx_counter < format_object.field_width; idx_counter++) final_output_buffer += ' ';
    return new TextWrapper(final_output_buffer);
}


function format_integer_value(format_string, integer_value) {
    if (format_string.to_string_repr() === "%d") return new TextWrapper("" + integer_value);
    var format_object = format_spec_parser(format_string);
    if (integer_value < 0) {
        if (format_object.signed_conversion) {
            format_object.sign_value = -1;
            integer_value = -integer_value;
        } else integer_value >>>= 0;
    }
    var string_representation = integer_value.toString(format_object.num_base);
    if (format_object.precision_val >= 0) {
        format_object.pad_char = ' ';
        var padding_needed = format_object.precision_val - string_representation.length;
        if (padding_needed > 0) string_representation = string_duplicator(padding_needed, '0') + string_representation;
    }
    return finalize_formatting_output(format_object, string_representation);
}


function compare_long_integers(first_long, second_long) {
    var first_part = first_long[3] << 16;
    var second_part = second_long[3] << 16;
    if (first_part > second_part) return 1;
    if (first_part < second_part) return -1;
    if (first_long[2] > second_long[2]) return 1;
    if (first_long[2] < second_long[2]) return -1;
    if (first_long[1] > second_long[1]) return 1;
    if (first_long[1] < second_long[1]) return -1;
    return 0;
}


function compare_integers(val_a, val_b) {
    if (val_a < val_b) return (-1);
    if (val_a === val_b) return 0;
    return 1;
}


function compare_generic_values(val_a, val_b, total_comparison) {
    var comparison_stack = [];
    for (;;) {
        if (!(total_comparison && val_a === val_b)) {
            if (val_a instanceof StringObject) {
                if (val_b instanceof StringObject) {
                    if (val_a !== val_b) {
                        var comparison_result = val_a.compare_strings(val_b);
                        if (comparison_result !== 0) return comparison_result;
                    }
                } else
                    return 1;
            } else if (val_a instanceof Array && val_a[0] === (val_a[0] | 0)) {
                var type_a = val_a[0];
                if (type_a === 250) {
                    val_a = val_a[1];
                    continue;
                } else if (val_b instanceof Array && val_b[0] === (val_b[0] | 0)) {
                    var type_b = val_b[0];
                    if (type_b === 250) {
                        val_b = val_b[1];
                        continue;
                    } else if (type_a !== type_b) {
                        return (type_a < type_b) ? -1 : 1;
                    } else {
                        switch (type_a) {
                            case 248:
                                {
                                    var comparison_result = compare_integers(val_a[2], val_b[2]);
                                    if (comparison_result !== 0) return comparison_result;
                                    break;
                                }
                            case 255:
                                {
                                    var comparison_result = compare_long_integers(val_a, val_b);
                                    if (comparison_result !== 0) return comparison_result;
                                    break;
                                }
                            default:
                                if (val_a.length !== val_b.length) return (val_a.length < val_b.length) ? -1 : 1;
                                if (val_a.length > 1) comparison_stack.push(val_a, val_b, 1);
                        }
                    }
                } else
                    return 1;
            } else if (val_b instanceof StringObject ||
                (val_b instanceof Array && val_b[0] === (val_b[0] | 0))) {
                return -1;
            } else {
                if (val_a < val_b) return -1;
                if (val_a > val_b) return 1;
                if (total_comparison && val_a !== val_b) {
                    if (val_a === val_a) return 1;
                    if (val_b === val_b) return -1;
                }
            }
        }
        if (comparison_stack.length === 0) return 0;
        var element_index = comparison_stack.pop();
        val_b = comparison_stack.pop();
        val_a = comparison_stack.pop();
        if (element_index + 1 < val_a.length) comparison_stack.push(val_a, val_b, element_index + 1);
        val_a = val_a[element_index];
        val_b = val_b[element_index];
    }
}


function compare_values(val_a, val_b) {
    return compare_generic_values(val_a, val_b, true);
}


function is_greater_or_equal(val_x, val_y) {
    return +(compare_values(val_x, val_y, false) >= 0);
}


function extract_num_props(text_input) {
    var idx_counter = 0,
        num_base = 10,
        sign_val = text_input.get_char_at_idx(0) === 45 ? (idx_counter++, -1) : 1;
    if (text_input.get_char_at_idx(idx_counter) === 48)
        switch (text_input.get_char_at_idx(idx_counter + 1)) {
            case 120:
            case 88:
                num_base = 16;
                idx_counter += 2;
                break;
            case 111:
            case 79:
                num_base = 8;
                idx_counter += 2;
                break;
            case 98:
            case 66:
                num_base = 2;
                idx_counter += 2;
                break;
        }
    return [idx_counter, sign_val, num_base];
}


function parse_digit_char(char_code) {
    if (char_code >= 48 && char_code <= 57) return char_code - 48;
    if (char_code >= 65 && char_code <= 90) return char_code - 55;
    if (char_code >= 97 && char_code <= 122) return char_code - 87;
    return -1;
}


var global_system_registry = [0];


function fail_with_message(message_content) {
    runtime_throw_with_text(global_system_registry[3], message_content);
}


function convert_text_to_int(text_input) {
    var parse_result = extract_num_props(text_input);
    var idx_counter = parse_result[0],
        sign_val = parse_result[1],
        num_base = parse_result[2];
    var max_int_threshold = -1 >>> 0;
    var current_char_code = text_input.get_char_at_idx(idx_counter);
    var digit_val = parse_digit_char(current_char_code);
    if (digit_val < 0 || digit_val >= num_base) fail_with_message("int_of_string_failure");
    var parsed_int_result = digit_val;
    for (;;) {
        idx_counter++;
        current_char_code = text_input.get_char_at_idx(idx_counter);
        if (current_char_code === 95) continue;
        digit_val = parse_digit_char(current_char_code);
        if (digit_val < 0 || digit_val >= num_base) break;
        parsed_int_result = num_base * parsed_int_result + digit_val;
        if (parsed_int_result > max_int_threshold) fail_with_message("int_of_string_failure");
    }
    if (idx_counter !== text_input.get_data_len()) fail_with_message("int_of_string_failure");
    parsed_int_result = sign_val * parsed_int_result;
    if ((parsed_int_result | 0) !== parsed_int_result) fail_with_message("int_of_string_failure");
    return parsed_int_result;
}


function get_browser_console() {
    var console_obj = this.console ? this.console : {};
    var method_names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
        "trace", "group", "groupCollapsed", "groupEnd", "time", "timeEnd"
    ];

    function dummy_func() {}
    for (var idx_counter = 0; idx_counter < method_names.length; idx_counter++)
        if (!console_obj[method_names[idx_counter]]) console_obj[method_names[idx_counter]] = dummy_func;
    return console_obj;
}


function convert_js_to_ocaml_array(input_js_array) {
    return [0].concat(input_js_array);
}


function create_initialized_vector(vec_len, initial_val) {
    var new_vector = [0];
    for (var idx_counter = 1; idx_counter <= vec_len; idx_counter++) new_vector[idx_counter] = initial_val;
    return new_vector;
}


function get_output_channels() {
    return 0;
}


function multiply_int_parts(val_x, val_y) {
    return ((((val_x >> 16) * val_y) << 16) + (val_x & 0xffff) * val_y) | 0;
}


function register_system_item(item_num, item_val) {
    global_system_registry[item_num + 1] = item_val;
}


var registered_symbol_table = {};


function register_symbol_entry(symbol_name, symbol_value) {
    registered_symbol_table[symbol_name] = symbol_value;
    return 0;
}


(function () {
    // Inner module initialization block
    function FunctionExecutor(func_to_execute, func_argument) {
        return func_to_execute.length === 1 ? func_to_execute(func_argument) : generic_function_caller(func_to_execute, [func_argument]);
    }
    var failure_exception = [0, new StringObject("ProgramFailure")],
        invalid_arg_exception = [0, new StringObject("InvalidInput")];
    register_system_item(6, [0, new StringObject("NotFound")]);
    register_system_item(5, [0, new StringObject("DivideByZero")]);
    register_system_item(3, invalid_arg_exception);
    register_system_item(2, failure_exception);
    var decimal_format_spec = new StringObject("%d"),
        exit_handler_name = new StringObject("System.exit_procedures"),
        empty_list_ref = [0, 0, 0],
        split_name_str = new StringObject("split_count"),
        no_game_str = new StringObject("NO GAME FOUND"),
        get_input_str = new StringObject("get_user_input"),
        whitespace_regex_str = new StringObject("\\s");


    function max_value_selector(val_one, val_two) {
        return is_greater_or_equal(val_one, val_two) ? val_one : val_two;
    }


    function list_mapper(source_list, accumulator_list) {
        if (source_list) {
            var current_item = source_list[1];
            return [0, current_item, list_mapper(source_list[2], accumulator_list)];
        }
        return accumulator_list;
    }


    function flush_output_streams(unused_param) {
        var channel_iterator = get_output_channels(0);
        for (;;) {
            if (channel_iterator) {
                var next_channel = channel_iterator[2];
                try {} catch (error_placeholder) {}
                var channel_iterator = next_channel;
                continue;
            }
            return 0;
        }
    }
    register_symbol_entry(exit_handler_name, flush_output_streams);


    function array_to_list_converter(input_array) {
        var current_idx = input_array.length - 1 - 1 | 0,
            result_list = 0;
        for (;;) {
            if (0 <= current_idx) {
                var list_node = [0, input_array[current_idx + 1], result_list],
                    prev_idx = current_idx - 1 | 0,
                    current_idx = prev_idx,
                    result_list = list_node;
                continue;
            }
            return result_list;
        }
    }


    function deep_list_mapper(input_nested_list) {
        if (input_nested_list) {
            var current_nested_item = input_nested_list[1];
            return list_mapper(current_nested_item, deep_list_mapper(input_nested_list[2]));
        }
        return 0;
    }


    function transform_list_elements(transform_func, source_elements) {
        if (source_elements) {
            var next_element = source_elements[2],
                transformed_element = FunctionExecutor(transform_func, source_elements[1]);
            return [0, transformed_element, transform_list_elements(transform_func, next_element)];
        }
        return 0;
    }
    var extension_registry = [0, 0],
        RegexConstructor = RegExp,
        NativeArray = Array;


    function identity_transformer(input_identity) {
        return input_identity;
    }


    function to_wrapped_text_or_null(input_item) {
        return input_item instanceof NativeArray ? 0 : [0, new TextWrapper(input_item.toString())];
    }
    extension_registry[1] = [0, to_wrapped_text_or_null, extension_registry[1]];
    var browser_console_logger = get_browser_console(0);


    function apply_func_to_args(arg_val, func_val) {
        return FunctionExecutor(func_val, arg_val);
    }


    function object_to_string(input_object) {
        return input_object.toString();
    }


    function log_to_console(log_value) {
        return browser_console_logger.log(object_to_string(log_value));
    }


    function range_generator(start_num, end_num) {
        var is_less_check = start_num < end_num ? 1 : 0,
            generated_range = is_less_check ? [0, start_num, range_generator(start_num + 1 | 0, end_num)] : is_less_check;
        return generated_range;
    }


    function swap_array_elements(target_array, index_a, index_b) {
        var temp_value = vector_access_element(target_array, index_a);
        vector_assign_element(target_array, index_a, vector_access_element(target_array, index_b));
        return vector_assign_element(target_array, index_b, temp_value);
    }


    function split_list_at_index(split_index, input_linked_list) {
        if (input_linked_list) {
            if (0 < split_index) {
                var remaining_list = split_list_at_index(split_index - 1 | 0, input_linked_list[2]);
                return [0, [0, input_linked_list[1], remaining_list[1]], remaining_list[2]];
            }
            return [0, 0, input_linked_list];
        }
        if (0 === split_index) return empty_list_ref;
        runtime_throw_with_data(invalid_arg_exception, split_name_str);
    }


    function parse_int_from_text(text_input) {
        return convert_text_to_int(text_input);
    }


    function solve_puzzle(split_count, puzzle_data_array) {
        // Inner helper function for recursive calculation
        function recursive_solver(current_start_idx) {
            if (puzzle_data_array.length - 1 <= ((current_start_idx + split_count | 0) - 1 | 0)) return -1;
            var current_max = 1,
                loop_start = 0,
                loop_end = split_count - 1 | 0;
            if (loop_end < loop_start) var loop_result = current_max;
            else {
                var inner_loop_idx = loop_start,
                    inner_max_val = current_max;
                for (;;) {
                    var product_val = multiply_int_parts(inner_max_val, vector_access_element(puzzle_data_array, current_start_idx + inner_loop_idx | 0)),
                        next_inner_idx = inner_loop_idx + 1 | 0;
                    if (loop_end !== inner_loop_idx) {
                        var inner_loop_idx = next_inner_idx,
                            inner_max_val = product_val;
                        continue;
                    }
                    var loop_result = product_val;
                    break;
                }
            }
            return max_value_selector(loop_result, recursive_solver(current_start_idx + 1 | 0));
        }

        var file_content_string = require("fs").readFileSync("/dev/stdin", "utf8"),
            transformed_data_func = FunctionExecutor(transform_list_elements, function (single_char_input) {
                return new TextWrapper(single_char_input);
            });


        function js_array_converter(input_js_array) {
            return convert_js_to_ocaml_array(input_js_array);
        }
        var processed_input_data = apply_func_to_args(apply_func_to_args(apply_func_to_args(apply_func_to_args(file_content_string.split(new RegexConstructor(object_to_string(whitespace_regex_str))), identity_transformer), js_array_converter), array_to_list_converter), transformed_data_func);

        main_loop: for (;;) {
            if (processed_input_data) {
                var next_segment = processed_input_data[2];
                if (next_segment) {
                    var first_num_val = parse_int_from_text(processed_input_data[1]),
                        second_num_val = parse_int_from_text(next_segment[1]);
                    if (0 === first_num_val && 0 === second_num_val) {
                        var puzzle_state = 0,
                            is_zero_zero = 1;
                    } else var is_zero_zero = 0;
                    if (!is_zero_zero) {
                        var split_list_result = split_list_at_index(first_num_val, next_segment[2]),
                            remaining_list_part = split_list_result[2],
                            puzzle_state = [0, [0, first_num_val, second_num_val, transform_list_elements(parse_int_from_text, split_list_result[1])], remaining_list_part];
                    }
                    if (puzzle_state) {
                        var current_puzzle_node = puzzle_state[1],
                            target_split_count = current_puzzle_node[2],
                            initial_max_val = current_puzzle_node[1],
                            list_elements_to_transform = current_puzzle_node[3];
                        if (list_elements_to_transform) {
                            var element_counter = 0,
                                current_list_element = list_elements_to_transform,
                                transformed_elements = list_elements_to_transform[2],
                                element_value = list_elements_to_transform[1];
                            for (;;) {
                                if (current_list_element) {
                                    var next_element_in_list = current_list_element[2],
                                        incremented_counter = element_counter + 1 | 0,
                                        element_counter = incremented_counter,
                                        current_list_element = next_element_in_list;
                                    continue;
                                }
                                var vector_for_elements = create_initialized_vector(element_counter, element_value),
                                    vector_idx_counter = 1,
                                    next_element_in_vector_list = transformed_elements;
                                for (;;) {
                                    if (next_element_in_vector_list) {
                                        var current_vector_element = next_element_in_vector_list[2];
                                        vector_for_elements[vector_idx_counter + 1] = next_element_in_vector_list[1];
                                        var next_vector_idx = vector_idx_counter + 1 | 0,
                                            vector_idx_counter = next_vector_idx,
                                            next_element_in_vector_list = current_vector_element;
                                        continue;
                                    }
                                    var final_data_vector = vector_for_elements;
                                    break;
                                }
                                break;
                            }
                        } else var final_data_vector = [0];
                        var solved_value = recursive_solver(0),
                            range_one = range_generator(0, initial_max_val),
                            range_two = range_generator(0, initial_max_val),
                            transformed_ranges = deep_list_mapper(transform_list_elements(function (element_a) {
                                return function (element_b) {
                                    return transform_list_elements(function (inner_element) {
                                        return [0, element_a, inner_element];
                                    }, element_b);
                                };
                            }(range_one), range_two)),
                            max_score_so_far = -1,
                            transformed_scores = transform_list_elements(function () {
                                return function (swap_element) {
                                    var first_swap_idx = swap_element[2],
                                        second_swap_idx = swap_element[1];
                                    swap_array_elements(final_data_vector, second_swap_idx, first_swap_idx);
                                    var result_after_swap = recursive_solver(0);
                                    swap_array_elements(final_data_vector, second_swap_idx, first_swap_idx);
                                    return result_after_swap;
                                };
                            }(), transformed_ranges);
                        for (;;) {
                            if (transformed_scores) {
                                var next_score_entry = transformed_scores[2],
                                    updated_max_score = max_value_selector(max_score_so_far, transformed_scores[1]),
                                    max_score_so_far = updated_max_score,
                                    transformed_scores = next_score_entry;
                                continue;
                            }
                            if (max_score_so_far < solved_value) log_to_console(no_game_str);
                            else log_to_console(format_integer_value(decimal_format_spec, max_score_so_far - solved_value | 0));
                            var next_puzzle_node = current_puzzle_node[4],
                                processed_input_data = next_puzzle_node;
                            continue main_loop;
                        }
                    }
                    flush_output_streams(0);
                    return;
                }
            }
            runtime_throw_with_data(failure_exception, get_input_str);
        }
    }
}());