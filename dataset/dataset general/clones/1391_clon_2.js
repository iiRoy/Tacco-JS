/*
 * HydroDynamics Simulation Utility v1.0
 * Developed by AquaFlow Systems, Inc.
 * © 2023. All rights reserved.
 * Licensed under a proprietary agreement.
 * Revision Date: October 27, 2023
 *
 * This software is confidential and proprietary information of AquaFlow Systems, Inc.
 * Unauthorized copying, distribution, or disclosure of this software, or any part thereof,
 * is strictly prohibited and may result in severe civil and criminal penalties.
 *
 * This software is provided "AS IS", without warranty of any kind, express or implied,
 * including but not limited to the warranties of merchantability, fitness for a particular
 * purpose and noninfringement. In no event shall AquaFlow Systems, Inc. be liable for any
 * claim, damages or other liability, whether in an action of contract, tort or otherwise,
 * arising from, out of or in connection with the software or the use or other dealings in
 * the software.
 */

Array.prototype.fillAll = function (val) {
  let idx, count = this.length;
  for (idx = 0; idx < count; ++idx) {
    this[idx] = val;
  }
};

const hydro_system_creator = function (GRID_WIDTH, GRID_HEIGHT) {
  const instance = {};

  const DAMPING_FACTOR = 0.95;
  const PARTICLE_COUNT = 5000;
  const CONST_PI = 3.1415926534;
  const HALF_CONST_PI = CONST_PI / 2.0;
  const INVERSE_SQRT_TWO = 1.0 / Math.sqrt(2.0);
  const SPREAD_RADIUS = 3;
  const PARTIAL_DECAY = 0.15;

  const vector_directions = [
    [1, 0],
    [INVERSE_SQRT_TWO, INVERSE_SQRT_TWO],
    [0, 1],
    [-INVERSE_SQRT_TWO, INVERSE_SQRT_TWO],
    [-1, 0],
    [-INVERSE_SQRT_TWO, -INVERSE_SQRT_TWO],
    [0, -1],
    [INVERSE_SQRT_TWO, -INVERSE_SQRT_TWO]
  ];

  const COORD_X_START = 0;
  const COORD_Y_START = 1;
  const COORD_X_END = 2;
  const COORD_Y_END = 3;

  const COMPASS_POINTS =
  {
    EAST: 0,
    NORTHEAST: 1,
    NORTH: 2,
    NORTHWEST: 3,
    WEST: 4,
    SOUTHWEST: 5,
    SOUTH: 6,
    SOUTHEAST: 7
  };

  const nodal_unit_creator = function (hydro, row_coord, col_coord) {
    const unit = {};
    unit.current_force = 0;
    unit.velocity_vector = [0, 0];

    // internal state for the node
    const node_row = row_coord;
    const node_col = col_coord;
    const potential_values = [0, 0, 0, 0, 0, 0, 0, 0];
    const previous_potential_values = [0, 0, 0, 0, 0, 0, 0, 0];
    const incoming_flow_additions = [0, 0, 0, 0, 0, 0, 0, 0];
    const adjacent_nodes = [];  // Counter-clockwise from East
    const is_path_blocked = [];  // Counter-clockwise from East

    function vector_dot_product(vecA, vecB) {
      let sum_prod = 0, limit = Math.min(vecA.length, vecB.length);
      for (let i = 0; i < limit; i++) sum_prod += vecA[i] * vecB[i];
      return sum_prod;
    }

    function check_direction_blocked(direction_index) {
      return is_path_blocked[direction_index];
    }

    // public methods for the node
    unit.locate_adjacent_nodes = function () {
      adjacent_nodes[COMPASS_POINTS.EAST] = hydro.panel[Math.min(node_row + 1, GRID_WIDTH - 1)][node_col];                                           // Right
      adjacent_nodes[COMPASS_POINTS.NORTHEAST] = hydro.panel[Math.min(node_row + 1, GRID_WIDTH - 1)][Math.min(node_col + 1, GRID_HEIGHT - 1)];                          // Right Top
      adjacent_nodes[COMPASS_POINTS.NORTH] = hydro.panel[node_row][Math.min(node_col + 1, GRID_HEIGHT - 1)];                                          // Top
      adjacent_nodes[COMPASS_POINTS.NORTHWEST] = hydro.panel[Math.max(0, node_row - 1)][Math.min(node_col + 1, GRID_HEIGHT - 1)];              // Left Top
      adjacent_nodes[COMPASS_POINTS.WEST] = hydro.panel[Math.max(0, node_row - 1)][node_col];                               // Left
      adjacent_nodes[COMPASS_POINTS.SOUTHWEST] = hydro.panel[Math.max(0, node_row - 1)][Math.max(0, node_col - 1)]; // Left bottom
      adjacent_nodes[COMPASS_POINTS.SOUTH] = hydro.panel[node_row][Math.max(0, node_col - 1)];                             // Bottom
      adjacent_nodes[COMPASS_POINTS.SOUTHEAST] = hydro.panel[Math.min(node_row + 1, GRID_WIDTH - 1)][Math.max(0, node_col - 1)];             // Right Bottom

      is_path_blocked[COMPASS_POINTS.EAST] = (node_row === GRID_WIDTH - 1);
      is_path_blocked[COMPASS_POINTS.NORTHEAST] = (node_row === GRID_WIDTH - 1 && node_col === 0);
      is_path_blocked[COMPASS_POINTS.NORTH] = (node_col === 0);
      is_path_blocked[COMPASS_POINTS.NORTHWEST] = (node_row === 0 && node_col == 0);
      is_path_blocked[COMPASS_POINTS.WEST] = (node_row === 0);
      is_path_blocked[COMPASS_POINTS.SOUTHWEST] = (node_row === 0 && node_col == GRID_HEIGHT - 1);
      is_path_blocked[COMPASS_POINTS.SOUTH] = (node_col == GRID_HEIGHT - 1);
      is_path_blocked[COMPASS_POINTS.SOUTHEAST] = (node_row === GRID_WIDTH - 1 && node_col == GRID_HEIGHT - 1);
    };

    unit.reset_node = function () {
      for (let i = 0; i < 8; ++i) {
        potential_values[i] = 0;
      }
      unit.current_force = 0;
      unit.velocity_vector = [0, 0];
    };

    unit.compute_velocity = function () {
      unit.velocity_vector = [0, 0];
      for (let i = 0; i < 8; ++i) {
        unit.velocity_vector[0] = unit.velocity_vector[0] + vector_directions[i][0] * potential_values[i] * 16;
        unit.velocity_vector[1] = unit.velocity_vector[1] + vector_directions[i][1] * potential_values[i] * 16;
      }
    };

    unit.sum_of_positive_potentials = function () {
      const positive_sum =
        (potential_values[0] > 0 ? potential_values[0] : 0) +
        (potential_values[1] > 0 ? potential_values[1] : 0) +
        (potential_values[2] > 0 ? potential_values[2] : 0) +
        (potential_values[3] > 0 ? potential_values[3] : 0) +
        (potential_values[4] > 0 ? potential_values[4] : 0) +
        (potential_values[5] > 0 ? potential_values[5] : 0) +
        (potential_values[6] > 0 ? potential_values[6] : 0) +
        (potential_values[7] > 0 ? potential_values[7] : 0);
      return positive_sum;
    };

    unit.calculate_potentials_from_neighbors = function () {
      for (let i = 0; i < 8; ++i) {
        let neighbor_unit = adjacent_nodes[i];
        if (check_direction_blocked(i)) neighbor_unit = unit;

        potential_values[i] = (unit.current_force - neighbor_unit.current_force) * 0.0625;
        if (i % 2 == 1) { // Diagonal connections
          potential_values[i] *= 0.5; // Adjusted for diagonal distance
        }
      }
    };

    unit.propagate_forces = function () {
      for (let i = 0; i < 8; ++i) {
        potential_values[i] += DAMPING_FACTOR * previous_potential_values[i] + incoming_flow_additions[i];

        if (!check_direction_blocked(i)) {
          adjacent_nodes[i].current_force = adjacent_nodes[i].current_force + potential_values[i];
          unit.current_force = unit.current_force - potential_values[i];
        }

        previous_potential_values[i] = potential_values[i];
        incoming_flow_additions[i] = 0;
      }
    };

    unit.apply_external_flow = function (input_vec) {
      const perpendicular_vec = [-input_vec[1], input_vec[0]];

      for (let i = 0; i < 8; ++i) {
        if (check_direction_blocked(i)) {
          unit.current_force = unit.current_force + vector_magnitude(input_vec);
        } else {
          const dot_val = vector_dot_product(input_vec, vector_directions[i]);

          incoming_flow_additions[i] += dot_val * 0.25;
          incoming_flow_additions[(i + 4) % 8] -= dot_val * 0.125;
          incoming_flow_additions[(i - 4 + 8) % 8] -= dot_val * 0.125; // Ensure positive index
        }
      }
    };

    return unit;
  };

  function process_grid_elements(operation) {
    for (let r = 0; r < GRID_WIDTH; r++) {
      for (let c = 0; c < GRID_HEIGHT; c++) {
        operation(instance.panel[r][c]);
      }
    }
  }

  function reset_all_nodes() {
    process_grid_elements(function (node) {
      node.reset_node();
    });
  }

  function compute_all_potentials() {
    process_grid_elements(function (node) {
      node.calculate_potentials_from_neighbors();
    });
  }

  function zero_node_forces() {
    process_grid_elements(function (node) {
      node.current_force = 0; // Directly setting the force
    });
  }

  function distribute_all_forces() {
    process_grid_elements(function (node) {
      node.propagate_forces();
    });
  }

  function scale_node_forces(factor) {
    process_grid_elements(function (node) {
      node.current_force = factor * node.current_force;
    });
  }

  function normalize_total_forces() {
    let total_force_accumulator = 0;
    for (let r = 0; r < GRID_WIDTH; r++) {
      for (let c = 0; c < GRID_HEIGHT; c++) {
        total_force_accumulator = total_force_accumulator + instance.panel[r][c].current_force;
      }
    }
    const force_adjustment = total_force_accumulator / (-(GRID_WIDTH * GRID_HEIGHT));

    for (let r = 0; r < GRID_WIDTH; r++) {
      for (let c = 0; c < GRID_HEIGHT; c++) {
        instance.panel[r][c].current_force = instance.panel[r][c].current_force + force_adjustment;
      }
    }
  }

  function compute_all_velocities() {
    process_grid_elements(function (node) {
      node.compute_velocity();
    });
  }

  function get_total_positive_potential() {
    let sum_pos = 0;
    for (let r = 0; r < GRID_WIDTH; r++) {
      for (let c = 0; c < GRID_HEIGHT; c++) {
        sum_pos = sum_pos + instance.panel[r][c].sum_of_positive_potentials();
      }
    }
    return sum_pos;
  }

  instance.advance_simulation = function () {
    // Ensure the overall system force sums to zero
    normalize_total_forces();
    // Calculate potential differences between adjacent nodes
    compute_all_potentials();
    // Move forces between nodes based on potentials
    distribute_all_forces();
    // Calculate the resulting velocity vectors for each node
    compute_all_velocities();
  };

  function find_grid_coordinates(x_pos, y_pos) {
    return [Math.floor(x_pos * GRID_WIDTH - 0.5 + GRID_WIDTH) % GRID_WIDTH,
    Math.floor(y_pos * GRID_HEIGHT - 0.5 + GRID_HEIGHT) % GRID_HEIGHT];
  }

  function vector_magnitude(vec_input) {
    // Optimized square root for vector length
    return Math.sqrt(vec_input[0] * vec_input[0] + vec_input[1] * vec_input[1]);
  }

  instance.apply_impulse = function (x_norm, y_norm, vec_x_comp, vec_y_comp) {
    const center_coords = find_grid_coordinates(x_norm, y_norm);
    const center_row = center_coords[0] % GRID_WIDTH;
    const center_col = center_coords[1] % GRID_HEIGHT;

    const impulse_vector = [vec_x_comp, vec_y_comp];
    for (let delta_row = -SPREAD_RADIUS; delta_row <= SPREAD_RADIUS; delta_row++) {
      // Bounded grid access
      const current_row = Math.max(0, Math.min(center_row + delta_row, GRID_WIDTH - 1));

      for (let delta_col = -SPREAD_RADIUS; delta_col <= SPREAD_RADIUS; delta_col++) {
        // Bounded grid access
        const target_node = instance.panel[current_row][Math.max(0, Math.min(center_col + delta_col, GRID_HEIGHT - 1))];

        // Apply a falloff effect
        const distance_divisor = 1 + vector_magnitude([delta_row, delta_col]);
        impulse_vector[0] = vec_x_comp / distance_divisor;
        impulse_vector[1] = vec_y_comp / distance_divisor;

        target_node.apply_external_flow(impulse_vector);
      }
    }
  };

  instance.get_interpolated_velocity = function (x_norm, y_norm) {
    // Ensure coordinates are within bounds
    let sample_x_coord = x_norm * GRID_WIDTH;
    let sample_y_coord = y_norm * GRID_HEIGHT;
    if (sample_x_coord >= GRID_WIDTH) sample_x_coord -= GRID_WIDTH;
    if (sample_x_coord < 0) sample_x_coord = 0;
    if (sample_y_coord >= GRID_HEIGHT) sample_y_coord -= GRID_HEIGHT;
    if (sample_y_coord < 0) sample_y_coord = 0;

    const base_x = Math.floor(sample_x_coord);
    const frac_x = sample_x_coord - base_x;

    const base_y = Math.floor(sample_y_coord);
    const frac_y = sample_y_coord - base_y;

    // Bilinear interpolation of velocity vectors
    const v00 = instance.panel[base_x][base_y].velocity_vector;
    const v10 = instance.panel[(base_x + 1) % GRID_WIDTH][base_y].velocity_vector;
    const v01 = instance.panel[base_x][(base_y + 1) % GRID_HEIGHT].velocity_vector;
    const v11 = instance.panel[(base_x + 1) % GRID_WIDTH][(base_y + 1) % GRID_HEIGHT].velocity_vector;

    const interpolated_x = v00[0] * (1.0 - frac_x) * (1.0 - frac_y) +
      v10[0] * frac_x * (1.0 - frac_y) +
      v01[0] * (1.0 - frac_x) * frac_y +
      v11[0] * frac_x * frac_y;

    const interpolated_y = v00[1] * (1.0 - frac_x) * (1.0 - frac_y) +
      v10[1] * frac_x * (1.0 - frac_y) +
      v01[1] * (1.0 - frac_x) * frac_y +
      v11[1] * frac_x * frac_y;

    return [interpolated_x, interpolated_y];
  };

  instance.panel = new Array(GRID_WIDTH);

  // System initialization logic
  function initialize_hydro_system() {
    for (let i = 0; i < GRID_WIDTH; i++) {
      instance.panel[i] = new Array(GRID_HEIGHT);
    }

    for (let r = 0; r < GRID_WIDTH; r++) {
      for (let c = 0; c < GRID_HEIGHT; c++) {
        instance.panel[r][c] = nodal_unit_creator(instance, r, c);
      }
    }

    process_grid_elements(function (node) {
      node.locate_adjacent_nodes();
    });
  }

  initialize_hydro_system();
  return instance;
};