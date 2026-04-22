"use strict";
var source_data = require("fs").readFileSync("/dev/stdin","utf8");
var data_segments = source_data.split(/ |\n/);
var data_cursor = 0;
function fetch_number(){return +data_segments[data_cursor++];}

var output_cache = [];
function add_to_output(content){output_cache.push(content);}

function recursive_euclidean_algorithm(value_a, value_b){
  if (value_b === 0n) {
    return [1n, 0n, value_a];
  }
  let [prev_x, prev_y, common_divisor] = recursive_euclidean_algorithm(value_b, value_a % value_b);
  let current_x = prev_y;
  let current_y = prev_x - (value_a / value_b) * prev_y;
  return [current_x, current_y, common_divisor];
}

function evaluate_pair(operand_one, operand_two){
  let [coefficient_alpha, coefficient_beta, greatest_common_divisor] = recursive_euclidean_algorithm(BigInt(operand_one), BigInt(operand_two));
  
  if (greatest_common_divisor > 1n) {
    return 9e15; // Placeholder for a very large value
  }

  if (coefficient_alpha === 1n && coefficient_beta < 0n) {
    return Number(operand_two);
  }
  if (coefficient_beta === 1n && coefficient_alpha < 0n) {
    return Number(operand_one);
  }
  
  return 9e15; // Placeholder for a very large value
}

function solve_task(){
  let initial_input_number = fetch_number();

  if (initial_input_number === 1) {
    return 1;
  }

  let final_minimum_result = (2 * initial_input_number) - 1;

  let odd_part_of_number = initial_input_number;
  let power_of_two_multiplier = 2;

  // Extract the odd part and the 2^k factor
  (function find_components_recursively() {
    if (odd_part_of_number % 2 === 0) {
      odd_part_of_number /= 2;
      power_of_two_multiplier *= 2;
      find_components_recursively();
    }
  })();

  let potential_results = [];

  // Recursively process divisors
  function process_divisors_recursively(current_divisor_candidate) {
    if (current_divisor_candidate * current_divisor_candidate > odd_part_of_number) {
      return;
    }

    if (odd_part_of_number % current_divisor_candidate === 0) {
      let complementary_divisor = odd_part_of_number / current_divisor_candidate;
      
      let outcome_a = evaluate_pair(complementary_divisor, current_divisor_candidate * power_of_two_multiplier);
      let outcome_b = evaluate_pair(complementary_divisor * power_of_two_multiplier, current_divisor_candidate);
      
      potential_results.push(outcome_a, outcome_b);
    }
    
    process_divisors_recursively(current_divisor_candidate + 2);
  }
  
  process_divisors_recursively(1); // Start with the first odd divisor

  for (const candidate_value of potential_results) {
    final_minimum_result = Math.min(final_minimum_result, candidate_value);
  }
  
  return final_minimum_result;
}

var program_output = solve_task();
if(program_output !== undefined) console.log(String(program_output));
if(output_cache.length) console.log(output_cache.join("\n"));