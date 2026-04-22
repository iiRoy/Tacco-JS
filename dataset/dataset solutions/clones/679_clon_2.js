// This script is an artifact generated from an OCaml source, processed via js_of_ocaml v1.3.
function ml_js_throw_with_data (exception_id, payload_data) {
  throw [0, exception_id, payload_data];
}

// Propagates an exception with a string message.
function ml_js_throw_with_text (exception_id, message_text) {
  ml_js_throw_with_data(exception_id, new WrappedText(message_text));
}

// Raises an error for invalid function arguments.
function ml_js_bad_input (message_text) {
  ml_js_throw_with_text(global_runtime_data[4], message_text);
}

// Triggers an error when an array access is out of bounds.
function ml_js_index_out_of_range () {
  ml_js_bad_input("index out of bounds");
}

// Repeats a given string a specified number of times.
function ml_js_text_multiply (count_val, string_val) {
  if (count_val === 0) {
    return "";
  }
  if (count_val % 2 === 1) {
    return ml_js_text_multiply(count_val - 1, string_val) + string_val;
  }
  let result_str = ml_js_text_multiply(count_val / 2, string_val);
  return result_str + result_str;
}

// Constructor for a string-like data structure.
function StringContainer (input_value) {
  if (input_value !== null) {
    this.byte_sequence = this.complete_byte_sequence = input_value;
    this.last_index = this.data_length = input_value.length;
  }
}

