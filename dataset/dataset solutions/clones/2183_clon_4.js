const multiplicativeSequence = (limitValue) => {
  let accumulatedProduct = 1n;
  for (let counter = 2n; counter <= limitValue; counter++) {
    accumulatedProduct *= counter;
  }
  return accumulatedProduct;
};

const chooseElements = (totalElements, elementsToChoose) => {
  if (elementsToChoose < 0n || elementsToChoose > totalElements) return 0n;
  if (elementsToChoose === 0n || elementsToChoose === totalElements) return 1n;
  if (elementsToChoose > totalElements / 2n) elementsToChoose = totalElements - elementsToChoose;

  let combinationResult = 1n;
  for (let idx = 1n; idx <= elementsToChoose; idx++) {
    combinationResult = combinationResult * (totalElements - idx + 1n) / idx;
  }
  return combinationResult;
};

const arrangementCache = {}; // Cache for memoization

const computeArrangementCount = (
  numeric_text,
  desired_count,
  total_chars,
  current_position_index,
  one_instances_found,
  is_prefix_exact
) => {
  const cache_key = `${current_position_index}_${one_instances_found}_${is_prefix_exact}`;
  if (arrangementCache[cache_key] !== undefined) {
    return arrangementCache[cache_key];
  }

  if (current_position_index >= total_chars) {
    return 1n;
  }

  let current_arrangement_total = 0n;
  const remaining_ones_needed = desired_count - one_instances_found;
  const remaining_digit_slots = total_chars - current_position_index;

  // Early exit if impossible to meet criteria
  if (remaining_ones_needed < 0n || remaining_ones_needed > remaining_digit_slots) {
      return 0n;
  }

  if (is_prefix_exact) {
    const current_char_value = BigInt(numeric_text[current_position_index]);

    // Case: Current digit of N is not '0'
    if (current_char_value !== 0n) {
      // If remaining slots don't exactly match remaining '1's needed
      if (remaining_digit_slots !== remaining_ones_needed) {
        // If '1's are still needed
        if (remaining_ones_needed > 0n) {
          // Calculate combinations for '0' at current position
          const combination_sub_result = chooseElements(remaining_digit_slots - 1n, remaining_ones_needed);
          current_arrangement_total += remaining_ones_needed * 9n * combination_sub_result;
        }
      }
      // If remaining slots exactly match remaining '1's needed
      else {
        // If '1's are still needed
        if (remaining_ones_needed > 0n) {
          current_arrangement_total += 1n; // For the case of filling all remaining with '1's
        }
      }

      // Logic for `num2` in original code (note the overwrite behavior)
      let temporary_num_accumulation = 0n;
      if (remaining_ones_needed > 0n) {
        if (current_char_value > 1n) {
          // This line is effectively overwritten by the next line in the original code.
          // Replicating the bug/quirk where this calculation is discarded.
          temporary_num_accumulation = (current_char_value - 1n) * computeArrangementCount(numeric_text, desired_count, total_chars, current_position_index + 1n, one_instances_found + 1n, false);
        }
        // This calculation overwrites `temporary_num_accumulation` regardless of `current_char_value > 1n`
        temporary_num_accumulation = computeArrangementCount(numeric_text, desired_count, total_chars, current_position_index + 1n, one_instances_found + 1n, true);
      }
      current_arrangement_total += temporary_num_accumulation;
    }
    // Case: Current digit of N is '0'
    else {
      current_arrangement_total += computeArrangementCount(numeric_text, desired_count, total_chars, current_position_index + 1n, one_instances_found, true);
    }
  }
  // Case: Prefix is no longer exact (pflag is false in original)
  else {
    if (remaining_ones_needed > 0n) {
      const combination_sub_result = chooseElements(remaining_digit_slots, remaining_ones_needed);
      current_arrangement_total += remaining_ones_needed * 9n * combination_sub_result;
    }
  }

  arrangementCache[cache_key] = current_arrangement_total;
  return current_arrangement_total;
};

function processInput(full_text_input) {
  const data_lines = full_text_input.split("\n");
  const numeric_text = data_lines[0];
  const desired_count = BigInt(data_lines[1]);
  const total_chars = BigInt(numeric_text.length);

  const final_result = computeArrangementCount(numeric_text, desired_count, total_chars, 0n, 0n, true);

  console.log(final_result.toString());
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));