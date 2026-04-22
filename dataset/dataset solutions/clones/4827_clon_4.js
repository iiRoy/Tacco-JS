function invert_text_segment(text_val) {
  return Array.from(text_val).reduce((acc, char) => char + acc, '');
}

function validate_structure(source_text_input) {
  const inverted_lexemes = ['remard', 'merd', 'resare', 'esare'];
  const memoized_outcomes_cache = new Map();

  const initial_reversed_segment = invert_text_segment(source_text_input);

  function check_segmentation_possibility(current_reversed_segment) {
    if (memoized_outcomes_cache.has(current_reversed_segment)) {
      return memoized_outcomes_cache.get(current_reversed_segment);
    }

    if (current_reversed_segment.length === 0) {
      return true;
    }

    for (const inverted_unit of inverted_lexemes) {
      if (current_reversed_segment.startsWith(inverted_unit)) {
        const remaining_prefix_section = current_reversed_segment.substring(inverted_unit.length);
        if (check_segmentation_possibility(remaining_prefix_section)) {
          memoized_outcomes_cache.set(current_reversed_segment, true);
          return true;
        }
      }
    }

    memoized_outcomes_cache.set(current_reversed_segment, false);
    return false;
  }

  return check_segmentation_possibility(initial_reversed_segment);
}

function orchestrate_execution(incoming_data_stream) {
  const final_decision = validate_structure(incoming_data_stream);
  const outcome_phrase_map = new Map([[true, 'YES'], [false, 'NO']]);
  return outcome_phrase_map.get(final_decision);
}

const file_system_utility = require('node:fs');
const received_content = file_system_utility.readFileSync('/dev/stdin', 'utf8');

console.log(orchestrate_execution(received_content));