StringContainer.prototype = {
  js_string: undefined,
  byte_sequence: undefined,
  complete_byte_sequence: undefined,
  char_array: undefined,
  data_length: undefined,
  last_index: 0,

  // Converts the internal byte sequence to a JavaScript string.
  toJsString: function () {
    return this.js_string = decodeURIComponent(escape(this.getCompleteByteSequence()));
  },

  // Converts the internal string or array to a byte sequence.
  toBytes: function () {
    let byte_data;
    if (this.js_string !== null)
      byte_data = unescape(encodeURIComponent(this.js_string));
    else {
      byte_data = "";
      let char_list = this.char_array;
      let current_length = char_list.length;
      for (let loop_index = 0; loop_index < current_length; loop_index++) {
        byte_data += String.fromCharCode(char_list[loop_index]);
      }
    }
    this.byte_sequence = this.complete_byte_sequence = byte_data;
    this.last_index = this.data_length = byte_data.length;
    return byte_data;
  },

  // Retrieves the byte sequence, converting if necessary.
  getBytes: function () {
    let byte_data = this.byte_sequence;
    if (byte_data === null) byte_data = this.toBytes();
    return byte_data;
  },

  // Fetches the full byte sequence, padding with nulls if shorter than declared length.
  getCompleteByteSequence: function () {
    let byte_data = this.complete_byte_sequence;
    if (byte_data !== null) return byte_data;
    byte_data = this.byte_sequence;
    if (byte_data === null) byte_data = this.toBytes();
    if (this.last_index < this.data_length) {
      this.byte_sequence = (byte_data += ml_js_text_multiply(this.data_length - this.last_index, '\0'));
      this.last_index = this.data_length;
    }
    this.complete_byte_sequence = byte_data;
    return byte_data;
  },

  // Converts the internal byte sequence to an array of character codes.
  toArray: function () {
    let byte_data = this.byte_sequence;
    if (byte_data === null) byte_data = this.toBytes();
    let char_list = [];
    let current_length = this.last_index;
    for (let loop_index = 0; loop_index < current_length; loop_index++) char_list[loop_index] = byte_data.charCodeAt(loop_index);
    for (current_length = this.data_length; loop_index < current_length; loop_index++) char_list[loop_index] = 0;
    this.js_string = this.byte_sequence = this.complete_byte_sequence = null;
    this.last_index = this.data_length;
    this.char_array = char_list;
    return char_list;
  },

  // Returns the character code array, creating it if it doesn't exist.
  getArray: function () {
    let char_list = this.char_array;
    if (!char_list) char_list = this.toArray();
    return char_list;
  },

  // Gets the declared data length, computing it if necessary.
  getLen: function () {
    let length_val = this.data_length;
    if (length_val !== null) return length_val;
    this.toBytes();
    return this.data_length;
  },

  // Provides a string representation of the object.
  toString: function () {
    let str_val = this.js_string;
    return str_val ? str_val : this.toJsString();
  },
  // Returns the primitive value of the object.
  valueOf: function () {
    let str_val = this.js_string;
    return str_val ? str_val : this.toJsString();
  },

  // Copies a segment of the string's characters to a target array.
  blitToArray: function (start_src, target_array, start_dest, copy_length) {
    let source_array = this.char_array;
    if (source_array) {
      if (start_dest <= start_src) {
        for (let loop_index = 0; loop_index < copy_length; loop_index++) target_array[start_dest + loop_index] = source_array[start_src + loop_index];
      } else {
        for (let loop_index = copy_length - 1; loop_index >= 0; loop_index--) target_array[start_dest + loop_index] = source_array[start_src + loop_index];
      }
    } else {
      let byte_data = this.byte_sequence;
      if (byte_data === null) byte_data = this.toBytes();
      let remaining_length = this.last_index - start_src;
      if (copy_length <= remaining_length)
        for (let loop_index = 0; loop_index < copy_length; loop_index++) target_array[start_dest + loop_index] = byte_data.charCodeAt(start_src + loop_index);
      else {
        for (let loop_index = 0; loop_index < remaining_length; loop_index++) target_array[start_dest + loop_index] = byte_data.charCodeAt(start_src + loop_index);
        for (; loop_index < copy_length; loop_index++) target_array[start_dest + loop_index] = 0;
      }
    }
  },

  // Retrieves the character code at a specific index.
  get: function (loop_index) {
    let char_list = this.char_array;
    if (char_list) return char_list[loop_index];
    let byte_data = this.byte_sequence;
    if (byte_data === null) byte_data = this.toBytes();
    return (loop_index < this.last_index) ? byte_data.charCodeAt(loop_index) : 0;
  },

  // Safely retrieves a character code, checking bounds.
  safeGet: function (loop_index) {
    if (!this.data_length) this.toBytes();
    if ((loop_index < 0) || (loop_index >= this.data_length)) ml_js_index_out_of_range();
    return this.get(loop_index);
  },

  // Sets a character code at a specific index.
  set: function (loop_index, char_code_val) {
    let char_list = this.char_array;
    if (!char_list) {
      if (this.last_index === loop_index) {
        this.byte_sequence += String.fromCharCode(char_code_val & 0xff);
        this.last_index++;
        return 0;
      }
      char_list = this.toArray();
    } else if (this.byte_sequence !== null) {
      this.byte_sequence = this.complete_byte_sequence = this.js_string = null;
    }
    char_list[loop_index] = char_code_val & 0xff;
    return 0;
  },

  // Safely sets a character code, checking bounds.
  safeSet: function (loop_index, char_code_val) {
    if (this.data_length === null) this.toBytes();
    if ((loop_index < 0) || (loop_index >= this.data_length)) ml_js_index_out_of_range();
    this.set(loop_index, char_code_val);
  },

  // Fills a segment of the string with a specified character.
  fill: function (offset_pos, segment_len, fill_char) {
    if (offset_pos >= this.last_index && this.last_index && fill_char === 0) return;
    let char_list = this.char_array;
    if (!char_list) char_list = this.toArray();
    else if (this.byte_sequence !== null) {
      this.byte_sequence = this.complete_byte_sequence = this.js_string = null;
    }
    let end_pos = offset_pos + segment_len;
    for (let loop_index = offset_pos; loop_index < end_pos; loop_index++) char_list[loop_index] = fill_char;
  },

  // Compares this string container with another.
  compare: function (other_container) {
    if (this.js_string !== null && other_container.js_string !== null) {
      if (this.js_string < other_container.js_string) return -1;
      if (this.js_string > other_container.js_string) return 1;
      return 0;
    }
    let byte_data_1 = this.getCompleteByteSequence();
    let byte_data_2 = other_container.getCompleteByteSequence();
    if (byte_data_1 < byte_data_2) return -1;
    if (byte_data_1 > byte_data_2) return 1;
    return 0;
  },

  // Checks if this string container is equal to another.
  equal: function (other_container) {
    if (this.js_string !== null && other_container.js_string !== null)
      return this.js_string === other_container.js_string;
    return this.getCompleteByteSequence() === other_container.getCompleteByteSequence();
  },

  // Checks if this string container is less than another.
  lessThan: function (other_container) {
    if (this.js_string !== null && other_container.js_string !== null)
      return this.js_string < other_container.js_string;
    return this.getCompleteByteSequence() < other_container.getCompleteByteSequence();
  },

  // Checks if this string container is less than or equal to another.
  lessEqual: function (other_container) {
    if (this.js_string !== null && other_container.js_string !== null)
      return this.js_string <= other_container.js_string;
    return this.getCompleteByteSequence() <= other_container.getCompleteByteSequence();
  }
};

