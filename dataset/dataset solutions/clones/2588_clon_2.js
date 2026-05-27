var input_reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var input_processor;
var input_lines = [];

input_reader.on('line', function(current_line_data) {
  input_lines.push(current_line_data);
});

input_reader.on('close', function() {
  input_processor = initialize_input_handler(input_lines);
  console.error('\n↑入力 ↓出力');
  execute_main_logic();
});

function create_copy(original_object) {
  return (original_object instanceof Set) ? new Set(Array.from(original_object)) : JSON.parse(JSON.stringify(original_object));
}

function get_next_integer() {
  return convert_input_data(fetch_next_item(), 1);
}

function get_next_string_array() {
  return convert_input_data(fetch_next_item(), 2);
}

function get_next_integer_array() {
  return convert_input_data(fetch_next_item(), 4);
}

function get_next_char_array() {
  return convert_input_data(fetch_next_item(), 6);
}

function fetch_next_item() {
  return input_processor.fetch_next_item();
}

function has_more_items() {
  return input_processor.has_more_items();
}

function initialize_input_handler(raw_lines) {
  return {
    data_lines: raw_lines,
    current_idx: 0,
    max_idx: raw_lines.length,
    has_more_items: function() {
      return (this.current_idx < this.max_idx);
    },
    fetch_next_item: function() {
      if (this.has_more_items()) {
        return this.data_lines[this.current_idx++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

function print_output(message_content) {
  console.log(message_content);
}

function print_debug_info(message_content) {
  console.error('debug:' + require('util').inspect(message_content, false, null));
}

function convert_input_data(input_value, conversion_type) {
  try {
    switch (conversion_type) {
      case 1:
        return parseInt(input_value);
      case 2:
        return input_value.split(' ');
      case 4:
        return input_value.split(' ').map(Number);
      case 6:
        return input_value.split('');
      case 7:
        return input_value.split('').map(Number);
      case 8:
        return input_value.join(' ');
      case 9:
        return input_value.join('\n');
      case 0:
        return input_value.join('');
      default:
        return input_value;
    }
  } catch (error_obj) {
    return input_value;
  }
}

function execute_main_logic() {
  var count_val = get_next_integer();
  var number_sequence = get_next_integer_array();

  number_sequence.sort(function(elem_a, elem_b) {
    return elem_a - elem_b;
  });

  var primary_collection = [];
  primary_collection.push(number_sequence.pop());

  for (var outer_idx = 0; outer_idx < count_val; outer_idx++) {
    var secondary_collection = [];
    for (var inner_idx = 0; inner_idx < (1 << outer_idx); inner_idx++) {
      secondary_collection.push(number_sequence.pop());
    }

    secondary_collection.sort(function(elem_a, elem_b) {
      return elem_b - elem_a;
    });

    primary_collection.sort(function(elem_a, elem_b) {
      return elem_b - elem_a;
    });

    // print_debug_info(primary_collection);
    // print_debug_info(secondary_collection);

    for (var inner_idx = 0; inner_idx < secondary_collection.length; inner_idx++) {
      if (primary_collection[inner_idx] <= secondary_collection[inner_idx]) {
        print_output("No");
        return;
      }
    }
    primary_collection = primary_collection.concat(secondary_collection);
  }
  print_debug_info(primary_collection);
  print_output("Yes");
}
