function* value_provider(raw_data_string) {
  const line_segments = raw_data_string.trim().split('\n');
  for (const current_line_content of line_segments) {
    const numeric_tokens = current_line_content.split(' ');
    for (const token_value of numeric_tokens) {
      yield Number(token_value);
    }
  }
}

class MinValueHeap {
  constructor() {
    this.elements_data = [];
  }

  insert_element(item_to_add) {
    this.elements_data.push(item_to_add);
    this.heapify_up();
  }

  extract_smallest() {
    if (this.is_empty()) return null;
    const minimum_element = this.elements_data[0];
    const last_element = this.elements_data.pop();
    if (!this.is_empty()) {
      this.elements_data[0] = last_element;
      this.heapify_down();
    }
    return minimum_element;
  }

  is_empty() {
    return this.elements_data.length === 0;
  }

  heapify_up() {
    let current_idx = this.elements_data.length - 1;
    const added_element = this.elements_data[current_idx];
    while (current_idx > 0) {
      let parent_idx = Math.floor((current_idx - 1) / 2);
      let parent_element = this.elements_data[parent_idx];
      if (added_element.cost_value >= parent_element.cost_value) break;
      this.elements_data[parent_idx] = added_element;
      this.elements_data[current_idx] = parent_element;
      current_idx = parent_idx;
    }
  }

  heapify_down() {
    let current_idx = 0;
    const total_length = this.elements_data.length;
    const current_element = this.elements_data[0];
    while (true) {
      let left_child_idx = 2 * current_idx + 1;
      let right_child_idx = 2 * current_idx + 2;
      let left_child_elem, right_child_elem;
      let swap_idx = null;

      if (left_child_idx < total_length) {
        left_child_elem = this.elements_data[left_child_idx];
        if (left_child_elem.cost_value < current_element.cost_value) {
          swap_idx = left_child_idx;
        }
      }
      if (right_child_idx < total_length) {
        right_child_elem = this.elements_data[right_child_idx];
        if (
          (swap_idx === null && right_child_elem.cost_value < current_element.cost_value) ||
          (swap_idx !== null && right_child_elem.cost_value < left_child_elem.cost_value)
        ) {
          swap_idx = right_child_idx;
        }
      }

      if (swap_idx === null) break;
      this.elements_data[current_idx] = this.elements_data[swap_idx];
      this.elements_data[swap_idx] = current_element;
      current_idx = swap_idx;
    }
  }
}

const initialize_vector = (size_param, initial_fill_value) => Array.from({
  length: size_param
}, () => initial_fill_value);

const INFINITE_COST = 1000000007;

function determine_optimal_solution() {
  const data_stream_iterator = value_provider(require("fs").readFileSync("/dev/stdin", "utf8"));
  const retrieve_next_value = () => data_stream_iterator.next().value;

  const total_bit_count = retrieve_next_value();
  const number_of_options = retrieve_next_value();

  const option_definitions = Array.from({
    length: number_of_options
  }, () => {
    const option_price = retrieve_next_value();
    const num_associated_parts = retrieve_next_value();
    let coverage_bitmask = 0;
    for (let part_counter = 0; part_counter < num_associated_parts; part_counter++) {
      const part_identifier = retrieve_next_value();
      coverage_bitmask |= (1 << (part_identifier - 1));
    }
    return {
      cost_value: option_price,
      state_mask: coverage_bitmask
    };
  });

  const minimum_expenditure_to_achieve_mask = initialize_vector(1 << total_bit_count, INFINITE_COST);
  minimum_expenditure_to_achieve_mask[0] = 0;

  const exploration_queue = new MinValueHeap();
  exploration_queue.insert_element({
    cost_value: 0,
    state_mask: 0
  });

  while (!exploration_queue.is_empty()) {
    const {
      cost_value: current_accumulated_expenditure,
      state_mask: current_unlocked_status
    } = exploration_queue.extract_smallest();

    if (current_accumulated_expenditure > minimum_expenditure_to_achieve_mask[current_unlocked_status]) {
      continue;
    }

    for (const single_option of option_definitions) {
      const next_unlocked_status = current_unlocked_status | single_option.state_mask;
      const new_total_expenditure = current_accumulated_expenditure + single_option.cost_value;

      if (new_total_expenditure < minimum_expenditure_to_achieve_mask[next_unlocked_status]) {
        minimum_expenditure_to_achieve_mask[next_unlocked_status] = new_total_expenditure;
        exploration_queue.insert_element({
          cost_value: new_total_expenditure,
          state_mask: next_unlocked_status
        });
      }
    }
  }

  const fully_unlocked_mask = (1 << total_bit_count) - 1;
  const final_expenditure = minimum_expenditure_to_achieve_mask[fully_unlocked_mask];

  return final_expenditure === INFINITE_COST ? -1 : final_expenditure;
}

console.log(determine_optimal_solution());