// A constructor for a wrapped JavaScript string.
function WrappedText (str_val) {
  this.js_string = str_val;
}
WrappedText.prototype = new StringContainer();

// Constructor for creating a string container with a predefined length.
function CreateString (length_val) {
  this.byte_sequence = "";
  this.data_length = length_val;
}
CreateString.prototype = new StringContainer();

// Retrieves an element from an OCaml-style array.
function ml_js_array_fetch (target_array, index_val) {
  if ((index_val < 0) || (index_val >= target_array.length - 1)) ml_js_index_out_of_range();
  return target_array[index_val + 1];
}

// Sets an element in an OCaml-style array.
function ml_js_array_place (target_array, index_val, new_value) {
  if ((index_val < 0) || (index_val >= target_array.length - 1)) ml_js_index_out_of_range();
  target_array[index_val + 1] = new_value;
  return 0;
}

// Handles generic function invocation, supporting currying.
function ml_js_invoke_generic (func_ref, args_list) {
  if (func_ref.fun)
    return ml_js_invoke_generic(func_ref.fun, args_list);
  let param_count = func_ref.length;
  let difference_val = param_count - args_list.length;
  if (difference_val === 0)
    return func_ref.apply(null, args_list);
  else if (difference_val < 0)
    return ml_js_invoke_generic(func_ref.apply(null, args_list.slice(0, param_count)), args_list.slice(param_count));
  else
    return function (single_arg) {
      return ml_js_invoke_generic(func_ref, args_list.concat([single_arg]));
    };
}

// Parses a format string into a structured object.
function ml_js_analyze_format (format_specifier) {
  format_specifier = format_specifier.toString();
  let length_val = format_specifier.length;
  if (length_val > 31) ml_js_bad_input("format_int: format too long");
  let format_object = {
    justify: '+',
    sign_style: '-',
    filler_char: ' ',
    alternate_form: false,
    base_val: 0,
    signed_conversion: false,
    width_val: 0,
    uppercase_output: false,
    sign_val: 1,
    precision_val: -1,
    conversion_type: 'f'
  };
  for (let loop_index = 0; loop_index < length_val; loop_index++) {
    let current_char = format_specifier.charAt(loop_index);
    switch (current_char) {
      case '-':
        format_object.justify = '-';
        break;
      case '+':
      case ' ':
        format_object.sign_style = current_char;
        break;
      case '0':
        format_object.filler_char = '0';
        break;
      case '#':
        format_object.alternate_form = true;
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
        format_object.width_val = 0;
        while (current_char = format_specifier.charCodeAt(loop_index) - 48, current_char >= 0 && current_char <= 9) {
          format_object.width_val = format_object.width_val * 10 + current_char;
          loop_index++;
        }
        loop_index--;
        break;
      case '.':
        format_object.precision_val = 0;
        loop_index++;
        while (current_char = format_specifier.charCodeAt(loop_index) - 48, current_char >= 0 && current_char <= 9) {
          format_object.precision_val = format_object.precision_val * 10 + current_char;
          loop_index++;
        }
        loop_index--;
      case 'd':
      case 'i':
        format_object.signed_conversion = true; /* fallthrough */
      case 'u':
        format_object.base_val = 10;
        break;
      case 'x':
        format_object.base_val = 16;
        break;
      case 'X':
        format_object.base_val = 16;
        format_object.uppercase_output = true;
        break;
      case 'o':
        format_object.base_val = 8;
        break;
      case 'e':
      case 'f':
      case 'g':
        format_object.signed_conversion = true;
        format_object.conversion_type = current_char;
        break;
      case 'E':
      case 'F':
      case 'G':
        format_object.signed_conversion = true;
        format_object.uppercase_output = true;
        format_object.conversion_type = current_char.toLowerCase();
        break;
    }
  }
  return format_object;
}

