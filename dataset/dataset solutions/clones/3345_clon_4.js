'use strict';
(function(source_text){
  const PRIME_MODULO = 1000000007;
  let lines_array = source_text.trim().split('\n');
  const person_count = Number(lines_array.shift());

  // Pre-calculate the number of set bits (population count) for all integers up to (1 << person_count) - 1
  const set_bit_counts = new Array(1 << person_count).fill(0);
  for (let val = 1; val < (1 << person_count); val++) {
      set_bit_counts[val] = set_bit_counts[val >> 1] + (val & 1);
  }

  const compatibility_matrix = lines_array.map(line => line.split(' ').map(Number));

  // Initialize a table to store the number of ways to form matchings
  // 'matching_combinations[mask]' represents the number of ways to match
  // 'set_bit_counts[mask]' individuals from the first group with the individuals
  // from the second group specified by 'mask'.
  const matching_combinations = new Array(1 << person_count).fill(0);
  matching_combinations[0] = 1; // Base case: 0 individuals matched with 0 individuals in 1 way.

  // Iterate through all possible configurations of matched individuals from the second group
  for (let current_config = 1; current_config < (1 << person_count); current_config++) {
      // The index of the individual from the first group being matched in this step
      // is determined by the number of set bits in the current configuration.
      const first_group_idx = set_bit_counts[current_config] - 1;

      // Consider each individual from the second group as a potential match for 'first_group_idx'
      for (let second_group_idx = 0; second_group_idx < person_count; second_group_idx++) {
          // Check if 'second_group_idx' is part of the 'current_config'
          if ((current_config >> second_group_idx) & 1) {
              // If 'first_group_idx' can be matched with 'second_group_idx'
              if (compatibility_matrix[first_group_idx][second_group_idx] === 1) {
                  // Calculate the configuration without 'second_group_idx'
                  const previous_config = current_config ^ (1 << second_group_idx);
                  
                  // Add the combinations from the previous state to the current state
                  matching_combinations[current_config] = (matching_combinations[current_config] + matching_combinations[previous_config]) % PRIME_MODULO;
              }
          }
      }
  }
  // The final result is the number of ways to match all individuals from the first group
  // with all individuals from the second group (represented by the mask (1 << person_count) - 1).
  console.log(matching_combinations[(1 << person_count) - 1]);
})(require('fs').readFileSync('/dev/stdin','utf8'));