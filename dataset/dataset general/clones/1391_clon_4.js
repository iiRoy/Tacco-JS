Object.defineProperty(Array.prototype, 'populateWith', {
    value: function(val) {
        let count = this.length;
        for (let j = 0; j < count; ++j) {
            this[j] = val;
        }
    },
    enumerable: false
});

const liquid_sim_engine = function (grid_dim_x_param, grid_dim_y_param) {
  const engine_state = {};

  const ENERGY_RETENTION_FACTOR = 0.97;
  const SWIRL_RADIUS = 2;

  const directional_unit_vectors = [
    [1, 0],
    [1 / Math.SQRT2, 1 / Math.SQRT2],
    [0, 1],
    [-1 / Math.SQRT2, 1 / Math.SQRT2],
    [-1, 0],
    [-1 / Math.SQRT2, -1 / Math.SQRT2],
    [0, -1],
    [1 / Math.SQRT2, -1 / Math.SQRT2]
  ];

  const directional_indices_map = {
    EAST: 0,
    NORTHEAST: 1,
    NORTH: 2,
    NORTHWEST: 3,
    WEST: 4,
    SOUTHWEST: 5,
    SOUTH: 6,
    SOUTHEAST: 7
  };

  const exchange_coefficient = 0.0625;
  const diagonal_reduction_factor = 0.5;

  let medium_pressures_data;
  let motion_vectors_x_data;
  let motion_vectors_y_data;
  let boundary_exchange_values_data;
  let prior_exchange_values_data;
  let external_force_contributions_data;
  let obstruction_flags_data;

  const acquire_grid_index = (x_coord, y_coord) => y_coord * grid_dim_x_param + x_coord;
  const acquire_directional_array_index = (base_grid_idx, direction_enum) => base_grid_idx * 8 + direction_enum;

  const compute_scalar_product = (first_vec, second_vec) => first_vec[0] * second_vec[0] + first_vec[1] * second_vec[1];
  const calculate_vector_magnitude = (input_vec) => Math.sqrt(input_vec[0] * input_vec[0] + input_vec[1] * input_vec[1]);

  const establish_system_state = () => {
    const total_cells = grid_dim_x_param * grid_dim_y_param;
    medium_pressures_data = new Float32Array(total_cells);
    motion_vectors_x_data = new Float32Array(total_cells);
    motion_vectors_y_data = new Float32Array(total_cells);
    boundary_exchange_values_data = new Float32Array(total_cells * 8);
    prior_exchange_values_data = new Float32Array(total_cells * 8);
    external_force_contributions_data = new Float32Array(total_cells * 8);
    obstruction_flags_data = new Uint8Array(total_cells * 8);

    for (let current_y = 0; current_y < grid_dim_y_param; ++current_y) {
      for (let current_x = 0; current_x < grid_dim_x_param; ++current_x) {
        const current_cell_idx = acquire_grid_index(current_x, current_y);

        const is_at_min_x = current_x === 0;
        const is_at_max_x = current_x === grid_dim_x_param - 1;
        const is_at_min_y = current_y === 0;
        const is_at_max_y = current_y === grid_dim_y_param - 1;

        obstruction_flags_data[acquire_directional_array_index(current_cell_idx, directional_indices_map.EAST)] = is_at_max_x;
        obstruction_flags_data[acquire_directional_array_index(current_cell_idx, directional_indices_map.NORTHEAST)] = is_at_max_x || is_at_min_y;
        obstruction_flags_data[acquire_directional_array_index(current_cell_idx, directional_indices_map.NORTH)] = is_at_min_y;
        obstruction_flags_data[acquire_directional_array_index(current_cell_idx, directional_indices_map.NORTHWEST)] = is_at_min_x || is_at_min_y;
        obstruction_flags_data[acquire_directional_array_index(current_cell_idx, directional_indices_map.WEST)] = is_at_min_x;
        obstruction_flags_data[acquire_directional_array_index(current_cell_idx, directional_indices_map.SOUTHWEST)] = is_at_min_x || is_at_max_y;
        obstruction_flags_data[acquire_directional_array_index(current_cell_idx, directional_indices_map.SOUTH)] = is_at_max_y;
        obstruction_flags_data[acquire_directional_array_index(current_cell_idx, directional_indices_map.SOUTHEAST)] = is_at_max_x || is_at_max_y;
      }
    }
  };

  const normalize_system_pressure = () => {
    let current_total_pressure = 0;
    for (let i = 0; i < medium_pressures_data.length; ++i) {
      current_total_pressure += medium_pressures_data[i];
    }
    const pressure_differential_value = current_total_pressure / (-medium_pressures_data.length);
    for (let i = 0; i < medium_pressures_data.length; ++i) {
      medium_pressures_data[i] += pressure_differential_value;
    }
  };

  const compute_all_exchange_potentials = () => {
    for (let current_y = 0; current_y < grid_dim_y_param; ++current_y) {
      for (let current_x = 0; current_x < grid_dim_x_param; ++current_x) {
        const current_cell_idx = acquire_grid_index(current_x, current_y);
        const current_medium_pressure = medium_pressures_data[current_cell_idx];

        for (let dir = 0; dir < 8; ++dir) {
          const dir_array_idx = acquire_directional_array_index(current_cell_idx, dir);

          let adjacent_medium_pressure;
          if (obstruction_flags_data[dir_array_idx]) {
            adjacent_medium_pressure = current_medium_pressure;
          } else {
            const [delta_x, delta_y] = directional_unit_vectors[dir];
            let adjacent_x = current_x + Math.round(delta_x);
            let adjacent_y = current_y + Math.round(delta_y);

            adjacent_x = Math.max(0, Math.min(adjacent_x, grid_dim_x_param - 1));
            adjacent_y = Math.max(0, Math.min(adjacent_y, grid_dim_y_param - 1));

            const adjacent_cell_idx = acquire_grid_index(adjacent_x, adjacent_y);
            adjacent_medium_pressure = medium_pressures_data[adjacent_cell_idx];
          }

          let calculated_potential = (current_medium_pressure - adjacent_medium_pressure) * exchange_coefficient;
          if (dir % 2 === 1) {
            calculated_potential *= diagonal_reduction_factor;
          }
          boundary_exchange_values_data[dir_array_idx] = calculated_potential;
        }
      }
    }
  };

  const propagate_medium_state = () => {
    const next_cycle_pressures = new Float32Array(medium_pressures_data.length);
    next_cycle_pressures.set(medium_pressures_data);
    const current_cycle_exchange_snapshot = new Float32Array(boundary_exchange_values_data.length);

    for (let current_y = 0; current_y < grid_dim_y_param; ++current_y) {
      for (let current_x = 0; current_x < grid_dim_x_param; ++current_x) {
        const current_cell_idx = acquire_grid_index(current_x, current_y);

        for (let dir = 0; dir < 8; ++dir) {
          const dir_array_idx = acquire_directional_array_index(current_cell_idx, dir);
          
          let exchange_value = boundary_exchange_values_data[dir_array_idx] +
                               ENERGY_RETENTION_FACTOR * prior_exchange_values_data[dir_array_idx] +
                               external_force_contributions_data[dir_array_idx];

          current_cycle_exchange_snapshot[dir_array_idx] = exchange_value;

          if (!obstruction_flags_data[dir_array_idx]) {
            const [delta_x, delta_y] = directional_unit_vectors[dir];
            let adjacent_x = current_x + Math.round(delta_x);
            let adjacent_y = current_y + Math.round(delta_y);

            adjacent_x = Math.max(0, Math.min(adjacent_x, grid_dim_x_param - 1));
            adjacent_y = Math.max(0, Math.min(adjacent_y, grid_dim_y_param - 1));

            const adjacent_cell_idx = acquire_grid_index(adjacent_x, adjacent_y);
            
            next_cycle_pressures[adjacent_cell_idx] += exchange_value;
            next_cycle_pressures[current_cell_idx] -= exchange_value;
          }
        }
      }
    }

    medium_pressures_data.set(next_cycle_pressures);
    prior_exchange_values_data.set(current_cycle_exchange_snapshot);
    external_force_contributions_data.fill(0);
  };

  const derive_all_motion_vectors = () => {
    for (let current_y = 0; current_y < grid_dim_y_param; ++current_y) {
      for (let current_x = 0; current_x < grid_dim_x_param; ++current_x) {
        const current_cell_idx = acquire_grid_index(current_x, current_y);
        let current_motion_x = 0;
        let current_motion_y = 0;

        for (let dir = 0; dir < 8; ++dir) {
          const dir_array_idx = acquire_directional_array_index(current_cell_idx, dir);
          const exchange_val = boundary_exchange_values_data[dir_array_idx];
          const [vec_x, vec_y] = directional_unit_vectors[dir];

          current_motion_x += vec_x * exchange_val * 16;
          current_motion_y += vec_y * exchange_val * 16;
        }
        motion_vectors_x_data[current_cell_idx] = current_motion_x;
        motion_vectors_y_data[current_cell_idx] = current_motion_y;
      }
    }
  };

  engine_state.advance_simulation_cycle = () => {
    normalize_system_pressure();
    compute_all_exchange_potentials();
    propagate_medium_state();
    derive_all_motion_vectors();
  };

  engine_state.introduce_impulse = (input_x_normalized, input_y_normalized, impulse_vec_x, impulse_vec_y) => {
    let central_x_coord = Math.floor(input_x_normalized * grid_dim_x_param);
    let central_y_coord = Math.floor(input_y_normalized * grid_dim_y_param);

    central_x_coord = Math.max(0, Math.min(central_x_coord, grid_dim_x_param - 1));
    central_y_coord = Math.max(0, Math.min(central_y_coord, grid_dim_y_param - 1));

    const original_impulse_vector = [impulse_vec_x, impulse_vec_y];

    for (let delta_x_offset = -SWIRL_RADIUS; delta_x_offset <= SWIRL_RADIUS; ++delta_x_offset) {
      let target_x_coord = central_x_coord + delta_x_offset;
      target_x_coord = Math.max(0, Math.min(target_x_coord, grid_dim_x_param - 1));

      for (let delta_y_offset = -SWIRL_RADIUS; delta_y_offset <= SWIRL_RADIUS; ++delta_y_offset) {
        let target_y_coord = central_y_coord + delta_y_offset;
        target_y_coord = Math.max(0, Math.min(target_y_coord, grid_dim_y_param - 1));

        const current_cell_idx = acquire_grid_index(target_x_coord, target_y_coord);
        
        const offset_vector = [delta_x_offset, delta_y_offset];
        const attenuation_factor = 1 + calculate_vector_magnitude(offset_vector);
        const attenuated_impulse_x = original_impulse_vector[0] / attenuation_factor;
        const attenuated_impulse_y = original_impulse_vector[1] / attenuation_factor;
        const attenuated_impulse_vector = [attenuated_impulse_x, attenuated_impulse_y];

        for (let dir = 0; dir < 8; ++dir) {
          const dir_array_idx = acquire_directional_array_index(current_cell_idx, dir);
          const [vec_x, vec_y] = directional_unit_vectors[dir];
          const current_dir_vector = [vec_x, vec_y];

          if (obstruction_flags_data[dir_array_idx]) {
            medium_pressures_data[current_cell_idx] += calculate_vector_magnitude(attenuated_impulse_vector);
          } else {
            const dot_product_result = compute_scalar_product(attenuated_impulse_vector, current_dir_vector);

            external_force_contributions_data[dir_array_idx] += dot_product_result * 0.25;
            external_force_contributions_data[acquire_directional_array_index(current_cell_idx, (dir + 4) % 8)] -= dot_product_result * 0.125;
            external_force_contributions_data[acquire_directional_array_index(current_cell_idx, (dir + 4 + 8) % 8)] -= dot_product_result * 0.125;
          }
        }
      }
    }
  };

  engine_state.interpolate_motion_data = (query_x_normalized, query_y_normalized) => {
    let scaled_x_pos = query_x_normalized * grid_dim_x_param;
    let scaled_y_pos = query_y_normalized * grid_dim_y_param;

    if (scaled_x_pos >= grid_dim_x_param) scaled_x_pos -= grid_dim_x_param;
    if (scaled_x_pos < 0) scaled_x_pos = 0;
    if (scaled_y_pos >= grid_dim_y_param) scaled_y_pos -= grid_dim_y_param;
    if (scaled_y_pos < 0) scaled_y_pos = 0;

    const base_x_val = Math.floor(scaled_x_pos);
    const fractional_x = scaled_x_pos - base_x_val;

    const base_y_val = Math.floor(scaled_y_pos);
    const fractional_y = scaled_y_pos - base_y_val;

    const index_base_base = acquire_grid_index(base_x_val, base_y_val);
    const index_next_x_base = acquire_grid_index((base_x_val + 1) % grid_dim_x_param, base_y_val);
    const index_base_next_y = acquire_grid_index(base_x_val, (base_y_val + 1) % grid_dim_y_param);

    const resulting_flow_x = motion_vectors_x_data[index_base_base] * (1.0 - fractional_x) + motion_vectors_x_data[index_next_x_base] * fractional_x;
    const resulting_flow_y = motion_vectors_y_data[index_base_base] * (1.0 - fractional_y) + motion_vectors_y_data[index_base_next_y] * fractional_y;

    return [resulting_flow_x, resulting_flow_y];
  };

  establish_system_state();
  return engine_state;
};