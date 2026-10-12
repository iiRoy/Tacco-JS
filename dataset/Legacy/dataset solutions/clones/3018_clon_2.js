'use strict'

class Processor {
  execute_task() {
    const count_val = data_source.fetch_integer();
    const items_collection = Array.from(data_source.fetch_line()).map(item_char => item_char === '#' ? 1 : 0);

    let leading_skip_flag = true;
    const processed_segment = [];

    for (let current_index = 0; current_index < count_val; ++current_index) {
      if (items_collection[current_index] === 1) leading_skip_flag = false;
      if (leading_skip_flag) {
        continue;
      }
      processed_segment.push(items_collection[current_index]);
    }

    let effective_length_val = processed_segment.length;
    for (let current_index = processed_segment.length - 1; current_index >= 0; --current_index) {
      if (processed_segment[current_index] === 0) {
        break;
      }
      effective_length_val = current_index;
    }

    const trimmed_segment = processed_segment.slice(0, effective_length_val);
    if (trimmed_segment.length === 0) return 0;

    const ones_representation = trimmed_segment;
    const zeros_representation = trimmed_segment.map(element_val => element_val === 1 ? 0 : 1);

    const sum_of_ones_arr = _util.compute_prefix_sums(ones_representation);
    const sum_of_zeros_arr = _util.compute_prefix_sums(zeros_representation);
    const total_ones_count = _util.calculate_sum(ones_representation);
    const total_zeros_count = _util.calculate_sum(zeros_representation);

    const adjusted_prefix_values = [];
    adjusted_prefix_values.push(total_zeros_count);

    for (let idx_pos = 0; idx_pos < ones_representation.length; ++idx_pos) {
      adjusted_prefix_values.push(sum_of_ones_arr[idx_pos] + (total_zeros_count - sum_of_zeros_arr[idx_pos]));
    }

    return _util.find_minimum(adjusted_prefix_values);
  }
}

class ArithmeticModule {
  constructor(divisor_val_param) {
    if (divisor_val_param == null) {
      divisor_val_param = CombinatorialUtils.DefaultModulus;
    }
    this.divisor_value = divisor_val_param;
  }
  multiply_mod(factor_a, factor_b) {
    let result_product = 0;
    factor_a %= this.divisor_value;
    factor_b %= this.divisor_value;
    while (factor_b) {
      if (factor_b & 1) {
        result_product += factor_a;
        if (result_product >= this.divisor_value) {
          result_product -= this.divisor_value;
        }
      }
      factor_a <<= 1;
      if (factor_a >= this.divisor_value) {
        factor_a -= this.divisor_value;
      }
      factor_b >>= 1;
    }
    return result_product;
  }
  power_mod(base_val, exponent_val) {
    let final_result = 1;
    while (exponent_val) {
      if (exponent_val & 1) {
        final_result = this.multiply_mod(final_result, base_val);
      }
      base_val = this.multiply_mod(base_val, base_val);
      exponent_val >>= 1;
    }
    return final_result;
  }
  divide_mod(numerator, denominator) {
    return this.multiply_mod(numerator, this.power_mod(denominator, this.divisor_value - 2))
  }
  combinations_mod(n_val, k_val) {
    return ARITH_MOD.multiply_mod(factorial_cache[n_val], ARITH_MOD.multiply_mod(inverse_factorial_cache[k_val], inverse_factorial_cache[n_val - k_val]));
  }
}
const ARITH_MOD = new ArithmeticModule(998244353);