// Applies padding and sign to a formatted string buffer.
function ml_js_complete_format (format_spec, unformatted_buffer) {
  if (format_spec.uppercase_output) unformatted_buffer = unformatted_buffer.toUpperCase();
  let buffer_len = unformatted_buffer.length;
  if (format_spec.signed_conversion && (format_spec.sign_val < 0 || format_spec.sign_style !== '-')) buffer_len++;
  if (format_spec.alternate_form) {
    if (format_spec.base_val === 8) buffer_len += 1;
    if (format_spec.base_val === 16) buffer_len += 2;
  }
  let final_buffer = "";
  if (format_spec.justify === '+' && format_spec.filler_char === ' ')
    for (let loop_index = buffer_len; loop_index < format_spec.width_val; loop_index++) final_buffer += ' ';
  if (format_spec.signed_conversion) {
    if (format_spec.sign_val < 0) final_buffer += '-';
    else if (format_spec.sign_style !== '-') final_buffer += format_spec.sign_style;
  }
  if (format_spec.alternate_form && format_spec.base_val === 8) final_buffer += '0';
  if (format_spec.alternate_form && format_spec.base_val === 16) final_buffer += "0x";
  if (format_spec.justify === '+' && format_spec.filler_char === '0')
    for (let loop_index = buffer_len; loop_index < format_spec.width_val; loop_index++) final_buffer += '0';
  final_buffer += unformatted_buffer;
  if (format_spec.justify === '-')
    for (let loop_index = buffer_len; loop_index < format_spec.width_val; loop_index++) final_buffer += ' ';
  return new WrappedText(final_buffer);
}

// Formats an integer according to a given format string.
function ml_js_format_integer (format_specifier, integer_val) {
  if (format_specifier.toString() === "%d") return new WrappedText("" + integer_val);
  let format_object = ml_js_analyze_format(format_specifier);
  if (integer_val < 0) {
    if (format_object.signed_conversion) {
      format_object.sign_val = -1;
      integer_val = -integer_val;
    } else integer_val >>>= 0;
  }
  let string_representation = integer_val.toString(format_object.base_val);
  if (format_object.precision_val >= 0) {
    format_object.filler_char = ' ';
    let padding_count = format_object.precision_val - string_representation.length;
    if (padding_count > 0) string_representation = ml_js_text_multiply(padding_count, '0') + string_representation;
  }
  return ml_js_complete_format(format_object, string_representation);
}

// Compares two 64-bit integers represented as arrays.
function ml_js_long_compare (val_x, val_y) {
  let high_bits_x = val_x[3] << 16;
  let high_bits_y = val_y[3] << 16;
  if (high_bits_x > high_bits_y) return 1;
  if (high_bits_x < high_bits_y) return -1;
  if (val_x[2] > val_y[2]) return 1;
  if (val_x[2] < val_y[2]) return -1;
  if (val_x[1] > val_y[1]) return 1;
  if (val_x[1] < val_y[1]) return -1;
  return 0;
}

// Compares two standard integers.
function ml_js_integer_compare (val_a, val_b) {
  if (val_a < val_b) return (-1);
  if (val_a === val_b) return 0;
  return 1;
}

