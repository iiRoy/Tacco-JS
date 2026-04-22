const process_input_data = (raw_lines) => {
  const point_count = Number(raw_lines[0]);
  const spatial_points = raw_lines
    .slice(1, point_count + 1)
    .map((line) => line.split(" ").map(Number));

  const calculate_euclidean_distance = (coord1, coord2) =>
    Math.hypot(coord1[0] - coord2[0], coord1[1] - coord2[1]);

  const separation_matrix = Array.from({ length: point_count }, () =>
    Array(point_count).fill(0)
  );

  for (let idx1 = 0; idx1 < point_count; ++idx1) {
    for (let idx2 = idx1 + 1; idx2 < point_count; ++idx2) {
      const current_separation = calculate_euclidean_distance(
        spatial_points[idx1],
        spatial_points[idx2]
      );
      separation_matrix[idx1][idx2] = current_separation;
      separation_matrix[idx2][idx1] = current_separation;
    }
  }

  const generate_all_sequences = (num_elements) => {
    const initial_elements = Array.from({ length: num_elements }, (_, k) => k);
    const permutation_set = [];
    const counters = Array(num_elements).fill(0);

    permutation_set.push([...initial_elements]);

    let current_index = 1;
    while (current_index < num_elements) {
      if (counters[current_index] < current_index) {
        if (current_index % 2 === 0) {
          [initial_elements[0], initial_elements[current_index]] = [
            initial_elements[current_index],
            initial_elements[0],
          ];
        } else {
          [
            initial_elements[counters[current_index]],
            initial_elements[current_index],
          ] = [
            initial_elements[current_index],
            initial_elements[counters[current_index]],
          ];
        }
        permutation_set.push([...initial_elements]);
        counters[current_index]++;
        current_index = 1;
      } else {
        counters[current_index] = 0;
        current_index++;
      }
    }
    return permutation_set;
  };

  const all_permutations = generate_all_sequences(point_count);

  const sum_sequence_distances = (matrix_data, sequence_indices) =>
    sequence_indices.slice(1).reduce((accumulator, current_vertex_idx, path_step) => {
      const previous_vertex_idx = sequence_indices[path_step];
      return accumulator + matrix_data[previous_vertex_idx][current_vertex_idx];
    }, 0);

  const total_path_sum = all_permutations.reduce((acc, current_path) => {
    return acc + sum_sequence_distances(separation_matrix, current_path);
  }, 0);

  console.log(total_path_sum / all_permutations.length);
};

process_input_data(require('fs').readFileSync('/dev/stdin', 'utf8').split("\n"));