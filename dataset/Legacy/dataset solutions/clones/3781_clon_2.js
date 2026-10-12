function ProcessInput(inputString) {
  // Parse the input string into an array of numbers
  inputString = inputString.split(" ").map(val => Number(val));

  // Extract problem parameters
  let totalItems = inputString[0]; // Represents 'n'
  let typeA_cost = inputString[1]; // Represents 'a'
  let typeB_cost = inputString[2]; // Represents 'b'
  let combined_cost = typeA_cost + typeB_cost; // Represents 'c'
  let target_sum = inputString[3]; // Represents 'k'

  // Initialize variables for the first search phase
  let initial_iterations = Math.floor(target_sum / combined_cost); // Represents 'j'
  let solution_found_flag = 0; // Represents 'f', indicates if any initial combination is found
  let current_combinations = []; // Represents 'z', stores (count_A, count_B) pairs

  // Iterate downwards to find initial valid combinations
  // This loop searches for (i * c + x * a) = k or (i * c + y * b) = k
  for (let current_iter = initial_iterations; current_iter >= 0; current_iter--) {
    const remaining_sum = target_sum - current_iter * combined_cost;

    // Check if remaining_sum can be formed by only typeA_cost items
    if (remaining_sum % typeA_cost === 0) {
      solution_found_flag = 1;
      current_combinations.push(remaining_sum / typeA_cost, 0); // Store (count_A, count_B)
    }

    // Check if remaining_sum can be formed by only typeB_cost items
    if (remaining_sum % typeB_cost === 0) {
      solution_found_flag = 1;
      current_combinations.push(0, remaining_sum / typeB_cost); // Store (count_A, count_B)
    }

    // If any combination is found, break early
    if (solution_found_flag) break;
  }

  // Update initial_iterations to the value of current_iter where a solution was found
  initial_iterations = current_iter;

  // If no initial combination was found, output 0 and exit
  if (!solution_found_flag) {
    console.log(0);
    return;
  }

  // Initialize the final result
  let final_result = 0; // Represents 'ans'

  // Calculate factors for expanding combinations
  // typeA_factor: how many 'a' items are equivalent to 'c'
  let typeA_factor = (combined_cost % typeA_cost === 0 ? combined_cost / typeA_cost : 0); // Represents 'aa'
  // typeB_factor: how many 'b' items are equivalent to 'c'
  let typeB_factor = (combined_cost % typeB_cost === 0 ? combined_cost / typeB_cost : 0); // Represents 'bb'

  // Main loop to calculate combinations and sum up results
  // Continues as long as there are combinations to process and initial_iterations is non-negative
  while (current_combinations.length > 0 && initial_iterations >= 0) {
    let next_combinations = []; // Represents 'y', stores combinations for the next iteration
    let seen_pairs = {}; // Represents 'x', used to track unique (count_A, count_B) pairs

    // Iterate through the current set of combinations (count_A, count_B)
    for (let idx = 0; idx < current_combinations.length; idx += 2) {
      const count_A = current_combinations[idx];
      const count_B = current_combinations[idx + 1];
      const pair_key = count_A + "x" + count_B; // Unique key for the pair

      // Skip if this pair has already been processed in this iteration
      if (seen_pairs[pair_key]) continue;

      // Skip if counts are negative or total items exceed 'n'
      if (count_A < 0 || count_B < 0 || initial_iterations + count_A + count_B > totalItems) continue;

      // Mark this pair as seen
      seen_pairs[pair_key] = 1;

      // Calculate and add the combinations to the final result
      // This involves nCr(n, j) * nCr(n-j, count_A) * nCr(n-j-count_A, count_B)
      final_result += calculateProductModulo(
        calculateCombinationsModulo(totalItems, initial_iterations),
        calculateCombinationsModulo(totalItems - initial_iterations, count_A),
        calculateCombinationsModulo(totalItems - initial_iterations - count_A, count_B)
      );
      final_result %= MODULUS_VALUE; // Apply modulo operation

      // Generate new combinations for the next iteration
      // 1. Increment both counts by 1 (representing one more 'c' item)
      next_combinations.push(count_A + 1, count_B + 1);
      // 2. If typeA_factor is valid, add a combination with increased 'a' count
      if (typeA_factor) next_combinations.push(count_A + typeA_factor, count_B);
      // 3. If typeB_factor is valid, add a combination with increased 'b' count
      if (typeB_factor) next_combinations.push(count_A, count_B + typeB_factor);
    }

    // Update current_combinations for the next iteration
    current_combinations = next_combinations;
    initial_iterations--; // Decrement 'j' for the next iteration
  }

  // Output the final calculated result
  console.log(final_result);
}

