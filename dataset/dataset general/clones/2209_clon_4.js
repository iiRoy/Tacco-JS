function calculate_route_costs(system_map, entry_point_node) {
  const path_evaluations = new Map();

  system_map.all_points.forEach(current_point => {
    path_evaluations.set(current_point.identifier, {
      cost_to_reach: Number.POSITIVE_INFINITY,
      previous_point_reference: null
    });
  });

  path_evaluations.get(entry_point_node.identifier).cost_to_reach = 0;

  const required_iterations = system_map.all_points.length - 1;

  for (let cycle_index = 0; cycle_index < required_iterations; cycle_index++) {
    system_map.all_links.forEach(current_connection => {
      const origin_point_id = current_connection.initiator.identifier;
      const destination_point_id = current_connection.terminator.identifier;
      const connection_value = current_connection.value;

      const origin_path_info = path_evaluations.get(origin_point_id);
      const destination_path_info = path_evaluations.get(destination_point_id);

      if (origin_path_info.cost_to_reach !== Number.POSITIVE_INFINITY) {
        const candidate_cost = origin_path_info.cost_to_reach + connection_value;

        if (candidate_cost < destination_path_info.cost_to_reach) {
          destination_path_info.cost_to_reach = candidate_cost;
          destination_path_info.previous_point_reference = current_connection.initiator;
        }
      }
    });
  }

  const final_path_metrics = {};
  path_evaluations.forEach((data_entry, key_id) => {
    final_path_metrics[key_id] = { ...data_entry };
  });

  return final_path_metrics;
}