class UtilityHelper {
  calculate_sum(elements_list) {
    return elements_list.reduce((accumulator, current_value) => accumulator + current_value);
  }
  calculate_mod_sum(elements_list, modulus_val) {
    if (modulus_val == null) {
      modulus_val = ARITH_MOD.divisor_value;
    }
    return elements_list.reduce((accumulator, current_value) => (accumulator + current_value) % modulus_val);
  }
  find_minimum(elements_list, comparison_func) {
    if (comparison_func == null) {
      comparison_func = (val_a, val_b) => val_a - val_b
    }
    return elements_list.reduce((min_val, current_val) => comparison_func(min_val, current_val) < 0 ? min_val : current_val);
  }
  find_maximum(elements_list, comparison_func) {
    if (comparison_func == null) {
      comparison_func = (val_a, val_b) => val_a - val_b
    }
    return elements_list.reduce((max_val, current_val) => comparison_func(max_val, current_val) > 0 ? max_val : current_val);
  }
  arrange_elements(elements_list, comparison_func) {
    if (comparison_func == null) {
      comparison_func = (val_a, val_b) => val_a - val_b
    }
    return elements_list.sort(comparison_func)
  }
  get_unique(elements_list) {
    elements_list.sort();
    for (let index_pos = 0; index_pos < elements_list.length - 1; ++index_pos) {
      elements_list[index_pos] = elements_list[index_pos + 1] === elements_list[index_pos] ? null : elements_list[index_pos];
    }
    return elements_list.filter(item_val => item_val != null);
  }
  generate_sequence(start_point, end_point, step_size) {
    if (end_point == null) {
      end_point = start_point || 0;
      start_point = 0;
    }
    if (!step_size) {
      step_size = end_point < start_point ? -1 : 1;
    }
    const sequence_length = Math.max(Math.ceil((end_point - start_point) / step_size), 0);
    const number_sequence = Array(sequence_length);
    for (var sequence_index = 0; sequence_index < sequence_length; sequence_index++, start_point += step_size) {
      number_sequence[sequence_index] = start_point;
    }
    return number_sequence;
  }
  get_first(target_array, num_elements) {
    if (target_array == null || target_array.length < 1) return num_elements == null ? void 0 : [];
    if (num_elements == null) return target_array[0];
    return this.get_initial_segment(target_array, target_array.length - num_elements);
  };
  get_initial_segment(target_array, num_to_exclude) {
    return target_array.slice.call(target_array, 0, Math.max(0, target_array.length - (num_to_exclude == null ? 1 : num_to_exclude)));
  }
  get_trailing_segment(target_array, num_to_skip) {
    return target_array.slice.call(target_array, num_to_skip == null ? 1 : num_to_skip);
  }
  get_last(target_array, num_elements) {
    if (num_elements == null) return target_array[target_array.length - 1];
    return this.get_trailing_segment(target_array, Math.max(0, target_array.length - num_elements));
  }
  compute_prefix_sums(source_array) {
    return this.get_trailing_segment(source_array.reduce(((acc_array, current_val, current_idx) => {
      acc_array.push(current_val + acc_array[current_idx]);
      return acc_array
    }), [0]));
  }
  compute_differences(source_array) {
    const diff_results = [];
    for (let index_pos = 1; index_pos < source_array.length; ++index_pos) {
      diff_results.push(source_array[index_pos] - source_array[index_pos - 1]);
    }
    return diff_results;
  }
  locate_index(sorted_array, search_key_val, value_accessor) {
    const access_func = (obj_item) => (typeof obj_item === 'object') ? obj_item[value_accessor] : obj_item;
    const target_value = access_func(search_key_val);
    let lower_bound = 0,
      upper_bound = sorted_array.length;
    while (lower_bound < upper_bound) {
      let middle_index = Math.floor((lower_bound + upper_bound) / 2);
      if (access_func(sorted_array[middle_index]) < target_value) lower_bound = middle_index + 1;
      else upper_bound = middle_index;
    }
    return lower_bound;
  };
}
const _util = new UtilityHelper();

class DataReader {
  constructor() {
    this.read_pointer = 0;
    this.read_all_data();
  }

  read_all_data() {
    this.input_lines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.input_lines;
  }

  fetch_line(num_lines) {
    if (num_lines) {
      const grabbed_lines = this.input_lines.slice(this.read_pointer, this.read_pointer + num_lines);
      this.read_pointer += num_lines;
      return grabbed_lines;
    }
    return this.input_lines[this.read_pointer++];
  }
  fetch_integer() {
    return parseInt(this.fetch_line());
  }
  fetch_string_array() {
    return this.fetch_line().split(' ');
  }
  fetch_integer_array() {
    return this.fetch_string_array().map((str_element) => parseInt(str_element));
  }
  fetch_float_array() {
    return this.fetch_string_array().map((str_element) => parseFloat(str_element));
  }
  fetch_multi_integer_lines(num_lines) {
    return this.fetch_line(num_lines).map((line_str) => parseInt(line_str))
  }
  fetch_multi_float_lines(num_lines) {
    return this.fetch_line(num_lines).map((line_str) => parseFloat(line_str))
  }
  fetch_string_matrix(num_lines) {
    return this.fetch_line(num_lines).map((line_str) => line_str.split(' '));
  }
  fetch_integer_matrix(num_lines) {
    return this.fetch_line(num_lines).map((line_str) => line_str.split(' ').map((str_element) => parseInt(str_element)));
  }
  fetch_float_matrix(num_lines) {
    return this.fetch_line(num_lines).map((line_str) => line_str.split(' ').map((str_element) => parseFloat(str_element)));
  }
}
const data_source = new DataReader();

class OutputHandler {
  constructor() {
    this.bool_text_map = {
      'true': 'Yes',
      'false': 'No',
    };
  }
  display_result(output_data) {
    let result_to_print;
    if (output_data == null) return;
    if (output_data === true) {
      result_to_print = this.bool_text_map['true'];
    } else if (output_data === false) {
      result_to_print = this.bool_text_map['false'];
    } else {
      result_to_print = output_data;
    }
    console.log(result_to_print);
  }
  configure_bool_output(custom_options) {
    this.bool_text_map['false'] = custom_options[0];
    this.bool_text_map['true'] = custom_options[1];
    return this;
  }
}
const result_writer = new OutputHandler();

result_writer.display_result(new Processor().execute_task());