// Modulo value for all calculations
const MODULUS_VALUE = 998244353; // Represents 'mod'

// Precomputed factorials and inverse factorials
let factorial_values = [1, 1]; // Represents 'fact'
let inverse_factorials = [1, 1]; // Represents 'factinv'

/**
 * Calculates the product of multiple numbers modulo MODULUS_VALUE.
 * @param {...number} args - Numbers to multiply.
 * @returns {number} The product modulo MODULUS_VALUE.
 */
function calculateProductModulo() {
  let current_product = arguments[0]; // Represents 'rt'
  for (let arg_index = 1; arg_index < arguments.length; arg_index++) {
    // Optimized multiplication for modulo arithmetic
    current_product = (current_product >>> 16) * arguments[arg_index] % MODULUS_VALUE * 0x10000 + (current_product & 0xFFFF) * arguments[arg_index];
    current_product %= MODULUS_VALUE;
  }
  return current_product;
}

/**
 * Calculates (base^exponent) % MODULUS_VALUE using modular exponentiation (binary exponentiation).
 * @param {number} base - The base.
 * @param {number} exponent - The exponent.
 * @returns {number} (base^exponent) % MODULUS_VALUE.
 */
function powerModulo(base, exponent) {
  let result_val = 1; // Represents 'rt'
  while (exponent) {
    if (exponent & 1) result_val = calculateProductModulo(base, result_val);
    base = calculateProductModulo(base, base);
    exponent >>>= 1; // Right shift by 1 (equivalent to exponent = floor(exponent / 2))
  }
  return result_val;
}

/**
 * Computes factorial_values[num] modulo MODULUS_VALUE.
 * Populates factorial_values array up to 'num' if not already computed.
 * @param {number} num - The number for which to compute factorial.
 * @returns {number} factorial_values[num] % MODULUS_VALUE.
 */
function computeFactorialModulo(num) {
  for (let index = factorial_values.length; index <= num; index++) {
    factorial_values[index] = calculateProductModulo(factorial_values[index - 1], index);
  }
  return factorial_values[num];
}

/**
 * Computes inverse_factorials[num] modulo MODULUS_VALUE.
 * Populates inverse_factorials array up to 'num' if not already computed.
 * Uses Fermat's Little Theorem for modular inverse: a^(MODULUS_VALUE-2) % MODULUS_VALUE.
 * @param {number} num - The number for which to compute inverse factorial.
 */
function computeInverseFactorialModulo(num) {
  // Ensure factorial_values[num] is computed
  if (!factorial_values[num]) computeFactorialModulo(num);
  // Calculate inverse factorial for 'num'
  inverse_factorials[num] = powerModulo(factorial_values[num], MODULUS_VALUE - 2);
  // Backfill inverse factorials for smaller numbers using inverse_factorials[k-1] = inverse_factorials[k] * k
  while (!inverse_factorials[num - 1] && num > 0) {
    inverse_factorials[num - 1] = calculateProductModulo(inverse_factorials[num], num--);
  }
}

/**
 * Calculates nCr (n choose r) modulo MODULUS_VALUE.
 * nCr = n! / (r! * (n-r)!) = n! * (r!)^(-1) * ((n-r)!)^(-1) % MODULUS_VALUE.
 * @param {number} total - The total number of items (n).
 * @param {number} choose - The number of items to choose (r).
 * @returns {number} nCr % MODULUS_VALUE.
 */
function calculateCombinationsModulo(total, choose) {
  // Handle invalid inputs for combinations
  if (choose < 0 || choose > total) return 0;
  // Ensure inverse factorials are computed up to 'total'
  if (!inverse_factorials[total]) computeInverseFactorialModulo(total);
  // Calculate nCr using precomputed factorials and inverse factorials
  return calculateProductModulo(factorial_values[total], inverse_factorials[choose], inverse_factorials[total - choose]);
}

// Read input from stdin and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
