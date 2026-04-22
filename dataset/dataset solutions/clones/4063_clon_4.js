function ExecuteConstraintSolver(raw_data_string) {
    const lines = raw_data_string.split("\n");

    const dimension_specs = lines[0].split(" ").map(Number);
    const point_count = dimension_specs[0];
    const constraint_count = dimension_specs[1];

    const constraint_triplets = [];
    for (let current_idx = 0; current_idx < constraint_count; current_idx++) {
        const parts = lines[current_idx + 1].split(" ").map(Number);
        constraint_triplets.push([parts[0], parts[1], parts[2]]);
    }

    let component_parents = Array.from({ length: point_count + 1 }, (_, index_val) => index_val);
    let component_relative_distances = Array.from({ length: point_count + 1 }, () => 0); // Stores value[i] - value[parent[i]]

    // Recursive function to find the root of an element and its relative distance to that root
    const find_component_info = (element_index) => {
        if (component_parents[element_index] === element_index) {
            return [element_index, 0]; // Element is its own root, relative distance is 0
        }
        // Recursively find the root of the parent and its distance
        const [ancestor_id, distance_to_ancestor] = find_component_info(component_parents[element_index]);
        
        // Path compression: set element's parent directly to the root
        component_parents[element_index] = ancestor_id;
        // Update element's relative distance to reflect the new parent (the root)
        component_relative_distances[element_index] += distance_to_ancestor;
        
        return [component_parents[element_index], component_relative_distances[element_index]];
    };

    let consistency_status = "Yes";

    for (const triple of constraint_triplets) {
        const source_node_id = triple[0];
        const destination_node_id = triple[1];
        const required_difference = triple[2]; // Represents: Pos(destination) - Pos(source) = required_difference

        const [source_root_id, source_offset_to_root] = find_component_info(source_node_id);
        const [destination_root_id, destination_offset_to_root] = find_component_info(destination_node_id);

        if (source_root_id === destination_root_id) {
            // Both nodes are already in the same connected component.
            // Check if the new constraint is consistent with existing ones.
            // Pos(destination) - Pos(source) should be equal to required_difference.
            // (Pos(root) + destination_offset_to_root) - (Pos(root) + source_offset_to_root) == required_difference
            // destination_offset_to_root - source_offset_to_root == required_difference
            if (destination_offset_to_root - source_offset_to_root !== required_difference) {
                consistency_status = "No";
                break; // Inconsistency found, no need to process further
            }
        } else {
            // Nodes are in different components, merge them.
            // We'll make the source_root_id's parent the destination_root_id.
            // We need to define component_relative_distances[source_root_id]
            // which is Pos(source_root_id) - Pos(destination_root_id).

            // From the constraint: Pos(destination_node_id) - Pos(source_node_id) = required_difference
            // Substitute using offsets to roots:
            // (Pos(destination_root_id) + destination_offset_to_root) - (Pos(source_root_id) + source_offset_to_root) = required_difference
            // Rearrange to find Pos(source_root_id) - Pos(destination_root_id):
            // Pos(source_root_id) - Pos(destination_root_id) = destination_offset_to_root - source_offset_to_root - required_difference

            component_parents[source_root_id] = destination_root_id;
            component_relative_distances[source_root_id] = destination_offset_to_root - source_offset_to_root - required_difference;
        }
    }

    console.log(consistency_status);
}

ExecuteConstraintSolver(require("fs").readFileSync("/dev/stdin", "utf8"));