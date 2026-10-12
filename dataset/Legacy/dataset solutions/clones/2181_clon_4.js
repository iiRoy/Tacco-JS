const input_handler = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let processed_input_data;
const received_lines = [];
input_handler.on('line', function(line_content){received_lines.push(line_content);});
input_handler.on('close', function(){
  processed_input_data = setupInputProcessor(received_lines);
  console.error('\n↑Input ↓Output');
  executeSolution();
});

function deepCopyValue(val_obj){return (val_obj instanceof Set) ? new Set(Array.from(val_obj)) : JSON.parse(JSON.stringify(val_obj));}
function readInt(){return convertInput(getNextToken(),1);}
function readStrArray(){return convertInput(getNextToken(),2);}
function readIntArray(){return convertInput(getNextToken(),4);}
function readCharArray(){return convertInput(getNextToken(),6);}
function getNextToken(){return processed_input_data.retrieveNext();}
function hasMoreTokens(){return processed_input_data.checkHasNext();}

function setupInputProcessor(lines_arr){  
  return {
    source_list : lines_arr, current_idx : 0, max_idx : lines_arr.length,
    checkHasNext : function(){return (this.current_idx < this.max_idx);},
    retrieveNext : function(){if(this.checkHasNext()){return this.source_list[this.current_idx++];}else{throw 'InputExhaustedException ‚No more input available';}}
  };
}
function printResult(output_val){console.log(output_val);}
function logDebug(debug_val){console.error('debug:' + require('util').inspect(debug_val,false,null));}

function convertInput(input_item, conversion_type){
  try{
    switch(conversion_type){
      case 1:return parseInt(input_item);
      case 2:return input_item.split(' ');
      case 4:return input_item.split(' ').map(Number);
      case 6:return input_item.split('');
      case 7:return input_item.split('').map(Number);
      case 8:return input_item.join(' ');
      case 9:return input_item.join('\n');
      case 0:return input_item.join('');
      default:return input_item;
    }
  }catch(e){return input_item;}
}

const memo_count_no_zero = new Map();
function countNumbersWithoutZeroUpToN(num_str) {
  const len = num_str.length;
  memo_count_no_zero.clear();

  function dp_no_zero(index, is_less, has_started) {
    if (index === len) return has_started ? 1 : 0;
    const state_key = `${index}-${is_less}-${has_started}`;
    if (memo_count_no_zero.has(state_key)) return memo_count_no_zero.get(state_key);

    const upper_bound = is_less ? 9 : parseInt(num_str[index]);
    let res = 0;

    if (!has_started) {
      res += dp_no_zero(index + 1, true, false);
    }
    
    for (let digit = 1; digit <= upper_bound; digit++) {
      res += dp_no_zero(index + 1, is_less || (digit < upper_bound), true);
    }
    
    memo_count_no_zero.set(state_key, res);
    return res;
  }
  
  return dp_no_zero(0, false, false);
}

function getRangeNoZeroCount(start_str, end_str) {
  const start_num = parseInt(start_str);
  if (start_num === 0) return countNumbersWithoutZeroUpToN(end_str);
  return countNumbersWithoutZeroUpToN(end_str) - countNumbersWithoutZeroUpToN(String(start_num - 1));
}

function getRangeTotalCount(start_str, end_str) {
  return parseInt(end_str) - parseInt(start_str) + 1;
}

const memo_combinatorial_term = new Map();
function computeCombinatorialTerm(length_param, digits_param) {
  const key = `${length_param}-${digits_param}`;
  if (memo_combinatorial_term.has(key)) return memo_combinatorial_term.get(key);

  if (digits_param <= 0) return 0;

  const count_no_zero_k_digits = Math.pow(9, digits_param);
  const total_k_digits = Math.pow(10, digits_param) - Math.pow(10, digits_param - 1);
  const count_with_zero_k_digits = total_k_digits - count_no_zero_k_digits;

  const num_iterations = length_param - digits_param + 1;
  if (num_iterations <= 0) return 0;

  const M = length_param - digits_param;
  const sum_rem_len_terms = M * num_iterations - (num_iterations - 1) * num_iterations / 2;

  const term_sum = num_iterations * count_no_zero_k_digits + count_with_zero_k_digits * 9 * sum_rem_len_terms;
  
  memo_combinatorial_term.set(key, term_sum);
  return term_sum;
}

function executeSolution(){
  const input_string = getNextToken();
  const block_size = readInt();
  let total_result = 0;

  for (let current_idx = 0; current_idx <= input_string.length - block_size; current_idx++) {
    const remaining_length = input_string.length - (current_idx + block_size);
    const lower_bound_val = Math.pow(10, block_size - 1);
    let upper_bound_val;

    if (current_idx === 0) {
      upper_bound_val = parseInt(input_string.substring(0, block_size));
    } else {
      upper_bound_val = Math.pow(10, block_size) - 1;
    }

    const lower_bound_str = String(lower_bound_val);
    const upper_bound_str = String(upper_bound_val);

    const count_no_zero_in_segment = getRangeNoZeroCount(lower_bound_str, upper_bound_str);
    const total_numbers_in_segment = getRangeTotalCount(lower_bound_str, upper_bound_str);
    const count_with_zero_in_segment = total_numbers_in_segment - count_no_zero_in_segment;

    let segment_contribution = count_no_zero_in_segment;

    let special_zero_k3_count = 0;
    if (block_size === 3) {
      const start_multiple = Math.ceil(lower_bound_val / 100);
      const end_multiple = Math.floor(upper_bound_val / 100);
      special_zero_k3_count = Math.max(0, end_multiple - start_multiple + 1);
    }

    const other_zero_count = count_with_zero_in_segment - special_zero_k3_count;

    segment_contribution += special_zero_k3_count * computeCombinatorialTerm(remaining_length, block_size - 1);
    segment_contribution += other_zero_count * (9 * remaining_length);

    total_result += segment_contribution;
  }
  printResult(total_result);
}

function verifyCount(max_val, target_k){
  let result_count = 0;
  for(let current_num = 1; current_num <= max_val; current_num++){
    const num_str = String(current_num);
    let non_zero_digit_count = 0;
    for(let char_idx = 0; char_idx < num_str.length; char_idx++){
      if(num_str[char_idx] !== '0'){
        non_zero_digit_count++;
      }
    }
    if(non_zero_digit_count === target_k){
      result_count++;
    }
  }
  printResult(result_count);
}
