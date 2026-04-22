const console_adapter = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let collected_inputs = [];
let input_source_provider;
console_adapter.on('line', (data_line) => { collected_inputs.push(data_line); });
console_adapter.on('close', () => {
  input_source_provider = generate_input_accessor(collected_inputs);
  console.error("\n");
  const computation_start_time = Date.now();
  perform_computation();
  const computation_duration = Date.now() - computation_start_time;
  record_debug_info("duration : " + computation_duration + "ms");
  record_debug_info("memory_usage : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function deep_copy_object(original_object){ return JSON.parse(JSON.stringify(original_object)); }

function generate_input_accessor(lines_array) {
  let current_position = 0;
  const total_lines = lines_array.length;
  return {
    retrieve_next: () => {
      if (current_position < total_lines) {
        return lines_array[current_position++];
      } else {
        throw new Error("Input buffer exhausted. No more lines to read.");
      }
    },
    has_more_data: () => (current_position < total_lines)
  };
}

function get_next_segment() { return input_source_provider.retrieve_next(); }

function transform_segment(content_item, conversion_type_code) {
  try {
    switch (conversion_type_code) {
      case 1: return parseInt(content_item);
      case 2: return content_item.split(" ");
      case 4: return content_item.split(" ").map(Number);
      case 6: return content_item.split("");
      case 7: return content_item.split("").map(Number);
      case 8: return content_item.join(" ");
      case 9: return content_item.join("\n");
      case 0: return content_item.join("");
      default: return content_item;
    }
  } catch (e) {
    return content_item;
  }
}

function fetch_integer_val() { return transform_segment(get_next_segment(), 1); }
function fetch_integer_list() { return transform_segment(get_next_segment(), 4); }

function provide_output(data_to_display) { console.log(data_to_display); }
function record_debug_info(debug_message) { console.error("diagnostic:" + require("util").inspect(debug_message, false, null)); }

function perform_computation() {
  const initial_params = fetch_integer_list();
  const total_items_count = initial_params[0];
  const total_mechanisms_count = initial_params[1];

  const mechanism_details_store = new Map();
  const item_to_mechanism_map = new Map();

  Array.from({ length: total_mechanisms_count }, (_, k) => k + 1).forEach(mechanism_id => {
    const current_mechanism_data = fetch_integer_list();
    const mechanism_price = current_mechanism_data[0];
    const num_targets_for_mechanism = current_mechanism_data[1];
    const unlocked_item_ids = fetch_integer_list();

    mechanism_details_store.set(mechanism_id, { price: mechanism_price, targets: unlocked_item_ids });

    unlocked_item_ids.forEach(item_id => {
      if (!item_to_mechanism_map.has(item_id)) {
        item_to_mechanism_map.set(item_id, new Set());
      }
      item_to_mechanism_map.get(item_id).add(mechanism_id);
    });
  });

  const final_state = Array.from({ length: total_items_count }, (_, k) => k + 1).reduce((acc, current_item_id) => {
    if (acc.unsolvable_encountered) {
      return acc;
    }

    if (acc.covered_elements_tracker.has(current_item_id)) {
      return acc;
    }

    const potential_unlockers = item_to_mechanism_map.get(current_item_id);

    if (!potential_unlockers || potential_unlockers.size === 0) {
      acc.unsolvable_encountered = true;
      return acc;
    }

    let cheapest_unlock_price = Number.MAX_SAFE_INTEGER;
    let selected_mechanism_id = -1;

    Array.from(potential_unlockers).forEach(mechanism_candidate_id => {
      const candidate_info = mechanism_details_store.get(mechanism_candidate_id);
      if (candidate_info && candidate_info.price < cheapest_unlock_price) {
        cheapest_unlock_price = candidate_info.price;
        selected_mechanism_id = mechanism_candidate_id;
      }
    });

    if (selected_mechanism_id === -1) {
      acc.unsolvable_encountered = true;
      return acc;
    }

    acc.total_expense_sum += cheapest_unlock_price;
    const activated_targets = mechanism_details_store.get(selected_mechanism_id).targets;
    activated_targets.forEach(target_id => acc.covered_elements_tracker.add(target_id));

    return acc;
  }, { total_expense_sum: 0, covered_elements_tracker: new Set(), unsolvable_encountered: false });

  provide_output(final_state.unsolvable_encountered ? -1 : final_state.total_expense_sum);
}