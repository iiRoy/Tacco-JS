const calculatePathways = (source_data_blob) => {
  const prime_modulus = 998244353n;

  const data_segments = source_data_blob.trim().split('\n');
  const initial_configuration = data_segments.shift().split(' ').map(Number);
  const goal_location = initial_configuration[0];

  const range_specifications = data_segments.map(spec => spec.split(' ').map(Number));

  const unique_jump_distances = new Set();
  range_specifications.forEach(([start_bound, end_bound]) => {
    for (let current_distance = start_bound; current_distance <= end_bound; current_distance++) {
      unique_jump_distances.add(current_distance);
    }
  });

  const available_jumps = [...unique_jump_distances].sort((a, b) => a - b);

  const path_count_cache = new Map();

  const determinePathCount = (current_target_position, allowed_jumps, cache_store, modulus_value) => {
    if (current_target_position === 1) {
      return 1n; // One way to be at the starting position
    }
    if (current_target_position < 1) {
      return 0n; // Cannot reach positions before the start
    }
    if (cache_store.has(current_target_position)) {
      return cache_store.get(current_target_position);
    }

    let accumulated_paths = 0n;
    for (const jump_span of allowed_jumps) {
      accumulated_paths = (accumulated_paths + determinePathCount(current_target_position - jump_span, allowed_jumps, cache_store, modulus_value)) % modulus_value;
    }

    cache_store.set(current_target_position, accumulated_paths);
    return accumulated_paths;
  };

  const final_path_total = determinePathCount(goal_location, available_jumps, path_count_cache, prime_modulus);

  return console.log(`${(final_path_total % prime_modulus + prime_modulus) % prime_modulus}`);
};

calculatePathways(require('fs').readFileSync('/dev/stdin', 'utf8'));