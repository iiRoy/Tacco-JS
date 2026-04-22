// This module was translated from an OCaml source using js_of_ocaml v1.3
function raise_exception_with_data(exception_tag_value, exception_argument)
{ throw [0, exception_tag_value, exception_argument]; }
function raise_exception_with_message(exception_tag_value, error_message)
{
  raise_exception_with_data(exception_tag_value, new WrappedDataString(error_message));
}
function throw_invalid_input(error_message_text)
{
  raise_exception_with_message(global_app_data[4], error_message_text);
}
function signal_bounds_violation()
{
  throw_invalid_input("array index out of bounds");
}
function string_duplicator(repeat_count, source_string)
{
  if (!repeat_count)
    { return ""; }
  if (repeat_count & 1)
  {
    return string_duplicator(repeat_count - 1, source_string) + source_string;
  }
  let duplicated_part = string_duplicator(repeat_count >> 1, source_string);
  return duplicated_part + duplicated_part;
}
function DataString(initial_param)
{
  if (initial_param != null)
  {
    this.byteSequence = this.completeByteSequence = initial_param;
    this.lastByteIndex = this.dataLength = initial_param.length;
  }
}
DataString.prototype =
{
  textValue: null,
  byteSequence: null,
  completeByteSequence: null,
  charArray: null,
  dataLength: null,
  lastByteIndex: 0,
  to_javascript_string: function()
  {
    return this.textValue = decodeURIComponent(escape(this.get_complete_byte_sequence()));
  },
  to_byte_sequence: function()
  {
    if (this.textValue != null)
    {
      var byte_representation = unescape(encodeURIComponent(this.textValue));
    }
    else
    {
      var byte_representation = "", char_arr = this.charArray, array_len = char_arr.length;
      for (var char_idx = 0; char_idx < array_len; char_idx++) byte_representation += String.fromCharCode(char_arr[char_idx]);
    }
    this.byteSequence = this.completeByteSequence = byte_representation;
    this.lastByteIndex = this.dataLength = byte_representation.length;
    return byte_representation;
  },
  get_byte_sequence: function()
  {
    var current_bytes = this.byteSequence;
    if (current_bytes == null) current_bytes = this.to_byte_sequence();
    return current_bytes;
  },
  get_complete_byte_sequence: function()
  {
    var current_bytes = this.completeByteSequence;
    if (current_bytes !== null) return current_bytes;
    current_bytes = this.byteSequence;
    if (current_bytes == null) current_bytes = this.to_byte_sequence();
    if (this.lastByteIndex < this.dataLength)
    {
      this.byteSequence = (current_bytes += string_duplicator(this.dataLength - this.lastByteIndex, '\0'));
      this.lastByteIndex = this.dataLength;
    }
    this.completeByteSequence = current_bytes;
    return current_bytes;
  },
  to_char_array: function()
  {
    var current_bytes = this.byteSequence;
    if (current_bytes == null) current_bytes = this.to_byte_sequence();
    var character_code_array = [], current_last_idx = this.lastByteIndex;
    for (var char_idx = 0; char_idx < current_last_idx; char_idx++) character_code_array[char_idx] = current_bytes.charCodeAt(char_idx);
    for (current_last_idx = this.dataLength; char_idx < current_last_idx; char_idx++) character_code_array[char_idx] = 0;
    this.textValue = this.byteSequence = this.completeByteSequence = null;
    this.lastByteIndex = this.dataLength;
    this.charArray = character_code_array;
    return character_code_array;
  },
  get_char_array: function()
  {
    var current_array = this.charArray;
    if (!current_array) current_array = this.to_char_array();
    return current_array;
  },
  get_data_length: function()
  {
    var current_length = this.dataLength;
    if (current_length !== null) return current_length;
    this.to_byte_sequence();
    return this.dataLength;
  },
  to_string_representation: function() { var str_val = this.textValue; return str_val ? str_val : this.to_javascript_string(); },
  get_primitive_value: function() { var str_val = this.textValue; return str_val ? str_val : this.to_javascript_string(); },
  copy_to_array: function(source_idx, target_array, target_idx, copy_length)
  {
    var source_array = this.charArray;
    if (source_array)
    {
      if (target_idx <= source_idx)
      {
        for (var current_idx = 0; current_idx < copy_length; current_idx++) target_array[target_idx + current_idx] = source_array[source_idx + current_idx];
      }
      else
      {
        for (var current_idx = copy_length - 1; current_idx >= 0; current_idx--) target_array[target_idx + current_idx] = source_array[source_idx + current_idx];
      }
    }
    else
    {
      var current_bytes = this.byteSequence;
      if (current_bytes == null) current_bytes = this.to_byte_sequence();
      var remaining_len = this.lastByteIndex - source_idx;
      if (copy_length <= remaining_len)
        for (var current_idx = 0; current_idx < copy_length; current_idx++) target_array[target_idx + current_idx] = current_bytes.charCodeAt(source_idx + current_idx);
      else
      {
        for (var current_idx = 0; current_idx < remaining_len; current_idx++) target_array[target_idx + current_idx] = current_bytes.charCodeAt(source_idx + current_idx);
        for (; current_idx < copy_length; current_idx++) target_array[target_idx + current_idx] = 0;
      }
    }
  },
  get_character_code: function(index_pos)
  {
    var current_array = this.charArray;
    if (current_array) return current_array[index_pos];
    var current_bytes = this.byteSequence;
    if (current_bytes == null) current_bytes = this.to_byte_sequence();
    return (index_pos < this.lastByteIndex) ? current_bytes.charCodeAt(index_pos) : 0;
  },
  get_character_code_safe: function(index_pos)
  {
    if (!this.dataLength) this.to_byte_sequence();
    if ((index_pos < 0) || (index_pos >= this.dataLength)) signal_bounds_violation();
    return this.get_character_code(index_pos);
  },
  set_character_code: function(index_pos, char_code)
  {
    var current_array = this.charArray;
    if (!current_array)
    {
      if (this.lastByteIndex == index_pos)
      {
        this.byteSequence += String.fromCharCode(char_code & 0xff);
        this.lastByteIndex++;
        return 0;
      }
      current_array = this.to_char_array();
    }
    else if (this.byteSequence != null)
    {
      this.byteSequence = this.completeByteSequence = this.textValue = null;
    }
    current_array[index_pos] = char_code & 0xff;
    return 0;
  },
  set_character_code_safe: function(index_pos, char_code)
  {
    if (this.dataLength == null) this.to_byte_sequence();
    if ((index_pos < 0) || (index_pos >= this.dataLength)) signal_bounds_violation();
    this.set_character_code(index_pos, char_code);
  },
  fill_region: function(offset_val, region_length, fill_char_code)
  {
    if (offset_val >= this.lastByteIndex && this.lastByteIndex && fill_char_code == 0) return;
    var current_array = this.charArray;
    if (!current_array) current_array = this.to_char_array();
    else if (this.byteSequence != null)
    {
      this.byteSequence = this.completeByteSequence = this.textValue = null;
    }
    var end_index = offset_val + region_length;
    for (var current_idx = offset_val; current_idx < end_index; current_idx++) current_array[current_idx] = fill_char_code;
  },
  compare_with_other: function(other_string)
  {
    if (this.textValue != null && other_string.textValue != null)
    {
      if (this.textValue < other_string.textValue) return -1;
      if (this.textValue > other_string.textValue) return 1;
      return 0;
    }
    var this_full_bytes = this.get_complete_byte_sequence();
    var other_full_bytes = other_string.get_complete_byte_sequence();
    if (this_full_bytes < other_full_bytes) return -1;
    if (this_full_bytes > other_full_bytes) return 1;
    return 0;
  },
  is_equal_to: function(other_string)
  {
    if (this.textValue != null && other_string.textValue != null)
      return this.textValue == other_string.textValue;
    return this.get_complete_byte_sequence() == other_string.get_complete_byte_sequence();
  },
  is_less_than: function(other_string)
  {
    if (this.textValue != null && other_string.textValue != null)
      return this.textValue < other_string.textValue;
    return this.get_complete_byte_sequence() < other_string.get_complete_byte_sequence();
  },
  is_less_or_equal: function(other_string)
  {
    if (this.textValue != null && other_string.textValue != null)
      return this.textValue <= other_string.textValue;
    return this.get_complete_byte_sequence() <= other_string.get_complete_byte_sequence();
  }
}
function WrappedDataString(source_string_value) { this.textValue = source_string_value; }
WrappedDataString.prototype = new DataString();
function ConstructedDataString(initial_length) { this.byteSequence = ""; this.dataLength = initial_length; }
ConstructedDataString.prototype = new DataString();
function get_array_element(target_array, element_index)
{
  if ((element_index < 0) || (element_index >= target_array.length - 1)) signal_bounds_violation();
  return target_array[element_index + 1];
}
function set_array_element(target_array, element_index, new_value)
{
  if ((element_index < 0) || (element_index >= target_array.length - 1)) signal_bounds_violation();
  target_array[element_index + 1] = new_value; return 0;
}
function generic_caller(target_function, function_arguments)
{
  if (target_function.fun)
    return generic_caller(target_function.fun, function_arguments);
  var num_params = target_function.length;
  var param_difference = num_params - function_arguments.length;
  if (param_difference == 0)
    return target_function.apply(null, function_arguments);
  else if (param_difference < 0)
    return generic_caller(target_function.apply(null, function_arguments.slice(0, num_params)), function_arguments.slice(num_params));
  else
    return function(single_arg) { return generic_caller(target_function, function_arguments.concat([single_arg])); };
}
function parse_format_specification(format_string)
{
  format_string = format_string.to_string_representation();
  var string_len = format_string.length;
  if (string_len > 31) throw_invalid_input("format_int: format too long");
  var format_options =
    { justify_mode: '+', sign_style_char: '-', fill_char: ' ', is_alternate_form: false,
      radix_base: 0, is_signed_conversion: false, field_width: 0, is_uppercase: false,
      sign_val: 1, precision_val: -1, conversion_type: 'f' };
  for (var char_idx = 0; char_idx < string_len; char_idx++)
  {
    var current_char = format_string.charAt(char_idx);
    switch (current_char)
    {
    case '-':
      format_options.justify_mode = '-'; break;
    case '+': case ' ':
      format_options.sign_style_char = current_char; break;
    case '0':
      format_options.fill_char = '0'; break;
    case '#':
      format_options.is_alternate_form = true; break;
    case '1': case '2': case '3': case '4': case '5':
    case '6': case '7': case '8': case '9':
      format_options.field_width = 0;
      while (current_char = format_string.charCodeAt(char_idx) - 48, current_char >= 0 && current_char <= 9)
      {
        format_options.field_width = format_options.field_width * 10 + current_char; char_idx++;
      }
      char_idx--;
      break;
    case '.':
      format_options.precision_val = 0;
      char_idx++;
      while (current_char = format_string.charCodeAt(char_idx) - 48, current_char >= 0 && current_char <= 9)
      {
        format_options.precision_val = format_options.precision_val * 10 + current_char; char_idx++;
      }
      char_idx--;
    case 'd': case 'i':
      format_options.is_signed_conversion = true; /* fallthrough */
    case 'u':
      format_options.radix_base = 10; break;
    case 'x':
      format_options.radix_base = 16; break;
    case 'X':
      format_options.radix_base = 16; format_options.is_uppercase = true; break;
    case 'o':
      format_options.radix_base = 8; break;
    case 'e': case 'f': case 'g':
      format_options.is_signed_conversion = true; format_options.conversion_type = current_char; break;
    case 'E': case 'F': case 'G':
      format_options.is_signed_conversion = true; format_options.is_uppercase = true;
      format_options.conversion_type = current_char.toLowerCase(); break;
    }
  }
  return format_options;
}
function complete_format_processing(format_spec, raw_output_buffer)
{
  if (format_spec.is_uppercase) raw_output_buffer = raw_output_buffer.toUpperCase();
  var final_len = raw_output_buffer.length;
  if (format_spec.is_signed_conversion && (format_spec.sign_val < 0 || format_spec.sign_style_char != '-')) final_len++;
  if (format_spec.is_alternate_form)
  {
    if (format_spec.radix_base == 8) final_len += 1;
    if (format_spec.radix_base == 16) final_len += 2;
  }
  var formatted_buffer = "";
  if (format_spec.justify_mode == '+' && format_spec.fill_char == ' ')
    for (var idx = final_len; idx < format_spec.field_width; idx++) formatted_buffer += ' ';
  if (format_spec.is_signed_conversion)
  {
    if (format_spec.sign_val < 0) formatted_buffer += '-';
    else if (format_spec.sign_style_char != '-') formatted_buffer += format_spec.sign_style_char;
  }
  if (format_spec.is_alternate_form && format_spec.radix_base == 8) formatted_buffer += '0';
  if (format_spec.is_alternate_form && format_spec.radix_base == 16) formatted_buffer += "0x";
  if (format_spec.justify_mode == '+' && format_spec.fill_char == '0')
    for (var idx = final_len; idx < format_spec.field_width; idx++) formatted_buffer += '0';
  formatted_buffer += raw_output_buffer;
  if (format_spec.justify_mode == '-')
    for (var idx = final_len; idx < format_spec.field_width; idx++) formatted_buffer += ' ';
  return new WrappedDataString(formatted_buffer);
}
function format_integer_value(format_specifier, integer_val)
{
  if (format_specifier.to_string_representation() == "%d") return new WrappedDataString("" + integer_val);
  var spec_config = parse_format_specification(format_specifier);
  if (integer_val < 0) { if (spec_config.is_signed_conversion) { spec_config.sign_val = -1; integer_val = -integer_val; } else integer_val >>>= 0; }
  var string_representation = integer_val.toString(spec_config.radix_base);
  if (spec_config.precision_val >= 0)
  {
    spec_config.fill_char = ' ';
    var needed_padding = spec_config.precision_val - string_representation.length;
    if (needed_padding > 0) string_representation = string_duplicator(needed_padding, '0') + string_representation;
  }
  return complete_format_processing(spec_config, string_representation);
}
function compare_long_integers(first_val, second_val)
{
  var first_val_high = first_val[3] << 16;
  var second_val_high = second_val[3] << 16;
  if (first_val_high > second_val_high) return 1;
  if (first_val_high < second_val_high) return -1;
  if (first_val[2] > second_val[2]) return 1;
  if (first_val[2] < second_val[2]) return -1;
  if (first_val[1] > second_val[1]) return 1;
  if (first_val[1] < second_val[1]) return -1;
  return 0;
}
function compare_integers(int_a, int_b)
{
  if (int_a < int_b) return (-1); if (int_a == int_b) return 0; return 1;
}
function compare_arbitrary_values(val_a, val_b, is_total_comparison)
{
  let comparison_stack = [];
  for (;;)
  {
    if (!(is_total_comparison && val_a === val_b))
    {
      if (val_a instanceof DataString)
      {
        if (val_b instanceof DataString)
        {
          if (val_a != val_b)
          {
            let comparison_result = val_a.compare_with_other(val_b);
            if (comparison_result != 0) return comparison_result;
          }
        } else
          return 1;
      } else if (val_a instanceof Array && val_a[0] === (val_a[0] | 0))
      {
        var type_a = val_a[0];
        if (type_a === 250)
        {
          val_a = val_a[1];
          continue;
        } else if (val_b instanceof Array && val_b[0] === (val_b[0] | 0))
        {
          var type_b = val_b[0];
          if (type_b === 250)
          {
            val_b = val_b[1];
            continue;
          } else if (type_a != type_b)
          {
            return (type_a < type_b) ? -1 : 1;
          } else
          {
            switch (type_a)
            {
              case 248: {
                let comparison_result = compare_integers(val_a[2], val_b[2]);
                if (comparison_result != 0) return comparison_result;
                break;
              }
              case 255: {
                let comparison_result = compare_long_integers(val_a, val_b);
                if (comparison_result != 0) return comparison_result;
                break;
              }
              default:
                if (val_a.length != val_b.length) return (val_a.length < val_b.length) ? -1 : 1;
                if (val_a.length > 1) comparison_stack.push(val_a, val_b, 1);
            }
          }
        } else
          return 1;
      } else if (val_b instanceof DataString ||
        (val_b instanceof Array && val_b[0] === (val_b[0] | 0)))
      {
        return -1;
      } else
      {
        if (val_a < val_b) return -1;
        if (val_a > val_b) return 1;
        if (is_total_comparison && val_a != val_b)
        {
          if (val_a == val_a) return 1;
          if (val_b == val_b) return -1;
        }
      }
    }
    if (comparison_stack.length == 0) return 0;
    var current_index = comparison_stack.pop();
    val_b = comparison_stack.pop();
    val_a = comparison_stack.pop();
    if (current_index + 1 < val_a.length) comparison_stack.push(val_a, val_b, current_index + 1);
    val_a = val_a[current_index];
    val_b = val_b[current_index];
  }
}
function perform_comparison(val_a, val_b) { return compare_arbitrary_values(val_a, val_b, true); }
function is_greater_or_equal(value_x, value_y) { return +(perform_comparison(value_x, value_y, false) >= 0); }
function extract_sign_and_radix(source_string)
{
  var current_idx = 0, numeric_base = 10, extracted_sign = source_string.get_character_code(0) == 45 ? (current_idx++, -1) : 1;
  if (source_string.get_character_code(current_idx) == 48)
    switch (source_string.get_character_code(current_idx + 1))
    {
      case 120: case 88: numeric_base = 16; current_idx += 2; break;
      case 111: case 79: numeric_base = 8; current_idx += 2; break;
      case 98: case 66: numeric_base = 2; current_idx += 2; break;
    }
  return [current_idx, extracted_sign, numeric_base];
}
function convert_char_to_digit(char_code)
{
  if (char_code >= 48 && char_code <= 57) return char_code - 48;
  if (char_code >= 65 && char_code <= 90) return char_code - 55;
  if (char_code >= 97 && char_code <= 122) return char_code - 87;
  return -1;
}
var global_app_data = [0];
function terminate_with_error(error_message_text)
{
  raise_exception_with_message(global_app_data[3], error_message_text);
}
function convert_string_to_integer(input_string)
{
  var parsed_info = extract_sign_and_radix(input_string);
  var current_idx = parsed_info[0], sign_multiplier = parsed_info[1], numeric_base = parsed_info[2];
  var overflow_threshold = -1 >>> 0;
  var current_char_code = input_string.get_character_code(current_idx);
  var digit_value = convert_char_to_digit(current_char_code);
  if (digit_value < 0 || digit_value >= numeric_base) terminate_with_error("int_of_string");
  var final_result = digit_value;
  for (;;)
  {
    current_idx++;
    current_char_code = input_string.get_character_code(current_idx);
    if (current_char_code == 95) continue;
    digit_value = convert_char_to_digit(current_char_code);
    if (digit_value < 0 || digit_value >= numeric_base) break;
    final_result = numeric_base * final_result + digit_value;
    if (final_result > overflow_threshold) terminate_with_error("int_of_string");
  }
  if (current_idx != input_string.get_data_length()) terminate_with_error("int_of_string");
  final_result = sign_multiplier * final_result;
  if ((final_result | 0) != final_result) terminate_with_error("int_of_string");
  return final_result;
}
function retrieve_js_logger()
{
  var console_obj = this.console ? this.console : {};
  var method_names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
    "trace", "group", "groupCollapsed", "groupEnd", "time", "timeEnd"];
  function dummy_func() { }
  for (var method_idx = 0; method_idx < method_names.length; method_idx++) if (!console_obj[method_names[method_idx]]) console_obj[method_names[method_idx]] = dummy_func;
  return console_obj;
}
function convert_js_to_list(js_array) { return [0].concat(js_array); }
function create_vector_list(vector_length, initial_value)
{
  var new_list = [0]; for (var list_idx = 1; list_idx <= vector_length; list_idx++) new_list[list_idx] = initial_value; return new_list;
}
function get_output_channels() { return 0; }
function register_global_item(item_number, item_value) { global_app_data[item_number + 1] = item_value; }
var registered_named_entities = {};
function add_named_entity(entity_name, entity_value)
{
  registered_named_entities[entity_name] = entity_value; return 0;
}
(function()
{
  // Helper for applying functions with two arguments, handling currying.
  function apply_two_arguments(func_ref, arg_one, arg_two)
  { return func_ref.length == 2 ? func_ref(arg_one, arg_two) : generic_caller(func_ref, [arg_one, arg_two]); }
  // Helper for applying functions with a single argument, handling currying.
  function apply_single_argument(func_ref, single_arg)
  { return func_ref.length == 1 ? func_ref(single_arg) : generic_caller(func_ref, [single_arg]); }
  // Predefined exception data for 'Failure'
  var exception_failure_data = [0, new DataString("Failure")];
  // Predefined exception data for 'Invalid_argument'
  var exception_invalid_arg_data = [0, new DataString("Invalid_argument")];
  // Registering global exception for 'Not_found'
  register_global_item(6, [0, new DataString("Not_found")]);
  // Registering global exception for 'Division_by_zero'
  register_global_item(5, [0, new DataString("Division_by_zero")]);
  // Registering global exception for 'Invalid_argument'
  register_global_item(3, exception_invalid_arg_data);
  // Registering global exception for 'Failure'
  register_global_item(2, exception_failure_data);
  // Format string for decimal integers
  var decimal_format_spec = new DataString("%d");
  // Identifier for the Pervasives.Exit exception
  var exit_message_str = new DataString("Pervasives.Exit");
  // Identifier for the Pervasives.do_at_exit hook
  var shutdown_hook_name = new DataString("Pervasives.do_at_exit");
  // Representation for an empty list
  var empty_list_repr = [0, 0, 0];
  // Error message for split_n function
  var split_error_msg = new DataString("split_n");
  // Message indicating no game found
  var no_game_str = new DataString("NO GAME");
  // Error message for nil list
  var nil_list_error = new DataString("list is nil");
  // Error message for input operation
  var input_error_msg = new DataString("get_input");
  // Regex string for whitespace
  var whitespace_regex_str = new DataString("\\s");
  // Function to raise an invalid input error
  function raise_input_error(message_content)
  { throw [0, exception_invalid_arg_data, message_content]; }
  // Exit exception data
  var exit_exception_data = [0, exit_message_str];
  // Selects the maximum of two numbers
  function select_maximum(val_p, val_o)
  { return is_greater_or_equal(val_p, val_o) ? val_p : val_o; }
  // Recursively reverses a list structure
  function recursive_list_reverser(input_list_head, accumulator_list)
  {
    if (input_list_head)
    {
      var current_item = input_list_head[1];
      return [0, current_item, recursive_list_reverser(input_list_head[2], accumulator_list)];
    }
    return accumulator_list;
  }
  // Flushes all output channels
  function flush_all_channels(dummy_arg)
  {
    var channel_list = get_output_channels(0);
    for (;;)
    {
      if (channel_list)
      {
        var next_channel = channel_list[2];
        try { } catch (flush_error) { }
        var channel_list = next_channel;
        continue;
      }
      return 0;
    }
  }
  // Registering the shutdown hook
  add_named_entity(shutdown_hook_name, flush_all_channels);
  // Converts a JS array into an OCaml-style list
  function convert_array_to_list(js_array_input)
  {
    var array_count = js_array_input.length - 1 - 1 | 0, current_list = 0;
    for (;;)
    {
      if (0 <= array_count)
      {
        var new_list_node = [0, js_array_input[array_count + 1], current_list], decremented_count = array_count - 1 | 0, array_count = decremented_count, current_list = new_list_node;
        continue;
      }
      return current_list;
    }
  }
  // Flattens a list of lists
  function flatten_list_of_lists(list_of_lists)
  {
    if (list_of_lists)
    {
      var inner_list_head = list_of_lists[1];
      return recursive_list_reverser(inner_list_head, flatten_list_of_lists(list_of_lists[2]));
    }
    return 0;
  }
  // Maps a function over list elements
  function map_list_elements(mapping_func, input_list)
  {
    if (input_list)
    {
      var list_tail = input_list[2], mapped_head = apply_single_argument(mapping_func, input_list[1]);
      return [0, mapped_head, map_list_elements(mapping_func, list_tail)];
    }
    return 0;
  }
  // Initial list for mapping operations
  var initial_mapper_list = [0, 0];
  // JavaScript's RegExp constructor
  var RegExp_constructor = RegExp;
  // JavaScript's Array constructor
  var Array_constructor = Array;
  // Identity function
  function identity_function(value_x)
  { return value_x; }
  // Wraps a value in MlWrappedString or returns 0 if it's an Array
  function wrap_or_zero(input_val)
  { return input_val instanceof Array_constructor ? 0 : [0, new WrappedDataString(input_val.to_string_representation())]; }
  // Setting up the initial mapper list
  initial_mapper_list[1] = [0, wrap_or_zero, initial_mapper_list[1]];
  // Reference to the browser console object
  var console_logger = retrieve_js_logger(0);
  // Reverse function application
  function reverse_application(value_y, func_x)
  { return apply_single_argument(func_x, value_y); }
  // Converts a value to its string representation
  function to_string_converter(value_input)
  { return value_input.to_string_representation(); }
  // Logs a value to the console
  function log_value_to_console(value_to_log)
  { return console_logger.log(to_string_converter(value_to_log)); }
  // Generates a list of integers within a range
  function generate_range_list(start_val, end_val)
  {
    var comparison_res = start_val < end_val ? 1 : 0, range_list = comparison_res ? [0, start_val, generate_range_list(start_val + 1 | 0, end_val)] : comparison_res;
    return range_list;
  }
  // Splits a list at a given index
  function split_list_at_index(split_position, source_list)
  {
    if (source_list)
    {
      if (0 < split_position)
      {
        var recursive_split = split_list_at_index(split_position - 1 | 0, source_list[2]);
        return [0, [0, source_list[1], recursive_split[1]], recursive_split[2]];
      }
      return [0, 0, source_list];
    }
    return 0 === split_position ? empty_list_repr : raise_input_error(split_error_msg);
  }
  // Parses an integer from a DataString
  function parse_integer_from_string(string_data)
  { return convert_string_to_integer(string_data); }
  // Folds (reduces) a list using a binary operation
  function fold_list_elements(input_list_to_fold, binary_operation)
  {
    if (input_list_to_fold)
    {
      var head_element = input_list_to_fold[1], tail_elements = input_list_to_fold[2];
      for (;;)
      {
        if (tail_elements)
        {
          var next_tail = tail_elements[2], accumulated_val = apply_two_arguments(binary_operation, head_element, tail_elements[1]), head_element = accumulated_val, tail_elements = next_tail;
          continue;
        }
      return head_element;
      }
    }
    return raise_input_error(nil_list_error);
  }
  // This function, despite its name, finds the maximum element in the list.
  function sum_list_elements(list_of_numbers)
  { return fold_list_elements(list_of_numbers, select_maximum); }
  // Processes sub-lists based on a length parameter
  function process_sub_lists(chunk_length, list_data_source)
  {
    // Inner helper function to extract a chunk
    function extract_chunk(current_list)
    {
      // Recursive function to get 'count' elements
      function get_n_elements(count_val, source_list)
      {
        if (0 === count_val) return 0;
        if (source_list)
        {
          var next_elements = get_n_elements(count_val - 1 | 0, source_list[2]);
          return [0, source_list[1], next_elements];
        }
        throw [0, exit_exception_data]; // Throws the Exit exception
      }
      try
      {
        var extracted_chunk_result = [0, get_n_elements(chunk_length, current_list)], successful_extraction = extracted_chunk_result;
      }
      catch (catch_exception)
      {
        // If the exception is not the Exit exception, re-throw it
        if (catch_exception[1] !== exit_exception_data) throw catch_exception;
        var successful_extraction = 0; // Indicate failure to extract chunk
      }
      // If a chunk was successfully extracted
      if (successful_extraction)
      {
        var chunk_elements = successful_extraction[1], chunk_sum = fold_list_elements(chunk_elements, function(val_c, val_d)
        { return val_c + val_d | 0; }); // Sums elements in the chunk
        // If there's more list data, continue processing recursively
        if (current_list) return [0, chunk_sum, extract_chunk(current_list[2])];
        var final_chunk_result = [0, chunk_length, 0]; // Represents the final chunk
      }
      else
      {
        var final_chunk_result = successful_extraction; // No successful extraction
      }
      return final_chunk_result;
    }
    return sum_list_elements(extract_chunk(list_data_source));
  }
  // Reads input, processes it, and prints the result.
  var input_file_content = require("fs").readFileSync("/dev/stdin", "utf8");
  // Transforms each line of input into a WrappedDataString.
  var transform_input_lines = apply_single_argument(map_list_elements, function(current_line_str) { return new WrappedDataString(current_line_str); });
  // Converts a JavaScript array to an OCaml-style list.
  function convert_to_js_array_list(input_array_data) { return convert_js_to_list(input_array_data); }
  // Main processing pipeline for the input data.
  var processed_input_data = reverse_application(reverse_application(reverse_application(reverse_application(input_file_content.split(new RegExp_constructor(to_string_converter(whitespace_regex_str))), identity_function), convert_to_js_array_list), convert_array_to_list), transform_input_lines);
  for (;;)
  {
    if (processed_input_data)
    {
      var remaining_data = processed_input_data[2];
      if (remaining_data)
      {
        var first_int_val = parse_integer_from_string(processed_input_data[1]), second_int_val = parse_integer_from_string(remaining_data[1]);
        if (0 === first_int_val && 0 === second_int_val)
        {
          var result_accumulator = 0, is_zero_condition = 1;
        }
        else
        {
          var is_zero_condition = 0;
        }
        if (!is_zero_condition)
        {
          var split_result_list = split_list_at_index(first_int_val, remaining_data[2]), tail_of_split = split_result_list[2], result_accumulator = [0, [0, first_int_val, second_int_val, map_list_elements(parse_integer_from_string, split_result_list[1]), tail_of_split]];
        }
        if (result_accumulator)
        {
          var current_item_details = result_accumulator[1], item_sub_list = current_item_details[3], item_second_val = current_item_details[2], item_first_val = current_item_details[1], processed_sub_list_sum = process_sub_lists(item_second_val, item_sub_list), first_range_list = generate_range_list(0, item_first_val), second_range_list = generate_range_list(0, item_first_val), nested_mapped_list = flatten_list_of_lists(map_list_elements(function(list_param_a)
          {
            return function(list_param_b)
            {
              return map_list_elements(function(list_param_c)
              { return [0, list_param_b, list_param_c]; }, list_param_a);
            };
          }(first_range_list), second_range_list)), final_processed_sum = sum_list_elements(map_list_elements(function(list_param_a, list_param_b)
          {
            return function(list_item_val)
            {
              var element_at_index_b = list_item_val[2], element_at_index_a = list_item_val[1];
              // Initialize a mutable vector for array operations.
              // The `create_vector_list` function returns an array with a 0 at index 0.
              // Its elements are at indices 1 to length.
              if (list_param_a)
              {
                var current_element_idx = 0, current_list_node = list_param_a, temp_vector_list_base_value = list_param_a[1];
                for (;;)
                {
                  if (current_list_node)
                  {
                    var next_list_node = current_list_node[2], incremented_idx = current_element_idx + 1 | 0, current_element_idx = incremented_idx, current_list_node = next_list_node;
                    continue;
                  }
                  // Create a new vector (JS array) of the appropriate size.
                  // This matches caml_make_vect's behavior of having 0 at index 0.
                  var mutable_vector = create_vector_list(current_element_idx, temp_vector_list_base_value), vector_index = 1, current_list_node_copy = list_param_a;
                  for (;;)
                  {
                    if (current_list_node_copy)
                    {
                      var next_list_node_copy = current_list_node_copy[2];
                      mutable_vector[vector_index + 1] = current_list_node_copy[1];
                      var incremented_vector_idx = vector_index + 1 | 0, vector_index = incremented_vector_idx, current_list_node_copy = next_list_node_copy;
                      continue;
                    }
                    break;
                  }
                  break;
                }
              }
              else
              {
                var mutable_vector = [0]; // Empty vector representation
              }
              // Get and set elements, simulating a swap.
              var value_at_a = get_array_element(mutable_vector, element_at_index_a);
              set_array_element(mutable_vector, element_at_index_a, get_array_element(mutable_vector, element_at_index_b));
              set_array_element(mutable_vector, element_at_index_b, value_at_a);
              // Process the modified vector.
              return process_sub_lists(list_param_b, convert_array_to_list(mutable_vector));
            };
          }(item_sub_list, item_second_val), nested_mapped_list));
          if (final_processed_sum < processed_sub_list_sum) log_value_to_console(no_game_str);
          else log_value_to_console(format_integer_value(decimal_format_spec, final_processed_sum - processed_sub_list_sum | 0));
          var next_item_data = current_item_details[4], processed_input_data = next_item_data;
          continue;
        }
        flush_all_channels(0);
        return;
      }
      throw [0, exception_failure_data, input_error_msg];
    }
  }());