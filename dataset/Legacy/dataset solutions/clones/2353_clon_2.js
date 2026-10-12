export_artifact=function(asset_bundle){ var loaded_registry={}; function resolve_asset(asset_id) {
    if (loaded_registry[asset_id]) {
      return loaded_registry[asset_id].exports;
    }
    var current_asset = loaded_registry[asset_id] = { i:asset_id, l:false, exports:{} };
    asset_bundle[asset_id].call(current_asset.exports, current_asset, current_asset.exports, resolve_asset);
    current_asset.l = true;
    return current_asset.exports;
  }
  resolve_asset.m = asset_bundle;
  resolve_asset.c = loaded_registry;
  resolve_asset.d = function(target_object, property_name, getter_func){
    resolve_asset.o(target_object, property_name) || Object.defineProperty(target_object, property_name, { enumerable:true, get:getter_func });
  };
  resolve_asset.r = function(target_mod){
    typeof Symbol !== "undefined" && Symbol.toStringTag && Object.defineProperty(target_mod, Symbol.toStringTag, { value:"Module" });
    Object.defineProperty(target_mod, "__esModule", { value:true });
  };
  resolve_asset.t = function(target_mod, export_mode){
    if (1 & export_mode) {
      target_mod = resolve_asset(target_mod);
    }
    if (8 & export_mode) {
      return target_mod;
    }
    if (4 & export_mode && typeof target_mod === "object" && target_mod && target_mod.__esModule) {
      return target_mod;
    }
    var export_obj = Object.create(null);
    resolve_asset.r(export_obj);
    Object.defineProperty(export_obj, "default", { enumerable:true, value:target_mod });
    if (2 & export_mode && typeof target_mod !== "string") {
      for (var export_key in target_mod) {
        resolve_asset.d(export_obj, export_key, (function(key_name){ return target_mod[key_name]; }).bind(null, export_key));
      }
    }
    return export_obj;
  };
  resolve_asset.n = function(target_mod){
    var export_accessor = target_mod && target_mod.__esModule ? function(){ return target_mod.default; } : function(){ return target_mod; };
    resolve_asset.d(export_accessor, "a", export_accessor);
    return export_accessor;
  };
  resolve_asset.o = function(target_object, property_name){
    return Object.prototype.hasOwnProperty.call(target_object, property_name);
  };
  resolve_asset.p = "";
  return resolve_asset(resolve_asset.s = 0);
}([
  function(mod_obj, mod_exports, obtain_dep){
    "use strict";
    var input_source = obtain_dep(1);
    obtain_dep(2)(input_source.readFileSync("/dev/stdin", "utf8"));
  },
  function(mod_obj, mod_exports){
    mod_obj.exports = require("fs");
  },
  function(mod_obj, mod_exports, obtain_dep){
    "use strict";
    var input_manager = obtain_dep(3);
    var problem_solver = obtain_dep(5);
    mod_obj.exports = function(input_text){
      var reader_instance = new input_manager(input_text);
      problem_solver(reader_instance);
    };
  },
  function(mod_obj, mod_exports, obtain_dep){
    "use strict";
    var data_queue = obtain_dep(4);
    mod_obj.exports = class DataParser {
      constructor(source_data){
        var parsed_chunks = source_data.trim().split(/\s+/g);
        this.data_stream = new data_queue(parsed_chunks);
      }
      read_string(){
        return this.data_stream.dequeue_item();
      }
      read_int(){
        return Number.parseInt(this.data_stream.dequeue_item(), 10);
      }
      finish_reading(){
        this.data_stream.reset_queue();
      }
    };
  },
  function(mod_obj, mod_exports, obtain_dep){
    "use strict";
    mod_obj.exports = class ElementBuffer {
      constructor(){
        var initial_elements = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
        this.count_items = initial_elements.length;
        this.element_list = initial_elements;
        this.current_index = 0;
      }
      enqueue_item(new_item){
        this.count_items += 1;
        this.element_list.push(new_item);
      }
      dequeue_item(){
        var extracted_item = this.element_list[this.current_index];
        this.count_items -= 1;
        this.current_index += 1;
        return extracted_item;
      }
      reset_queue(){
        this.element_list = [];
        this.count_items = 0;
        this.current_index = 0;
      }
    };
  },
  function(mod_obj, mod_exports, obtain_dep){
    "use strict";
    var large_num_lib = obtain_dep(6);
    mod_obj.exports = function(input_reader){
      var modulo_val = 1000000007;
      var num_elements = input_reader.read_int();
      var large_numbers_array = new Array(num_elements);
      for (var idx_val = 0; idx_val < num_elements; idx_val++) {
        large_numbers_array[idx_val] = new large_num_lib(input_reader.read_string());
      }
      var bit_counts = new Array(61).fill(0);
      for (var arr_idx = 0; arr_idx < num_elements; arr_idx++) {
        for (var current_big_num = large_numbers_array[arr_idx], bit_pos = 0; current_big_num.gt_check(0);) {
          bit_counts[bit_pos] += current_big_num.modulo_value(2);
          current_big_num = current_big_num.divide_values(2);
          bit_pos++;
        }
      }
      var total_sum_val = new large_num_lib(0);
      var power_of_two = new large_num_lib(1);
      for (var bit_loop_idx = 0; bit_loop_idx < bit_counts.length; bit_loop_idx++) {
        var current_term_val = power_of_two.times_values(bit_counts[bit_loop_idx]).modulo_value(modulo_val).times_values(num_elements - bit_counts[bit_loop_idx]).modulo_value(modulo_val);
        total_sum_val = total_sum_val.plus_values(current_term_val).modulo_value(modulo_val);
        power_of_two = power_of_two.times_values(2).modulo_value(modulo_val);
      }
      console.log(total_sum_val.to_string_representation());
    };
  },
  function(mod_obj, mod_exports, obtain_dep){
    (function(export_target){
      var export_var, big_arithmetic = function(export_target_arg){
        "use strict";
        var digit_base = 1e7,
          digit_count = 7,
          max_safe_val = 9007199254740992,
          max_safe_digits = to_digit_array(max_safe_val),
          base_chars = "0123456789abcdefghijklmnopqrstuvwxyz",
          has_bigint_support = typeof BigInt === "function";

        function create_number(num_val, base_val, radix_val, is_raw_val){
          return void 0 === num_val ? create_number[0] : void 0 !== base_val && (10 != +base_val || radix_val) ? parse_string_to_bignum(num_val, base_val, radix_val, is_raw_val) : convert_to_bignum(num_val);
        }

        function LargeNumber(num_val, is_negative){
          this.value = num_val;
          this.sign = is_negative;
          this.isSmall = false;
        }

        function SmallNumber(num_val){
          this.value = num_val;
          this.sign = num_val < 0;
          this.isSmall = true;
        }

        function BigIntNumber(num_val){
          this.value = num_val;
        }

        function is_within_small_range(num_val){
          return -max_safe_val < num_val && num_val < max_safe_val;
        }

        function to_digit_array(num_val){
          return num_val < 1e7 ? [num_val] : num_val < 1e14 ? [num_val % 1e7, Math.floor(num_val / 1e7)] : [num_val % 1e7, Math.floor(num_val / 1e7) % 1e7, Math.floor(num_val / 1e14)];
        }

        function from_digit_array(digit_arr){
          trim_zeros(digit_arr);
          var arr_len = digit_arr.length;
          if (arr_len < 4 && compare_digit_arrays(digit_arr, max_safe_digits) < 0) {
            switch (arr_len) {
              case 0:
                return 0;
              case 1:
                return digit_arr[0];
              case 2:
                return digit_arr[0] + digit_arr[1] * digit_base;
              default:
                return digit_arr[0] + (digit_arr[1] + digit_arr[2] * digit_base) * digit_base;
            }
          }
          return digit_arr;
        }

        function trim_zeros(digit_arr){
          for (var idx = digit_arr.length; 0 === digit_arr[--idx];);
          digit_arr.length = idx + 1;
        }

        function create_zero_array(size_val){
          for (var new_arr = new Array(size_val), k = -1; ++k < size_val;) {
            new_arr[k] = 0;
          }
          return new_arr;
        }

        function round_to_int(num_val){
          return num_val > 0 ? Math.floor(num_val) : Math.ceil(num_val);
        }

        function add_digit_arrays(arr1, arr2){
          var carry_val, sum_val,
            len1 = arr1.length,
            len2 = arr2.length,
            result_arr = new Array(len1),
            accumulator = 0,
            base_val = digit_base;
          for (sum_val = 0; sum_val < len2; sum_val++) {
            accumulator = (carry_val = arr1[sum_val] + arr2[sum_val] + accumulator) >= base_val ? 1 : 0;
            result_arr[sum_val] = carry_val - accumulator * base_val;
          }
          for (; sum_val < len1;) {
            accumulator = (carry_val = arr1[sum_val] + accumulator) === base_val ? 1 : 0;
            result_arr[sum_val++] = carry_val - accumulator * base_val;
          }
          accumulator > 0 && result_arr.push(accumulator);
          return result_arr;
        }

        function add_arrays_wrapper(arr1, arr2){
          return arr1.length >= arr2.length ? add_digit_arrays(arr1, arr2) : add_digit_arrays(arr2, arr1);
        }

        function add_small_to_array(digit_arr, small_num){
          var overflow_val, new_digit_val,
            arr_len = digit_arr.length,
            result_arr = new Array(arr_len),
            base_val = digit_base,
            carry_amount = 0;
          for (new_digit_val = 0; new_digit_val < arr_len; new_digit_val++) {
            overflow_val = digit_arr[new_digit_val] * small_num + carry_amount;
            carry_amount = Math.floor(overflow_val / base_val);
            result_arr[new_digit_val] = overflow_val - carry_amount * base_val;
          }
          for (; carry_amount > 0;) {
            result_arr[new_digit_val++] = carry_amount % base_val;
            carry_amount = Math.floor(carry_amount / base_val);
          }
          return result_arr;
        }

        function subtract_digit_arrays(arr1, arr2){
          var diff_val, borrow_val,
            len1 = arr1.length,
            len2 = arr2.length,
            result_arr = new Array(len1),
            accumulator = 0,
            base_val = digit_base;
          for (diff_val = 0; diff_val < len2; diff_val++) {
            (borrow_val = arr1[diff_val] - accumulator - arr2[diff_val]) < 0 ? (borrow_val += base_val, accumulator = 1) : accumulator = 0;
            result_arr[diff_val] = borrow_val;
          }
          for (diff_val = len2; diff_val < len1; diff_val++) {
            if (!((borrow_val = arr1[diff_val] - accumulator) < 0)) {
              result_arr[diff_val++] = borrow_val;
              break;
            }
            borrow_val += base_val;
            result_arr[diff_val] = borrow_val;
          }
          for (; diff_val < len1; diff_val++) {
            result_arr[diff_val] = arr1[diff_val];
          }
          return trim_zeros(result_arr), result_arr;
        }

        function subtract_small_from_array(digit_arr, small_num, is_negative_result){
          var sub_val, carry_val,
            arr_len = digit_arr.length,
            result_arr = new Array(arr_len),
            borrow_val = -small_num,
            base_val = digit_base;
          for (sub_val = 0; sub_val < arr_len; sub_val++) {
            carry_val = digit_arr[sub_val] + borrow_val;
            borrow_val = Math.floor(carry_val / base_val);
            carry_val %= base_val;
            result_arr[sub_val] = carry_val < 0 ? carry_val + base_val : carry_val;
          }
          return "number" == typeof(result_arr = from_digit_array(result_arr)) ? (is_negative_result && (result_arr = -result_arr), new SmallNumber(result_arr)) : new LargeNumber(result_arr, is_negative_result);
        }

        function multiply_digit_arrays(arr1, arr2){
          var partial_prod, carry_val, product_val,
            len1 = arr1.length,
            len2 = arr2.length,
            result_arr = create_zero_array(len1 + len2),
            base_val = digit_base;
          for (product_val = 0; product_val < len1; ++product_val) {
            partial_prod = arr1[product_val];
            for (var k_idx = 0; k_idx < len2; ++k_idx) {
              carry_val = partial_prod * arr2[k_idx] + result_arr[product_val + k_idx];
              partial_prod = Math.floor(carry_val / base_val);
              result_arr[product_val + k_idx] = carry_val - partial_prod * base_val;
              result_arr[product_val + k_idx + 1] += partial_prod;
            }
          }
          return trim_zeros(result_arr), result_arr;
        }

        function multiply_array_by_small(digit_arr, small_val){
          var overflow_val, new_digit_val,
            arr_len = digit_arr.length,
            result_arr = new Array(arr_len),
            base_val = digit_base,
            carry_amount = 0;
          for (new_digit_val = 0; new_digit_val < arr_len; new_digit_val++) {
            overflow_val = digit_arr[new_digit_val] * small_val + carry_amount;
            carry_amount = Math.floor(overflow_val / base_val);
            result_arr[new_digit_val] = overflow_val - carry_amount * base_val;
          }
          for (; carry_amount > 0;) {
            result_arr[new_digit_val++] = carry_amount % base_val;
            carry_amount = Math.floor(carry_amount / base_val);
          }
          return result_arr;
        }

        function pad_with_zeros(digit_arr, num_zeros){
          for (var padded_arr = []; num_zeros-- > 0;) {
            padded_arr.push(0);
          }
          return padded_arr.concat(digit_arr);
        }

        function create_large_from_small_mult(small_val, digit_arr, is_negative){
          return new LargeNumber(small_val < digit_base ? multiply_array_by_small(digit_arr, small_val) : multiply_digit_arrays(digit_arr, to_digit_array(small_val)), is_negative);
        }

        function square_digit_array(digit_arr){
          var val_prod, carry_val, partial_sum,
            len = digit_arr.length,
            result_arr = create_zero_array(len + len),
            base_val = digit_base;
          for (partial_sum = 0; partial_sum < len; partial_sum++) {
            carry_val = 0 - (val_prod = digit_arr[partial_sum]) * val_prod;
            for (var k_idx = partial_sum; k_idx < len; k_idx++) {
              val_prod = digit_arr[partial_sum] * digit_arr[k_idx] * 2 + result_arr[partial_sum + k_idx] + carry_val;
              carry_val = Math.floor(val_prod / base_val);
              result_arr[partial_sum + k_idx] = val_prod - carry_val * base_val;
            }
            result_arr[partial_sum + len] = carry_val;
          }
          return trim_zeros(result_arr), result_arr;
        }

        function divide_array_by_small(digit_arr, small_divisor){
          var current_val, remainder_val, quotient_val,
            arr_len = digit_arr.length,
            result_arr = create_zero_array(arr_len),
            base_val = digit_base;
          for (remainder_val = 0, current_val = arr_len - 1; current_val >= 0; --current_val) {
            remainder_val = (quotient_val = remainder_val * base_val + digit_arr[current_val]) - (current_val = round_to_int(quotient_val / small_divisor)) * small_divisor;
            result_arr[current_val] = 0 | current_val;
          }
          return [result_arr, 0 | remainder_val];
        }

        function perform_division(dividend_num, divisor_num){
          var div_result,
            normalized_divisor = convert_to_bignum(divisor_num);
          if (has_bigint_support) {
            return [new BigIntNumber(dividend_num.value / normalized_divisor.value), new BigIntNumber(dividend_num.value % normalized_divisor.value)];
          }
          var quotient_val,
            dividend_value_arr = dividend_num.value,
            divisor_value_arr = normalized_divisor.value;
          if (0 === divisor_value_arr) {
            throw new Error("Cannot divide by zero");
          }
          if (dividend_num.isSmall) {
            return normalized_divisor.isSmall ? [new SmallNumber(round_to_int(dividend_value_arr / divisor_value_arr)), new SmallNumber(dividend_value_arr % divisor_value_arr)] : [create_number[0], dividend_num];
          }
          if (normalized_divisor.isSmall) {
            if (1 === divisor_value_arr) {
              return [dividend_num, create_number[0]];
            }
            if (-1 == divisor_value_arr) {
              return [dividend_num.negate_value(), create_number[0]];
            }
            var abs_divisor = Math.abs(divisor_value_arr);
            if (abs_divisor < digit_base) {
              quotient_val = from_digit_array((div_result = divide_array_by_small(dividend_value_arr, abs_divisor))[0]);
              var remainder_val = div_result[1];
              return dividend_num.sign && (remainder_val = -remainder_val), "number" == typeof quotient_val ? (dividend_num.sign !== normalized_divisor.sign && (quotient_val = -quotient_val), [new SmallNumber(quotient_val), new SmallNumber(remainder_val)]) : [new LargeNumber(quotient_val, dividend_num.sign !== normalized_divisor.sign), new SmallNumber(remainder_val)];
            }
            divisor_value_arr = to_digit_array(abs_divisor);
          }
          var comp_result = compare_digit_arrays(dividend_value_arr, divisor_value_arr);
          if (-1 === comp_result) {
            return [create_number[0], dividend_num];
          }
          if (0 === comp_result) {
            return [create_number[dividend_num.sign === normalized_divisor.sign ? 1 : -1], create_number[0]];
          }
          quotient_val = (div_result = dividend_value_arr.length + divisor_value_arr.length <= 200 ? function(dividend_arr, divisor_arr){
            var q_digit, r_digit, i_val, u_val, p_val, a_val, s_val,
              d_len = dividend_arr.length,
              v_len = divisor_arr.length,
              base_val = digit_base,
              result_q = create_zero_array(divisor_arr.length),
              last_div_digit = divisor_arr[v_len - 1],
              scale_factor = Math.ceil(base_val / (2 * last_div_digit)),
              scaled_dividend = multiply_array_by_small(dividend_arr, scale_factor),
              scaled_divisor = multiply_array_by_small(divisor_arr, scale_factor);
            for (scaled_dividend.length <= d_len && scaled_dividend.push(0), scaled_divisor.push(0), last_div_digit = scaled_divisor[v_len - 1], i_val = d_len - v_len; i_val >= 0; i_val--) {
              for (q_digit = base_val - 1, scaled_dividend[i_val + v_len] !== last_div_digit && (q_digit = Math.floor((scaled_dividend[i_val + v_len] * base_val + scaled_dividend[i_val + v_len - 1]) / last_div_digit)), r_digit = 0, u_val = 0, a_val = scaled_divisor.length, p_val = 0; p_val < a_val; p_val++) {
                r_digit += q_digit * scaled_divisor[p_val];
                s_val = Math.floor(r_digit / base_val);
                u_val += scaled_dividend[i_val + p_val] - (r_digit - s_val * base_val);
                r_digit = s_val;
                u_val < 0 ? (scaled_dividend[i_val + p_val] = u_val + base_val, u_val = -1) : (scaled_dividend[i_val + p_val] = u_val, u_val = 0);
              }
              for (; 0 !== u_val;) {
                for (q_digit -= 1, r_digit = 0, p_val = 0; p_val < a_val; p_val++) {
                  (r_digit += scaled_dividend[i_val + p_val] - base_val + scaled_divisor[p_val]) < 0 ? (scaled_dividend[i_val + p_val] = r_digit + base_val, r_digit = 0) : (scaled_dividend[i_val + p_val] = r_digit, r_digit = 1);
                }
                u_val += r_digit;
              }
              result_q[i_val] = q_digit;
            }
            return scaled_dividend = divide_array_by_small(scaled_dividend, scale_factor)[0], [from_digit_array(result_q), from_digit_array(scaled_dividend)];
          }(dividend_value_arr, divisor_value_arr) : function(dividend_arr, divisor_arr){
            for (var q_digit, r_digit, i_val, u_val, p_val,
                d_len = dividend_arr.length,
                s_len = divisor_arr.length,
                quotient_list = [],
                remainder_list = [],
                base_val = digit_base; d_len;) {
              if (remainder_list.unshift(dividend_arr[--d_len]), trim_zeros(remainder_list), compare_digit_arrays(remainder_list, divisor_arr) < 0) {
                quotient_list.push(0);
              } else {
                i_val = remainder_list[(r_digit = remainder_list.length) - 1] * base_val + remainder_list[r_digit - 2];
                u_val = divisor_arr[s_len - 1] * base_val + divisor_arr[s_len - 2];
                r_digit > s_len && (i_val = (i_val + 1) * base_val);
                q_digit = Math.ceil(i_val / u_val);
                do {
                  if (compare_digit_arrays(p_val = multiply_array_by_small(divisor_arr, q_digit), remainder_list) <= 0) {
                    break;
                  }
                  q_digit--;
                } while (q_digit);
                quotient_list.push(q_digit);
                remainder_list = subtract_digit_arrays(remainder_list, p_val);
              }
            }
            return quotient_list.reverse(), [from_digit_array(quotient_list), from_digit_array(remainder_list)];
          }(dividend_value_arr, divisor_value_arr))[0];
          var is_result_negative = dividend_num.sign !== normalized_divisor.sign,
            remainder_result = div_result[1],
            remainder_sign = dividend_num.sign;
          return "number" == typeof quotient_val ? (is_result_negative && (quotient_val = -quotient_val), quotient_val = new SmallNumber(quotient_val)) : quotient_val = new LargeNumber(quotient_val, is_result_negative), "number" == typeof remainder_result ? (remainder_sign && (remainder_result = -remainder_result), remainder_result = new SmallNumber(remainder_result)) : remainder_result = new LargeNumber(remainder_result, remainder_sign), [quotient_val, remainder_result];
        }

        function compare_digit_arrays(arr1, arr2){
          if (arr1.length !== arr2.length) {
            return arr1.length > arr2.length ? 1 : -1;
          }
          for (var idx = arr1.length - 1; idx >= 0; idx--) {
            if (arr1[idx] !== arr2[idx]) {
              return arr1[idx] > arr2[idx] ? 1 : -1;
            }
          }
          return 0;
        }

        function check_prime_trivial(num_obj){
          var abs_num = num_obj.absolute_value();
          return !abs_num.is_unity() && (!!(abs_num.are_equal(2) || abs_num.are_equal(3) || abs_num.are_equal(5)) || !(abs_num.is_even_num() || abs_num.is_divisible_by_num(3) || abs_num.is_divisible_by_num(5)) && (!!abs_num.lt_check(49) || void 0));
        }

        function miller_rabin_test(num_obj, test_bases){
          for (var r_val, o_val, i_val,
              prev_num = num_obj.get_prev_num(),
              temp_num = prev_num,
              exponent_val = 0; temp_num.is_even_num();) {
            temp_num = temp_num.divide_values(2);
            exponent_val++;
          }
          test_loop:
            for (o_val = 0; o_val < test_bases.length; o_val++) {
              if (!num_obj.lt_check(test_bases[o_val]) && !(i_val = big_arithmetic(test_bases[o_val]).modular_power(temp_num, num_obj)).is_unity() && !i_val.are_equal(prev_num)) {
                for (r_val = exponent_val - 1; 0 != r_val; r_val--) {
                  if ((i_val = i_val.square_value().modulo_value(num_obj)).is_unity()) {
                    return false;
                  }
                  if (i_val.are_equal(prev_num)) {
                    continue test_loop;
                  }
                }
                return false;
              }
            }
          return true;
        }
        LargeNumber.prototype = Object.create(create_number.prototype);
        SmallNumber.prototype = Object.create(create_number.prototype);
        BigIntNumber.prototype = Object.create(create_number.prototype);
        LargeNumber.prototype.add_values = function(other_num){
          var normalized_num = convert_to_bignum(other_num);
          if (this.sign !== normalized_num.sign) {
            return this.subtract_values(normalized_num.negate_value());
          }
          var this_val = this.value,
            other_val = normalized_num.value;
          return normalized_num.isSmall ? new LargeNumber(add_small_to_array(this_val, Math.abs(other_val)), this.sign) : new LargeNumber(add_arrays_wrapper(this_val, other_val), this.sign);
        };
        LargeNumber.prototype.plus_values = LargeNumber.prototype.add_values;
        SmallNumber.prototype.add_values = function(other_num){
          var normalized_num = convert_to_bignum(other_num),
            this_val = this.value;
          if (this_val < 0 !== normalized_num.sign) {
            return this.subtract_values(normalized_num.negate_value());
          }
          var other_val = normalized_num.value;
          if (normalized_num.isSmall) {
            if (is_within_small_range(this_val + other_val)) {
              return new SmallNumber(this_val + other_val);
            }
            other_val = to_digit_array(Math.abs(other_val));
          }
          return new LargeNumber(add_small_to_array(other_val, Math.abs(this_val)), this_val < 0);
        };
        SmallNumber.prototype.plus_values = SmallNumber.prototype.add_values;
        BigIntNumber.prototype.add_values = function(other_num){
          return new BigIntNumber(this.value + convert_to_bignum(other_num).value);
        };
        BigIntNumber.prototype.plus_values = BigIntNumber.prototype.add_values;
        LargeNumber.prototype.subtract_values = function(other_num){
          var normalized_num = convert_to_bignum(other_num);
          if (this.sign !== normalized_num.sign) {
            return this.add_values(normalized_num.negate_value());
          }
          var this_val = this.value,
            other_val = normalized_num.value;
          return normalized_num.isSmall ? subtract_small_from_array(this_val, Math.abs(other_val), this.sign) : function(arr1, arr2, is_negative_output){
            var result_arr;
            return compare_digit_arrays(arr1, arr2) >= 0 ? result_arr = subtract_digit_arrays(arr1, arr2) : (result_arr = subtract_digit_arrays(arr2, arr1), is_negative_output = !is_negative_output), "number" == typeof(result_arr = from_digit_array(result_arr)) ? (is_negative_output && (result_arr = -result_arr), new SmallNumber(result_arr)) : new LargeNumber(result_arr, is_negative_output);
          }(this_val, other_val, this.sign);
        };
        LargeNumber.prototype.minus_values = LargeNumber.prototype.subtract_values;
        SmallNumber.prototype.subtract_values = function(other_num){
          var normalized_num = convert_to_bignum(other_num),
            this_val = this.value;
          if (this_val < 0 !== normalized_num.sign) {
            return this.add_values(normalized_num.negate_value());
          }
          var other_val = normalized_num.value;
          return normalized_num.isSmall ? new SmallNumber(this_val - other_val) : subtract_small_from_array(other_val, Math.abs(this_val), this_val >= 0);
        };
        SmallNumber.prototype.minus_values = SmallNumber.prototype.subtract_values;
        BigIntNumber.prototype.subtract_values = function(other_num){
          return new BigIntNumber(this.value - convert_to_bignum(other_num).value);
        };
        BigIntNumber.prototype.minus_values = BigIntNumber.prototype.subtract_values;
        LargeNumber.prototype.negate_value = function(){
          return new LargeNumber(this.value, !this.sign);
        };
        SmallNumber.prototype.negate_value = function(){
          var current_sign = this.sign,
            negated_num = new SmallNumber(-this.value);
          return negated_num.sign = !current_sign, negated_num;
        };
        BigIntNumber.prototype.negate_value = function(){
          return new BigIntNumber(-this.value);
        };
        LargeNumber.prototype.absolute_value = function(){
          return new LargeNumber(this.value, false);
        };
        SmallNumber.prototype.absolute_value = function(){
          return new SmallNumber(Math.abs(this.value));
        };
        BigIntNumber.prototype.absolute_value = function(){
          return new BigIntNumber(this.value >= 0 ? this.value : -this.value);
        };
        LargeNumber.prototype.multiply_values = function(other_num){
          var abs_val, prod_len1, prod_len2,
            normalized_num = convert_to_bignum(other_num),
            this_val = this.value,
            other_val = normalized_num.value,
            is_result_negative = this.sign !== normalized_num.sign;
          if (normalized_num.isSmall) {
            if (0 === other_val) {
              return create_number[0];
            }
            if (1 === other_val) {
              return this;
            }
            if (-1 === other_val) {
              return this.negate_value();
            }
            if ((abs_val = Math.abs(other_val)) < digit_base) {
              return new LargeNumber(multiply_array_by_small(this_val, abs_val), is_result_negative);
            }
            other_val = to_digit_array(abs_val);
          }
          return prod_len1 = this_val.length, prod_len2 = other_val.length, new LargeNumber(-.012 * prod_len1 - .012 * prod_len2 + 15e-6 * prod_len1 * prod_len2 > 0 ? function karatsuba_multiply(arr1, arr2){
            var max_len = Math.max(arr1.length, arr2.length);
            if (max_len <= 30) {
              return multiply_digit_arrays(arr1, arr2);
            }
            max_len = Math.ceil(max_len / 2);
            var high1 = arr1.slice(max_len),
              low1 = arr1.slice(0, max_len),
              high2 = arr2.slice(max_len),
              low2 = arr2.slice(0, max_len),
              prod_low = karatsuba_multiply(low1, low2),
              prod_high = karatsuba_multiply(high1, high2),
              prod_middle = karatsuba_multiply(add_arrays_wrapper(low1, high1), add_arrays_wrapper(low2, high2)),
              result_sum = add_arrays_wrapper(add_arrays_wrapper(prod_low, pad_with_zeros(subtract_digit_arrays(subtract_digit_arrays(prod_middle, prod_low), prod_high), max_len)), pad_with_zeros(prod_high, 2 * max_len));
            return trim_zeros(result_sum), result_sum;
          }(this_val, other_val) : multiply_digit_arrays(this_val, other_val), is_result_negative);
        };
        LargeNumber.prototype.times_values = LargeNumber.prototype.multiply_values;
        SmallNumber.prototype._multiply_by_small_int = function(other_num){
          return is_within_small_range(other_num.value * this.value) ? new SmallNumber(other_num.value * this.value) : create_large_from_small_mult(Math.abs(other_num.value), to_digit_array(Math.abs(this.value)), this.sign !== other_num.sign);
        };
        LargeNumber.prototype._multiply_by_small_int = function(other_num){
          return 0 === other_num.value ? create_number[0] : 1 === other_num.value ? this : -1 === other_num.value ? this.negate_value() : create_large_from_small_mult(Math.abs(other_num.value), this.value, this.sign !== other_num.sign);
        };
        SmallNumber.prototype.multiply_values = function(other_num){
          return convert_to_bignum(other_num)._multiply_by_small_int(this);
        };
        SmallNumber.prototype.times_values = SmallNumber.prototype.multiply_values;
        BigIntNumber.prototype.multiply_values = function(other_num){
          return new BigIntNumber(this.value * convert_to_bignum(other_num).value);
        };
        BigIntNumber.prototype.times_values = BigIntNumber.prototype.multiply_values;
        LargeNumber.prototype.square_value = function(){
          return new LargeNumber(square_digit_array(this.value), false);
        };
        SmallNumber.prototype.square_value = function(){
          var squared_val = this.value * this.value;
          return is_within_small_range(squared_val) ? new SmallNumber(squared_val) : new LargeNumber(square_digit_array(to_digit_array(Math.abs(this.value))), false);
        };
        BigIntNumber.prototype.square_value = function(other_num){
          return new BigIntNumber(this.value * this.value);
        };
        LargeNumber.prototype.get_division_remainder = function(other_num){
          var division_pair = perform_division(this, other_num);
          return { quotient:division_pair[0], remainder:division_pair[1] };
        };
        BigIntNumber.prototype.get_division_remainder = SmallNumber.prototype.get_division_remainder = LargeNumber.prototype.get_division_remainder;
        LargeNumber.prototype.divide_values = function(other_num){
          return perform_division(this, other_num)[0];
        };
        BigIntNumber.prototype.over_values = BigIntNumber.prototype.divide_values = function(other_num){
          return new BigIntNumber(this.value / convert_to_bignum(other_num).value);
        };
        SmallNumber.prototype.over_values = SmallNumber.prototype.divide_values = LargeNumber.prototype.over_values = LargeNumber.prototype.divide_values;
        LargeNumber.prototype.modulo_value = function(other_num){
          return perform_division(this, other_num)[1];
        };
        BigIntNumber.prototype.modulo_value = BigIntNumber.prototype.remainder_value = function(other_num){
          return new BigIntNumber(this.value % convert_to_bignum(other_num).value);
        };
        SmallNumber.prototype.remainder_value = SmallNumber.prototype.modulo_value = LargeNumber.prototype.remainder_value = LargeNumber.prototype.modulo_value;
        LargeNumber.prototype.power_value = function(exponent_num){
          var power_val, base_val, exp_val_js,
            normalized_exp = convert_to_bignum(exponent_num),
            this_val_arr = this.value,
            exp_val_arr = normalized_exp.value;
          if (0 === exp_val_arr) {
            return create_number[1];
          }
          if (0 === this_val_arr) {
            return create_number[0];
          }
          if (1 === this_val_arr) {
            return create_number[1];
          }
          if (-1 === this_val_arr) {
            return normalized_exp.is_even_num() ? create_number[1] : create_number[-1];
          }
          if (normalized_exp.sign) {
            return create_number[0];
          }
          if (!normalized_exp.isSmall) {
            throw new Error("The exponent " + normalized_exp.to_string_representation() + " is too large.");
          }
          if (this.isSmall && is_within_small_range(power_val = Math.pow(this_val_arr, exp_val_arr))) {
            return new SmallNumber(round_to_int(power_val));
          }
          for (base_val = this, exp_val_js = create_number[1]; 1 & exp_val_arr && (exp_val_js = exp_val_js.times_values(base_val), --exp_val_arr), 0 !== exp_val_arr;) {
            exp_val_arr /= 2;
            base_val = base_val.square_value();
          }
          return exp_val_js;
        };
        SmallNumber.prototype.power_value = LargeNumber.prototype.power_value;
        BigIntNumber.prototype.power_value = function(exponent_num){
          var normalized_exp = convert_to_bignum(exponent_num),
            this_val = this.value,
            exp_val = normalized_exp.value,
            zero_bigint = BigInt(0),
            one_bigint = BigInt(1),
            two_bigint = BigInt(2);
          if (exp_val === zero_bigint) {
            return create_number[1];
          }
          if (this_val === zero_bigint) {
            return create_number[0];
          }
          if (this_val === one_bigint) {
            return create_number[1];
          }
          if (this_val === BigInt(-1)) {
            return normalized_exp.is_even_num() ? create_number[1] : create_number[-1];
          }
          if (normalized_exp.is_negative_num()) {
            return new BigIntNumber(zero_bigint);
          }
          for (var base_num = this, result_num = create_number[1]; (exp_val & one_bigint) === one_bigint && (result_num = result_num.times_values(base_num), --exp_val), exp_val !== zero_bigint;) {
            exp_val /= two_bigint;
            base_num = base_num.square_value();
          }
          return result_num;
        };
        LargeNumber.prototype.modular_power = function(exponent_num, modulus_num){
          if (exponent_num = convert_to_bignum(exponent_num), (modulus_num = convert_to_bignum(modulus_num)).is_zero_num()) {
            throw new Error("Cannot take modPow with modulus 0");
          }
          var result_num = create_number[1],
            base_mod = this.modulo_value(modulus_num);
          for (exponent_num.is_negative_num() && (exponent_num = exponent_num.multiply_values(create_number[-1]), base_mod = base_mod.modular_inverse(modulus_num)); exponent_num.is_positive_num();) {
            if (base_mod.is_zero_num()) {
              return create_number[0];
            }
            exponent_num.is_odd_num() && (result_num = result_num.multiply_values(base_mod).modulo_value(modulus_num));
            exponent_num = exponent_num.divide_values(2);
            base_mod = base_mod.square_value().modulo_value(modulus_num);
          }
          return result_num;
        };
        BigIntNumber.prototype.modular_power = SmallNumber.prototype.modular_power = LargeNumber.prototype.modular_power;
        LargeNumber.prototype.compare_absolute_values = function(other_num){
          var normalized_num = convert_to_bignum(other_num),
            this_val = this.value,
            other_val = normalized_num.value;
          return normalized_num.isSmall ? 1 : compare_digit_arrays(this_val, other_val);
        };
        SmallNumber.prototype.compare_absolute_values = function(other_num){
          var normalized_num = convert_to_bignum(other_num),
            this_abs_val = Math.abs(this.value),
            other_val = normalized_num.value;
          return normalized_num.isSmall ? this_abs_val === (other_val = Math.abs(other_val)) ? 0 : this_abs_val > other_val ? 1 : -1 : -1;
        };
        BigIntNumber.prototype.compare_absolute_values = function(other_num){
          var this_val = this.value,
            other_val = convert_to_bignum(other_num).value;
          return (this_val = this_val >= 0 ? this_val : -this_val) === (other_val = other_val >= 0 ? other_val : -other_val) ? 0 : this_val > other_val ? 1 : -1;
        };
        LargeNumber.prototype.compare_numbers = function(other_num){
          if (other_num === 1 / 0) {
            return -1;
          }
          if (other_num === -1 / 0) {
            return 1;
          }
          var normalized_num = convert_to_bignum(other_num),
            this_val = this.value,
            other_val = normalized_num.value;
          return this.sign !== normalized_num.sign ? normalized_num.sign ? 1 : -1 : normalized_num.isSmall ? this.sign ? -1 : 1 : compare_digit_arrays(this_val, other_val) * (this.sign ? -1 : 1);
        };
        LargeNumber.prototype.compare_to_numbers = LargeNumber.prototype.compare_numbers;
        SmallNumber.prototype.compare_numbers = function(other_num){
          if (other_num === 1 / 0) {
            return -1;
          }
          if (other_num === -1 / 0) {
            return 1;
          }
          var normalized_num = convert_to_bignum(other_num),
            this_val = this.value,
            other_val = normalized_num.value;
          return normalized_num.isSmall ? this_val == other_val ? 0 : this_val > other_val ? 1 : -1 : this_val < 0 !== normalized_num.sign ? this_val < 0 ? -1 : 1 : this_val < 0 ? 1 : -1;
        };
        SmallNumber.prototype.compare_to_numbers = SmallNumber.prototype.compare_numbers;
        BigIntNumber.prototype.compare_numbers = function(other_num){
          if (other_num === 1 / 0) {
            return -1;
          }
          if (other_num === -1 / 0) {
            return 1;
          }
          var this_val = this.value,
            other_val = convert_to_bignum(other_num).value;
          return this_val === other_val ? 0 : this_val > other_val ? 1 : -1;
        };
        BigIntNumber.prototype.compare_to_numbers = BigIntNumber.prototype.compare_numbers;
        LargeNumber.prototype.are_equal = function(other_num){
          return 0 === this.compare_numbers(other_num);
        };
        BigIntNumber.prototype.check_equality = BigIntNumber.prototype.are_equal = SmallNumber.prototype.check_equality = SmallNumber.prototype.are_equal = LargeNumber.prototype.check_equality = LargeNumber.prototype.are_equal;
        LargeNumber.prototype.are_not_equal = function(other_num){
          return 0 !== this.compare_numbers(other_num);
        };
        BigIntNumber.prototype.check_inequality = BigIntNumber.prototype.are_not_equal = SmallNumber.prototype.check_inequality = SmallNumber.prototype.are_not_equal = LargeNumber.prototype.check_inequality = LargeNumber.prototype.are_not_equal;
        LargeNumber.prototype.is_greater = function(other_num){
          return this.compare_numbers(other_num) > 0;
        };
        BigIntNumber.prototype.gt_check = BigIntNumber.prototype.is_greater = SmallNumber.prototype.gt_check = SmallNumber.prototype.is_greater = LargeNumber.prototype.gt_check = LargeNumber.prototype.is_greater;
        LargeNumber.prototype.is_lesser = function(other_num){
          return this.compare_numbers(other_num) < 0;
        };
        BigIntNumber.prototype.lt_check = BigIntNumber.prototype.is_lesser = SmallNumber.prototype.lt_check = SmallNumber.prototype.is_lesser = LargeNumber.prototype.lt_check = LargeNumber.prototype.is_lesser;
        LargeNumber.prototype.is_greater_or_equal = function(other_num){
          return this.compare_numbers(other_num) >= 0;
        };
        BigIntNumber.prototype.geq_check = BigIntNumber.prototype.is_greater_or_equal = SmallNumber.prototype.geq_check = SmallNumber.prototype.is_greater_or_equal = LargeNumber.prototype.geq_check = LargeNumber.prototype.is_greater_or_equal;
        LargeNumber.prototype.is_lesser_or_equal = function(other_num){
          return this.compare_numbers(other_num) <= 0;
        };
        BigIntNumber.prototype.leq_check = BigIntNumber.prototype.is_lesser_or_equal = SmallNumber.prototype.leq_check = SmallNumber.prototype.is_lesser_or_equal = LargeNumber.prototype.leq_check = LargeNumber.prototype.is_lesser_or_equal;
        LargeNumber.prototype.is_even_num = function(){
          return 0 == (1 & this.value[0]);
        };
        SmallNumber.prototype.is_even_num = function(){
          return 0 == (1 & this.value);
        };
        BigIntNumber.prototype.is_even_num = function(){
          return (this.value & BigInt(1)) === BigInt(0);
        };
        LargeNumber.prototype.is_odd_num = function(){
          return 1 == (1 & this.value[0]);
        };
        SmallNumber.prototype.is_odd_num = function(){
          return 1 == (1 & this.value);
        };
        BigIntNumber.prototype.is_odd_num = function(){
          return (this.value & BigInt(1)) === BigInt(1);
        };
        LargeNumber.prototype.is_positive_num = function(){
          return !this.sign;
        };
        SmallNumber.prototype.is_positive_num = function(){
          return this.value > 0;
        };
        BigIntNumber.prototype.is_positive_num = SmallNumber.prototype.is_positive_num;
        LargeNumber.prototype.is_negative_num = function(){
          return this.sign;
        };
        SmallNumber.prototype.is_negative_num = function(){
          return this.value < 0;
        };
        BigIntNumber.prototype.is_negative_num = SmallNumber.prototype.is_negative_num;
        LargeNumber.prototype.is_unity = function(){
          return false;
        };
        SmallNumber.prototype.is_unity = function(){
          return 1 === Math.abs(this.value);
        };
        BigIntNumber.prototype.is_unity = function(){
          return this.absolute_value().value === BigInt(1);
        };
        LargeNumber.prototype.is_zero_num = function(){
          return false;
        };
        SmallNumber.prototype.is_zero_num = function(){
          return 0 === this.value;
        };
        BigIntNumber.prototype.is_zero_num = function(){
          return this.value === BigInt(0);
        };
        LargeNumber.prototype.is_divisible_by_num = function(other_num){
          var normalized_num = convert_to_bignum(other_num);
          return !normalized_num.is_zero_num() && (!!normalized_num.is_unity() || (0 === normalized_num.compare_absolute_values(2) ? this.is_even_num() : this.modulo_value(normalized_num).is_zero_num()));
        };
        BigIntNumber.prototype.is_divisible_by_num = SmallNumber.prototype.is_divisible_by_num = LargeNumber.prototype.is_divisible_by_num;
        LargeNumber.prototype.is_prime_num = function(is_strict){
          var trivial_check_res = check_prime_trivial(this);
          if (void 0 !== trivial_check_res) {
            return trivial_check_res;
          }
          var abs_val = this.absolute_value(),
            bit_len = abs_val.get_bit_length();
          if (bit_len <= 64) {
            return miller_rabin_test(abs_val, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
          }
          for (var log_val = Math.log(2) * bit_len.to_js_number_val(), num_tests = Math.ceil(true === is_strict ? 2 * Math.pow(log_val, 2) : log_val), test_bases_arr = [], idx = 0; idx < num_tests; idx++) {
            test_bases_arr.push(big_arithmetic(idx + 2));
          }
          return miller_rabin_test(abs_val, test_bases_arr);
        };
        BigIntNumber.prototype.is_prime_num = SmallNumber.prototype.is_prime_num = LargeNumber.prototype.is_prime_num;
        LargeNumber.prototype.is_probable_prime_num = function(num_iterations, rng_func){
          var trivial_check_res = check_prime_trivial(this);
          if (void 0 !== trivial_check_res) {
            return trivial_check_res;
          }
          for (var abs_val = this.absolute_value(), iterations = void 0 === num_iterations ? 5 : num_iterations, test_bases_arr = [], idx = 0; idx < iterations; idx++) {
            test_bases_arr.push(big_arithmetic.random_between(2, abs_val.minus_values(2), rng_func));
          }
          return miller_rabin_test(abs_val, test_bases_arr);
        };
        BigIntNumber.prototype.is_probable_prime_num = SmallNumber.prototype.is_probable_prime_num = LargeNumber.prototype.is_probable_prime_num;
        LargeNumber.prototype.modular_inverse = function(modulus_num){
          for (var q_val, r_val, s_val,
              zero_bignum = big_arithmetic.zero_val,
              one_bignum = big_arithmetic.unity_val,
              normalized_modulus = convert_to_bignum(modulus_num),
              abs_this = this.absolute_value(); !abs_this.is_zero_num();) {
            q_val = normalized_modulus.divide_values(abs_this);
            r_val = zero_bignum;
            s_val = normalized_modulus;
            zero_bignum = one_bignum;
            normalized_modulus = abs_this;
            one_bignum = r_val.subtract_values(q_val.multiply_values(one_bignum));
            abs_this = s_val.subtract_values(q_val.multiply_values(abs_this));
          }
          if (!normalized_modulus.is_unity()) {
            throw new Error(this.to_string_representation() + " and " + modulus_num.to_string_representation() + " are not co-prime");
          }
          return -1 === zero_bignum.compare_numbers(0) && (zero_bignum = zero_bignum.add_values(modulus_num)), this.is_negative_num() ? zero_bignum.negate_value() : zero_bignum;
        };
        BigIntNumber.prototype.modular_inverse = SmallNumber.prototype.modular_inverse = LargeNumber.prototype.modular_inverse;
        LargeNumber.prototype.get_next_num = function(){
          var this_val = this.value;
          return this.sign ? subtract_small_from_array(this_val, 1, this.sign) : new LargeNumber(add_small_to_array(this_val, 1), this.sign);
        };
        SmallNumber.prototype.get_next_num = function(){
          var this_val = this.value;
          return this_val + 1 < max_safe_val ? new SmallNumber(this_val + 1) : new LargeNumber(max_safe_digits, false);
        };
        BigIntNumber.prototype.get_next_num = function(){
          return new BigIntNumber(this.value + BigInt(1));
        };
        LargeNumber.prototype.get_prev_num = function(){
          var this_val = this.value;
          return this.sign ? new LargeNumber(add_small_to_array(this_val, 1), true) : subtract_small_from_array(this_val, 1, this.sign);
        };
        SmallNumber.prototype.get_prev_num = function(){
          var this_val = this.value;
          return this_val - 1 > -max_safe_val ? new SmallNumber(this_val - 1) : new LargeNumber(max_safe_digits, true);
        };
        BigIntNumber.prototype.get_prev_num = function(){
          return new BigIntNumber(this.value - BigInt(1));
        };
        for (var power_lookup_table = [1]; 2 * power_lookup_table[power_lookup_table.length - 1] <= digit_base;) {
          power_lookup_table.push(2 * power_lookup_table[power_lookup_table.length - 1]);
        }
        var table_length = power_lookup_table.length,
          last_power_val = power_lookup_table[table_length - 1];

        function is_shift_value_small(shift_val){
          return Math.abs(shift_val) <= digit_base;
        }

        function perform_bitwise_op(val1, val2, operation_func){
          val2 = convert_to_bignum(val2);
          for (var is_val1_neg = val1.is_negative_num(), is_val2_neg = val2.is_negative_num(),
              abs_val1 = is_val1_neg ? val1.bitwise_not() : val1,
              abs_val2 = is_val2_neg ? val2.bitwise_not() : val2,
              bit1_res = 0, bit2_res = 0,
              rem1 = null, rem2 = null,
              result_bits = []; !abs_val1.is_zero_num() || !abs_val2.is_zero_num();) {
            bit1_res = (rem1 = perform_division(abs_val1, last_power_val))[1].to_js_number_val();
            is_val1_neg && (bit1_res = last_power_val - 1 - bit1_res);
            bit2_res = (rem2 = perform_division(abs_val2, last_power_val))[1].to_js_number_val();
            is_val2_neg && (bit2_res = last_power_val - 1 - bit2_res);
            abs_val1 = rem1[0];
            abs_val2 = rem2[0];
            result_bits.push(operation_func(bit1_res, bit2_res));
          }
          for (var final_result = 0 !== operation_func(is_val1_neg ? 1 : 0, is_val2_neg ? 1 : 0) ? big_arithmetic(-1) : big_arithmetic(0), idx = result_bits.length - 1; idx >= 0; idx -= 1) {
            final_result = final_result.multiply_values(last_power_val).add_values(big_arithmetic(result_bits[idx]));
          }
          return final_result;
        }
        LargeNumber.prototype.shift_left_bits = function(shift_amount){
          var shift_val = convert_to_bignum(shift_amount).to_js_number_val();
          if (!is_shift_value_small(shift_val)) {
            throw new Error(String(shift_val) + " is too large for shifting.");
          }
          if (shift_val < 0) {
            return this.shift_right_bits(-shift_val);
          }
          var current_num = this;
          if (current_num.is_zero_num()) {
            return current_num;
          }
          for (; shift_val >= table_length;) {
            current_num = current_num.multiply_values(last_power_val);
            shift_val -= table_length - 1;
          }
          return current_num.multiply_values(power_lookup_table[shift_val]);
        };
        BigIntNumber.prototype.shift_left_bits = SmallNumber.prototype.shift_left_bits = LargeNumber.prototype.shift_left_bits;
        LargeNumber.prototype.shift_right_bits = function(shift_amount){
          var div_result,
            shift_val = convert_to_bignum(shift_amount).to_js_number_val();
          if (!is_shift_value_small(shift_val)) {
            throw new Error(String(shift_val) + " is too large for shifting.");
          }
          if (shift_val < 0) {
            return this.shift_left_bits(-shift_val);
          }
          for (var current_num = this; shift_val >= table_length;) {
            if (current_num.is_zero_num() || current_num.is_negative_num() && current_num.is_unity()) {
              return current_num;
            }
            current_num = (div_result = perform_division(current_num, last_power_val))[1].is_negative_num() ? div_result[0].get_prev_num() : div_result[0];
            shift_val -= table_length - 1;
          }
          return (div_result = perform_division(current_num, power_lookup_table[shift_val]))[1].is_negative_num() ? div_result[0].get_prev_num() : div_result[0];
        };
        BigIntNumber.prototype.shift_right_bits = SmallNumber.prototype.shift_right_bits = LargeNumber.prototype.shift_right_bits;
        LargeNumber.prototype.bitwise_not = function(){
          return this.negate_value().get_prev_num();
        };
        BigIntNumber.prototype.bitwise_not = SmallNumber.prototype.bitwise_not = LargeNumber.prototype.bitwise_not;
        LargeNumber.prototype.bitwise_and = function(other_num){
          return perform_bitwise_op(this, other_num, function(val1, val2){
            return val1 & val2;
          });
        };
        BigIntNumber.prototype.bitwise_and = SmallNumber.prototype.bitwise_and = LargeNumber.prototype.bitwise_and;
        LargeNumber.prototype.bitwise_or = function(other_num){
          return perform_bitwise_op(this, other_num, function(val1, val2){
            return val1 | val2;
          });
        };
        BigIntNumber.prototype.bitwise_or = SmallNumber.prototype.bitwise_or = LargeNumber.prototype.bitwise_or;
        LargeNumber.prototype.bitwise_xor = function(other_num){
          return perform_bitwise_op(this, other_num, function(val1, val2){
            return val1 ^ val2;
          });
        };
        BigIntNumber.prototype.bitwise_xor = SmallNumber.prototype.bitwise_xor = LargeNumber.prototype.bitwise_xor;
        var magic_val_z = 1 << 30,
          magic_val_underscore = (digit_base & -digit_base) * (digit_base & -digit_base) | magic_val_z;

        function get_lowest_bit(num_obj){
          var num_val = num_obj.value,
            result_val = typeof num_val === "number" ? num_val | magic_val_z : typeof num_val === "bigint" ? num_val | BigInt(magic_val_z) : num_val[0] + num_val[1] * digit_base | magic_val_underscore;
          return result_val & -result_val;
        }

        function get_maximum_val(val1, val2){
          return val1 = convert_to_bignum(val1), val2 = convert_to_bignum(val2), val1.is_greater(val2) ? val1 : val2;
        }

        function get_minimum_val(val1, val2){
          return val1 = convert_to_bignum(val1), val2 = convert_to_bignum(val2), val1.is_lesser(val2) ? val1 : val2;
        }

        function calculate_gcd(val1, val2){
          if (val1 = convert_to_bignum(val1).absolute_value(), val2 = convert_to_bignum(val2).absolute_value(), val1.are_equal(val2)) {
            return val1;
          }
          if (val1.is_zero_num()) {
            return val2;
          }
          if (val2.is_zero_num()) {
            return val1;
          }
          for (var r_val, o_val, result_prod = create_number[1]; val1.is_even_num() && val2.is_even_num();) {
            r_val = get_minimum_val(get_lowest_bit(val1), get_lowest_bit(val2));
            val1 = val1.divide_values(r_val);
            val2 = val2.divide_values(r_val);
            result_prod = result_prod.multiply_values(r_val);
          }
          for (; val1.is_even_num();) {
            val1 = val1.divide_values(get_lowest_bit(val1));
          }
          do {
            for (; val2.is_even_num();) {
              val2 = val2.divide_values(get_lowest_bit(val2));
            }
            val1.is_greater(val2) && (o_val = val2, val2 = val1, val1 = o_val);
            val2 = val2.subtract_values(val1);
          } while (!val2.is_zero_num());
          return result_prod.is_unity() ? val1 : val1.multiply_values(result_prod);
        }
        LargeNumber.prototype.get_bit_length = function(){
          var current_num = this;
          return current_num.compare_to_numbers(big_arithmetic(0)) < 0 && (current_num = current_num.negate_value().subtract_values(big_arithmetic(1))), 0 === current_num.compare_to_numbers(big_arithmetic(0)) ? big_arithmetic(0) : big_arithmetic(function calculate_exponent(target_val, base_val){
            if (base_val.compare_to_numbers(target_val) <= 0) {
              var result_obj = calculate_exponent(target_val, base_val.square_value()),
                p_val = result_obj.p_val,
                e_val = result_obj.e_val,
                product_val = p_val.multiply_values(base_val);
              return product_val.compare_to_numbers(target_val) <= 0 ? { p_val:product_val, e_val:2 * e_val + 1 } : { p_val:p_val, e_val:2 * e_val };
            }
            return { p_val:big_arithmetic(1), e_val:0 };
          }(current_num, big_arithmetic(2)).e_val).add_values(big_arithmetic(1));
        };
        BigIntNumber.prototype.get_bit_length = SmallNumber.prototype.get_bit_length = LargeNumber.prototype.get_bit_length;
        var parse_string_to_bignum = function(num_str, base_val, radix_chars, ignore_case){
          radix_chars = radix_chars || base_chars;
          num_str = String(num_str);
          ignore_case || (num_str = num_str.toLowerCase(), radix_chars = radix_chars.toLowerCase());
          var str_len = num_str.length,
            abs_base = Math.abs(base_val),
            char_map = {};
          for (var idx = 0; idx < radix_chars.length; idx++) {
            char_map[radix_chars[idx]] = idx;
          }
          for (idx = 0; idx < str_len; idx++) {
            var current_char;
            if ("-" !== (current_char = num_str[idx]) && (current_char in char_map && char_map[current_char] >= abs_base)) {
              if ("1" === current_char && 1 === abs_base) {
                continue;
              }
              throw new Error(current_char + " is not a valid digit in base " + base_val + ".");
            }
          }
          base_val = convert_to_bignum(base_val);
          var digit_list = [],
            is_negative = "-" === num_str[0];
          for (idx = is_negative ? 1 : 0; idx < num_str.length; idx++) {
            var current_char;
            if ((current_char = num_str[idx]) in char_map) {
              digit_list.push(convert_to_bignum(char_map[current_char]));
            } else {
              if ("<" !== current_char) {
                throw new Error(current_char + " is not a valid character");
              }
              var start_idx = idx;
              do {
                idx++;
              } while (">" !== num_str[idx] && idx < num_str.length);
              digit_list.push(convert_to_bignum(num_str.slice(start_idx + 1, idx)));
            }
          }
          return digits_to_bignum(digit_list, base_val, is_negative);
        };

        function digits_to_bignum(digit_list, base_val, is_negative){
          var idx,
            result_num = create_number[0],
            multiplier = create_number[1];
          for (idx = digit_list.length - 1; idx >= 0; idx--) {
            result_num = result_num.add_values(digit_list[idx].times_values(multiplier));
            multiplier = multiplier.times_values(base_val);
          }
          return is_negative ? result_num.negate_value() : result_num;
        }

        function bignum_to_digits_array(num_obj, base_val){
          if ((base_val = big_arithmetic(base_val)).is_zero_num()) {
            if (num_obj.is_zero_num()) {
              return { value:[0], isNegative:false };
            }
            throw new Error("Cannot convert nonzero numbers to base 0.");
          }
          if (base_val.are_equal(-1)) {
            if (num_obj.is_zero_num()) {
              return { value:[0], isNegative:false };
            }
            if (num_obj.is_negative_num()) {
              return { value:[].concat.apply([], Array.apply(null, Array(-num_obj.to_js_number_val())).map(Array.prototype.valueOf, [1, 0])), isNegative:false };
            }
            var digit_pairs = Array.apply(null, Array(num_obj.to_js_number_val() - 1)).map(Array.prototype.valueOf, [0, 1]);
            return digit_pairs.unshift([1]), { value:[].concat.apply([], digit_pairs), isNegative:false };
          }
          var is_negative = false;
          if (num_obj.is_negative_num() && base_val.is_positive_num() && (is_negative = true, num_obj = num_obj.absolute_value()), base_val.is_unity()) {
            return num_obj.is_zero_num() ? { value:[0], isNegative:false } : { value:Array.apply(null, Array(num_obj.to_js_number_val())).map(Number.prototype.valueOf, 1), isNegative:is_negative };
          }
          for (var division_res, result_digits = [], current_num = num_obj; current_num.is_negative_num() || current_num.compare_absolute_values(base_val) >= 0;) {
            division_res = current_num.get_division_remainder(base_val);
            current_num = division_res.quotient;
            var remainder = division_res.remainder;
            remainder.is_negative_num() && (remainder = base_val.minus_values(remainder).absolute_value(), current_num = current_num.get_next_num());
            result_digits.push(remainder.to_js_number_val());
          }
          return result_digits.push(current_num.to_js_number_val()), { value:result_digits.reverse(), isNegative:is_negative };
        }

        function bignum_to_base_string(num_obj, base_val, radix_chars){
          var conversion_result = bignum_to_digits_array(num_obj, base_val);
          return (conversion_result.isNegative ? "-" : "") + conversion_result.value.map(function(digit_val){
            return function(val, char_set){
              return val < (char_set = char_set || base_chars).length ? char_set[val] : "<" + val + ">";
            }(digit_val, radix_chars);
          }).join("");
        }

        function parse_integer_string(num_str){
          if (is_within_small_range(+num_str)) {
            var num_val = +num_str;
            if (num_val === round_to_int(num_val)) {
              return has_bigint_support ? new BigIntNumber(BigInt(num_val)) : new SmallNumber(num_val);
            }
            throw new Error("Invalid integer: " + num_str);
          }
          var is_negative = "-" === num_str[0];
          is_negative && (num_str = num_str.slice(1));
          var parts = num_str.split(/e/i);
          if (parts.length > 2) {
            throw new Error("Invalid integer: " + parts.join("e"));
          }
          if (2 === parts.length) {
            var exponent_str = parts[1];
            if ("+" === exponent_str[0] && (exponent_str = exponent_str.slice(1)), (exponent_str = +exponent_str) !== round_to_int(exponent_str) || !is_within_small_range(exponent_str)) {
              throw new Error("Invalid integer: " + exponent_str + " is not a valid exponent.");
            }
            var base_str = parts[0],
              decimal_point_idx = base_str.indexOf(".");
            if (decimal_point_idx >= 0 && (exponent_str -= base_str.length - decimal_point_idx - 1, base_str = base_str.slice(0, decimal_point_idx) + base_str.slice(decimal_point_idx + 1)), exponent_str < 0) {
              throw new Error("Cannot include negative exponent part for integers");
            }
            num_str = base_str += new Array(exponent_str + 1).join("0");
          }
          if (!/^([0-9][0-9]*)$/.test(num_str)) {
            throw new Error("Invalid integer: " + num_str);
          }
          if (has_bigint_support) {
            return new BigIntNumber(BigInt(is_negative ? "-" + num_str : num_str));
          }
          for (var digit_arr = [], str_len = num_str.length, digit_group_size = digit_count, start_idx = str_len - digit_group_size; str_len > 0;) {
            digit_arr.push(+num_str.slice(start_idx, str_len));
            (start_idx -= digit_group_size) < 0 && (start_idx = 0);
            str_len -= digit_group_size;
          }
          return trim_zeros(digit_arr), new LargeNumber(digit_arr, is_negative);
        }

        function convert_to_bignum(input_val){
          return typeof input_val === "number" ? function(num_val){
            if (has_bigint_support) {
              return new BigIntNumber(BigInt(num_val));
            }
            if (is_within_small_range(num_val)) {
              if (num_val !== round_to_int(num_val)) {
                throw new Error(num_val + " is not an integer.");
              }
              return new SmallNumber(num_val);
            }
            return parse_integer_string(num_val.toString());
          }(input_val) : typeof input_val === "string" ? parse_integer_string(input_val) : typeof input_val === "bigint" ? new BigIntNumber(input_val) : input_val;
        }
        LargeNumber.prototype.to_digit_array_representation = function(base_val){
          return bignum_to_digits_array(this, base_val);
        };
        SmallNumber.prototype.to_digit_array_representation = function(base_val){
          return bignum_to_digits_array(this, base_val);
        };
        BigIntNumber.prototype.to_digit_array_representation = function(base_val){
          return bignum_to_digits_array(this, base_val);
        };
        LargeNumber.prototype.to_string_representation = function(base_val, radix_chars){
          if (void 0 === base_val && (base_val = 10), 10 !== base_val) {
            return bignum_to_base_string(this, base_val, radix_chars);
          }
          for (var r_str, current_digits = this.value, num_digits = current_digits.length, result_str = String(current_digits[--num_digits]); --num_digits >= 0;) {
            r_str = String(current_digits[num_digits]);
            result_str += "0000000".slice(r_str.length) + r_str;
          }
          return (this.sign ? "-" : "") + result_str;
        };
        SmallNumber.prototype.to_string_representation = function(base_val, radix_chars){
          return void 0 === base_val && (base_val = 10), 10 != base_val ? bignum_to_base_string(this, base_val, radix_chars) : String(this.value);
        };
        BigIntNumber.prototype.to_string_representation = SmallNumber.prototype.to_string_representation;
        BigIntNumber.prototype.to_json_format = LargeNumber.prototype.to_json_format = SmallNumber.prototype.to_json_format = function(){
          return this.to_string_representation();
        };
        LargeNumber.prototype.to_js_number_val = function(){
          return Number.parseInt(this.to_string_representation(), 10);
        };
        SmallNumber.prototype.to_js_number_val = function(){
          return this.value;
        };
        BigIntNumber.prototype.to_js_number_val = function(){
          return Number.parseInt(this.to_string_representation(), 10);
        };
        for (var constant_gen_idx = 0; constant_gen_idx < 1e3; constant_gen_idx++) {
          create_number[constant_gen_idx] = convert_to_bignum(constant_gen_idx);
          constant_gen_idx > 0 && (create_number[-constant_gen_idx] = convert_to_bignum(-constant_gen_idx));
        }
        return create_number.unity_val = create_number[1],
          create_number.zero_val = create_number[0],
          create_number.negative_unity_val = create_number[-1],
          create_number.maximum_val = get_maximum_val,
          create_number.minimum_val = get_minimum_val,
          create_number.greatest_common_divisor = calculate_gcd,
          create_number.least_common_multiple = function(val1, val2){
            return val1 = convert_to_bignum(val1).absolute_value(), val2 = convert_to_bignum(val2).absolute_value(), val1.divide_values(calculate_gcd(val1, val2)).multiply_values(val2);
          },
          create_number.is_instance_of_bignum = function(obj){
            return obj instanceof LargeNumber || obj instanceof SmallNumber || obj instanceof BigIntNumber;
          },
          create_number.random_between = function(min_val, max_val, rng_func){
            min_val = convert_to_bignum(min_val);
            max_val = convert_to_bignum(max_val);
            var random_gen = rng_func || Math.random,
              lower_bound = get_minimum_val(min_val, max_val),
              range_size = get_maximum_val(min_val, max_val).subtract_values(lower_bound).add_values(1);
            if (range_size.isSmall) {
              return lower_bound.add_values(Math.floor(random_gen() * range_size));
            }
            for (var range_digits = bignum_to_digits_array(range_size, digit_base).value, random_digits = [], is_exact_match = true, idx = 0; idx < range_digits.length; idx++) {
              var upper_limit = is_exact_match ? range_digits[idx] : digit_base,
                digit_result = round_to_int(random_gen() * upper_limit);
              random_digits.push(digit_result);
              digit_result < upper_limit && (is_exact_match = false);
            }
            return lower_bound.add_values(create_number.from_digit_list(random_digits, digit_base, false));
          },
          create_number.from_digit_list = function(digit_list, base_val, is_negative){
            return digits_to_bignum(digit_list.map(convert_to_bignum), convert_to_bignum(base_val || 10), is_negative);
          }, create_number;
      }();
      export_target.hasOwnProperty("exports") && (export_target.exports = big_arithmetic);
      void 0 === (export_var = function(){
        return big_arithmetic;
      }.call(mod_exports, obtain_dep, mod_exports, export_target)) || (export_target.exports = export_var);
    }).call(this, obtain_dep(7)(mod_obj));
  },
  function(mod_obj, mod_exports){
    mod_exports.exports = function(target_mod){
      return target_mod.webpackPolyfill || (target_mod.deprecate = function(){}, target_mod.paths = [], target_mod.children || (target_mod.children = []), Object.defineProperty(target_mod, "loaded", { enumerable:true, get:function(){ return target_mod.l; } }), Object.defineProperty(target_mod, "id", { enumerable:true, get:function(){ return target_mod.i; } }), target_mod.webpackPolyfill = 1), target_mod;
    };
  }
]);