// Performs a deep comparison of two OCaml-like values.
function ml_js_compare_value (val_a, val_b, full_comparison) {
  let comparison_stack = [];
  for (;;) {
    if (!(full_comparison && val_a === val_b)) {
      if (val_a instanceof StringContainer) {
        if (val_b instanceof StringContainer) {
          if (val_a !== val_b) {
            let comparison_result = val_a.compare(val_b);
            if (comparison_result !== 0) return comparison_result;
          }
        } else
          return 1;
      } else if (val_a instanceof Array && val_a[0] === (val_a[0] | 0)) {
        let type_tag_a = val_a[0];
        if (type_tag_a === 250) {
          val_a = val_a[1];
          continue;
        } else if (val_b instanceof Array && val_b[0] === (val_b[0] | 0)) {
          let type_tag_b = val_b[0];
          if (type_tag_b === 250) {
            val_b = val_b[1];
            continue;
          } else if (type_tag_a !== type_tag_b) {
            return (type_tag_a < type_tag_b) ? -1 : 1;
          } else {
            switch (type_tag_a) {
              case 248: {
                let comparison_result = ml_js_integer_compare(val_a[2], val_b[2]);
                if (comparison_result !== 0) return comparison_result;
                break;
              }
              case 255: {
                let comparison_result = ml_js_long_compare(val_a, val_b);
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
      } else if (val_b instanceof StringContainer ||
        (val_b instanceof Array && val_b[0] === (val_b[0] | 0))) {
        return -1;
      } else {
        if (val_a < val_b) return -1;
        if (val_a > val_b) return 1;
        if (full_comparison && val_a !== val_b) {
          if (val_a === val_a) return 1;
          if (val_b === val_b) return -1;
        }
      }
    }
    if (comparison_stack.length === 0) return 0;
    let current_index = comparison_stack.pop();
    val_b = comparison_stack.pop();
    val_a = comparison_stack.pop();
    if (current_index + 1 < val_a.length) comparison_stack.push(val_a, val_b, current_index + 1);
    val_a = val_a[current_index];
    val_b = val_b[current_index];
  }
}

// Compares two values for equality, performing a total ordering.
function ml_js_compare_entities (val_a, val_b) {
  return ml_js_compare_value(val_a, val_b, true);
}

// Checks if the first value is greater than or equal to the second.
function ml_js_greater_or_equal (val_x, val_y) {
  return +(ml_js_compare_entities(val_x, val_y) >= 0);
}

// Parses the sign and base from a string representation of a number.
function ml_js_extract_sign_base (str_value) {
  let loop_index = 0,
    base_num = 10,
    sign_val = str_value.get(0) === 45 ? (loop_index++, -1) : 1;
  if (str_value.get(loop_index) === 48)
    switch (str_value.get(loop_index + 1)) {
      case 120:
      case 88:
        base_num = 16;
        loop_index += 2;
        break;
      case 111:
      case 79:
        base_num = 8;
        loop_index += 2;
        break;
      case 98:
      case 66:
        base_num = 2;
        loop_index += 2;
        break;
    }
  return [loop_index, sign_val, base_num];
}

// Converts a character code to its numeric digit value.
function ml_js_extract_digit (char_code_val) {
  if (char_code_val >= 48 && char_code_val <= 57) return char_code_val - 48;
  if (char_code_val >= 65 && char_code_val <= 90) return char_code_val - 55;
  if (char_code_val >= 97 && char_code_val <= 122) return char_code_val - 87;
  return -1;
}

// Global data storage for runtime.
var global_runtime_data = [0];

// Raises a generic failure exception with a message.
function ml_js_fail_execution (message_text) {
  ml_js_throw_with_text(global_runtime_data[3], message_text);
}

// Converts a string to an integer, handling various bases and signs.
function ml_js_integer_from_text (str_value) {
  let parse_result = ml_js_extract_sign_base(str_value);
  let loop_index = parse_result[0],
    sign_val = parse_result[1],
    base_num = parse_result[2];
  let max_value_threshold = -1 >>> 0;
  let char_value = str_value.get(loop_index);
  let digit_val = ml_js_extract_digit(char_value);
  if (digit_val < 0 || digit_val >= base_num) ml_js_fail_execution("int_of_string");
  let parsed_result = digit_val;
  for (;;) {
    loop_index++;
    char_value = str_value.get(loop_index);
    if (char_value === 95) continue;
    digit_val = ml_js_extract_digit(char_value);
    if (digit_val < 0 || digit_val >= base_num) break;
    parsed_result = base_num * parsed_result + digit_val;
    if (parsed_result > max_value_threshold) ml_js_fail_execution("int_of_string");
  }
  if (loop_index !== str_value.getLen()) ml_js_fail_execution("int_of_string");
  parsed_result = sign_val * parsed_result;
  if ((parsed_result | 0) !== parsed_result) ml_js_fail_execution("int_of_string");
  return parsed_result;
}

// Retrieves the browser's console object, providing dummy methods if unavailable.
function ml_js_get_js_console () {
  let console_object = this.console ? this.console : {};
  let method_names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
    "trace", "group", "groupCollapsed", "groupEnd", "time", "timeEnd"
  ];
  function dummy_func () {}
  for (let loop_index = 0; loop_index < method_names.length; loop_index++)
    if (!console_object[method_names[loop_index]]) console_object[method_names[loop_index]] = dummy_func;
  return console_object;
}

// Converts a JavaScript array to an OCaml-style list (prepended with 0).
function ml_js_to_list (js_array_data) {
  return [0].concat(js_array_data);
}

// Creates an OCaml-style vector (array with 0 at index 0).
function ml_js_create_vector (length_val, initial_value) {
  let vector_elements = [0];
  for (let loop_index = 1; loop_index <= length_val; loop_index++) vector_elements[loop_index] = initial_value;
  return vector_elements;
}

// Placeholder for getting the list of output channels.
function ml_js_output_channel_list () {
  return 0;
}

// Performs integer multiplication, ensuring result is 32-bit.
function ml_js_multiply_int (val_x, val_y) {
  return ((((val_x >> 16) * val_y) << 16) + (val_x & 0xffff) * val_y) | 0;
}

// Registers a value in the global runtime data array.
function ml_js_register_runtime_entry (entry_num, entry_value) {
  global_runtime_data[entry_num + 1] = entry_value;
}

// Storage for named values in the runtime.
var runtime_named_entities = {};

// Registers a value with a specific name in the runtime.
function ml_js_register_named_entity (entity_name, entity_value) {
  runtime_named_entities[entity_name] = entity_value;
  return 0;
}

// Self-executing anonymous function containing application logic.
(function () {
  // Helper for generic function invocation, handling currying.
  function GenericInvoker (func_ref, data_item) {
    return func_ref.length === 1 ? func_ref(data_item) : ml_js_invoke_generic(func_ref, [data_item]);
  }

  let failure_tuple = [0, new StringContainer("Failure")];
  let invalid_arg_tuple = [0, new StringContainer("Invalid_argument")];

  ml_js_register_runtime_entry(6, [0, new StringContainer("Not_found")]);
  ml_js_register_runtime_entry(5, [0, new StringContainer("Division_by_zero")]);
  ml_js_register_runtime_entry(3, invalid_arg_tuple);
  ml_js_register_runtime_entry(2, failure_tuple);

  let int_format_str = new StringContainer("%d");
  let exit_hook_name = new StringContainer("Pervasives.do_at_exit");
  let empty_list_tuple = [0, 0, 0];
  let split_name_str = new StringContainer("split_n");
  let no_game_str = new StringContainer("NO GAME");
  let get_input_str = new StringContainer("get_input");
  let whitespace_regex_str = new StringContainer("\\s");

  // Returns the maximum of two numbers.
  function MaxOfTwo (val_a, val_b) {
    return ml_js_greater_or_equal(val_a, val_b) ? val_a : val_b;
  }

  // Prepends items from one list to another.
  function PrependList (input_list, accumulator_list) {
    if (input_list) {
      let head_item = input_list[1];
      return [0, head_item, PrependList(input_list[2], accumulator_list)];
    }
    return accumulator_list;
  }

  // Flushes pending output channels.
  function FlushOutputChannels (dummy_arg) {
    let channel_list_ref = ml_js_output_channel_list(0);
    for (;;) {
      if (channel_list_ref) {
        let next_channel = channel_list_ref[2];
        try {} catch (error_catch) {}
        channel_list_ref = next_channel;
        continue;
      }
      return 0;
    }
  }
  ml_js_register_named_entity(exit_hook_name, FlushOutputChannels);

  // Converts a JavaScript array to an OCaml-style linked list.
  function ArrayToLinkedList (source_array_ref) {
    let current_index = source_array_ref.length - 1 - 1 | 0;
    let linked_list_acc = 0;
    for (;;) {
      if (current_index >= 0) {
        let list_node = [0, source_array_ref[current_index + 1], linked_list_acc];
        let prev_index = current_index - 1 | 0;
        current_index = prev_index;
        linked_list_acc = list_node;
        continue;
      }
      return linked_list_acc;
    }
  }

  // Recursively deep copies a linked list.
  function DeepCopyLinkedList (source_list_ref) {
    if (source_list_ref) {
      let current_head = source_list_ref[1];
      return PrependList(current_head, DeepCopyLinkedList(source_list_ref[2]));
    }
    return 0;
  }

  // Applies a function to each element of a linked list.
  function MapLinkedList (mapper_func, source_list_ref) {
    if (source_list_ref) {
      let next_node = source_list_ref[2];
      let mapped_head = GenericInvoker(mapper_func, source_list_ref[1]);
      return [0, mapped_head, MapLinkedList(mapper_func, next_node)];
    }
    return 0;
  }

  let global_callbacks = [0, 0];
  let RegexConstructor = RegExp;
  let ArrayType = Array;

  // Identity function, returns its input.
  function IdentityFunction (input_val) {
    return input_val;
  }

  // Wraps a value, converting arrays to null and others to WrappedText.
  function WrapValue (value_to_wrap) {
    return value_to_wrap instanceof ArrayType ? 0 : [0, new WrappedText(value_to_wrap.toString())];
  }
  global_callbacks[1] = [0, WrapValue, global_callbacks[1]];

  let console_utility = ml_js_get_js_console(0);

  // Applies a function to an argument in reverse order.
  function ApplyFunction (argument_val, function_val) {
    return GenericInvoker(function_val, argument_val);
  }

  // Converts any input to its string representation.
  function ToString (input_value) {
    return input_value.toString();
  }

  // Logs a message to the console.
  function LogToConsole (log_message) {
    return console_utility.log(ToString(log_message));
  }

  // Generates a list of integers from a start to an end value.
  function GenerateRangeList (start_val, end_val) {
    let is_less = start_val < end_val;
    let result_list = is_less ? [0, start_val, GenerateRangeList(start_val + 1 | 0, end_val)] : is_less;
    return result_list;
  }

  // Swaps two elements within an array.
  function SwapElements (target_array, index1, index2) {
    let temp_val = ml_js_array_fetch(target_array, index1);
    ml_js_array_place(target_array, index1, ml_js_array_fetch(target_array, index2));
    return ml_js_array_place(target_array, index2, temp_val);
  }

  // Extracts a sub-list of a specified number of elements.
  function ExtractSubList (num_elements, source_list) {
    if (source_list) {
      if (num_elements > 0) {
        let sublist_result = ExtractSubList(num_elements - 1 | 0, source_list[2]);
        return [0, [0, source_list[1], sublist_result[1]], sublist_result[2]];
      }
      return [0, 0, source_list];
    }
    if (num_elements === 0) return empty_list_tuple;
    ml_js_throw_with_data(invalid_arg_tuple, split_name_str);
  }

  // Parses an integer from a StringContainer.
  function ParseInteger (input_string_val) {
    return ml_js_integer_from_text(input_string_val);
  }

  // Main problem-solving function.
  function SolveProblem (base_val, data_array) {
    // Calculates the maximum product for a given starting index.
    function CalculateMaxProduct (current_idx) {
      if (data_array.length - 1 <= ((current_idx + base_val | 0) - 1 | 0)) return -1;
      let multiplier_val = 1;
      let start_idx = 0;
      let end_idx = base_val - 1 | 0;
      let max_product;
      if (end_idx < start_idx) max_product = multiplier_val;
      else {
        let inner_idx = start_idx;
        let current_product = multiplier_val;
        for (;;) {
          let multiplied_val = ml_js_multiply_int(current_product, ml_js_array_fetch(data_array, current_idx + inner_idx | 0));
          let next_idx = inner_idx + 1 | 0;
          if (end_idx !== inner_idx) {
            inner_idx = next_idx;
            current_product = multiplied_val;
            continue;
          }
          max_product = multiplied_val;
          break;
        }
      }
      return MaxOfTwo(max_product, CalculateMaxProduct(current_idx + 1 | 0));
    }
    return CalculateMaxProduct(0);
  }

  let file_content = require("fs").readFileSync("/dev/stdin", "utf8");
  let mapped_lines = GenericInvoker(MapLinkedList, function (line_text) {
    return new WrappedText(line_text);
  });
  // Converts a JS array to an OCaml-style list.
  function js_array_conv (js_array_data) {
    return ml_js_to_list(js_array_data);
  }
  let processed_input = ApplyFunction(ApplyFunction(ApplyFunction(ApplyFunction(file_content.split(new RegexConstructor(ToString(whitespace_regex_str))), IdentityFunction), js_array_conv), ArrayToLinkedList), mapped_lines);

  // Main loop for processing input data.
  main_processing_loop: for (;;) {
    if (processed_input) {
      let next_input = processed_input[2];
      if (next_input) {
        let num_elements_val = ParseInteger(processed_input[1]);
        let pattern_len_val = ParseInteger(next_input[1]);
        let is_zero_case;
        if (num_elements_val === 0 && pattern_len_val === 0) {
          is_zero_case = 0;
        } else is_zero_case = 1;
        let current_item_data;
        if (!is_zero_case) {
          let extracted_sublist = ExtractSubList(num_elements_val, next_input[2]);
          let remaining_list = extracted_sublist[2];
          current_item_data = [0, [0, num_elements_val, pattern_len_val, MapLinkedList(ParseInteger, extracted_sublist[1]), remaining_list]];
        }
        if (current_item_data) {
          let current_data_entry = current_item_data[1];
          let base_for_product = current_data_entry[2];
          let num_items_in_array = current_data_entry[1];
          let list_of_values = current_data_entry[3];
          let final_vector;
          if (list_of_values) {
            let count_elements = 0;
            let temp_list_ref = list_of_values;
            let next_list_node = list_of_values[2];
            let current_value = list_of_values[1];
            for (;;) {
              if (temp_list_ref) {
                let next_element = temp_list_ref[2];
                let new_count = count_elements + 1 | 0;
                count_elements = new_count;
                temp_list_ref = next_element;
                continue;
              }
              let result_vector = ml_js_create_vector(count_elements, current_value);
              let vector_idx = 1;
              let list_iterator = next_list_node;
              for (;;) {
                if (list_iterator) {
                  let next_element_node = list_iterator[2];
                  result_vector[vector_idx + 1] = list_iterator[1];
                  let next_vector_idx = vector_idx + 1 | 0;
                  vector_idx = next_vector_idx;
                  list_iterator = next_element_node;
                  continue;
                }
                final_vector = result_vector;
                break;
              }
              break;
            }
          } else final_vector = [0];
          let initial_max_prod = SolveProblem(base_for_product, final_vector);
          let first_range = GenerateRangeList(0, num_items_in_array);
          let second_range = GenerateRangeList(0, num_items_in_array);
          let all_combinations = DeepCopyLinkedList(MapLinkedList(function (range_item_outer) {
            return function (range_item_inner) {
              return MapLinkedList(function (combined_pair) {
                return [0, range_item_inner, combined_pair];
              }, range_item_outer);
            };
          }(first_range), second_range));

          let max_product_overall = -1;
          let evaluated_combinations = MapLinkedList(function (base_val_param, data_vector_param) {
            return function (current_pair) {
              let second_idx = current_pair[2];
              let first_idx = current_pair[1];
              SwapElements(data_vector_param, first_idx, second_idx);
              let calculated_product = SolveProblem(base_val_param, data_vector_param);
              SwapElements(data_vector_param, first_idx, second_idx);
              return calculated_product;
            };
          }(base_for_product, final_vector), all_combinations);

          for (;;) {
            if (evaluated_combinations) {
              let next_combination = evaluated_combinations[2];
              let current_max = MaxOfTwo(max_product_overall, evaluated_combinations[1]);
              max_product_overall = current_max;
              evaluated_combinations = next_combination;
              continue;
            }
            if (max_product_overall < initial_max_prod) LogToConsole(no_game_str);
            else LogToConsole(ml_js_format_integer(int_format_str, max_product_overall - initial_max_prod | 0));
            let next_input_set = current_data_entry[4];
            processed_input = next_input_set;
            continue main_processing_loop;
          }
        }
      }
      FlushOutputChannels(0);
      return;
    }
    ml_js_throw_with_data(failure_tuple, get_input_str);
  }
})();