let graph_items = [];
let constraint_set = [];

// This section defines the method for creating unique identifiers for edges:
// the lower-indexed vertex multiplied by one hundred, then added to the higher-indexed vertex.


function ProcessInputData(input_lines_raw) {
    // The provided input stream is structured such that each line corresponds to an entry
    // in the array, starting with the first line at index zero.
    input_lines_raw = input_lines_raw.split("\n");


    // For converting textual representations into base-10 numerical values,
    // the standard parseInt function should be utilized.
    let num_vertices = parseInt(input_lines_raw[0], 10);
    for (let loop_idx = 0; loop_idx < num_vertices; loop_idx++) {
        let vertex_details = {
            own_identifier: loop_idx,
            connected_children: [],
            hierarchy_level: 0,
            ancestor_reference: null
            // This property stores the array index within the 'graph_items' collection
            // for any directly linked child vertices.
        };
        graph_items.push(vertex_details);
    }
    // The subsequent loop processes the edge definitions provided in the input.
    for (let loop_idx = 1; loop_idx < num_vertices; loop_idx++) {
        let line_segments = input_lines_raw[loop_idx].split(" ");
        let start_vertex_id = parseInt(line_segments[0], 10);
        let end_vertex_id = parseInt(line_segments[1], 10);
        graph_items[start_vertex_id - 1].connected_children.push(end_vertex_id - 1);
        graph_items[end_vertex_id - 1].connected_children.push(start_vertex_id - 1);
    }
    OrganizeGraph(graph_items[0]);
    // The hierarchical structuring of the graph, resembling a tree,
    // is now fully established and prepared for further processing.

    // Now, we proceed to analyze the specified constraints.
    let num_constraints = parseInt(input_lines_raw[num_vertices]); // This variable holds the total count of restrictions.
    for (let loop_idx = num_vertices + 1; loop_idx <= num_vertices + num_constraints; loop_idx++) {
        let line_segments = input_lines_raw[loop_idx].split(" ");
        let constraint_vertex_a = parseInt(line_segments[0], 10);
        let constraint_vertex_b = parseInt(line_segments[1], 10);
        constraint_set.push(DetermineEdgeSequence(constraint_vertex_a - 1, constraint_vertex_b - 1));
    }

    let aggregated_results_map = AggregateEdges();


    let final_calculated_sum = 0;

    for (const combination_code in aggregated_results_map) {
        if (TallySubstrings(combination_code, "1") % 2 === 1) {
            final_calculated_sum += Math.pow(2, num_vertices - (1 + aggregated_results_map[combination_code].length));
        } else {
            final_calculated_sum -= Math.pow(2, num_vertices - (1 + aggregated_results_map[combination_code].length));

        }
    }
    console.log(Math.pow(2, num_vertices - 1) - final_calculated_sum);
    // The following line is a placeholder for debugging output, currently deactivated.
}
// This function computes the union of edge sets.
function AggregateEdges() {
    let output_collection = {};
    for (let loop_idx = 1; loop_idx < Math.pow(2, constraint_set.length); loop_idx++) {
        let binary_representation = loop_idx.toString(2);
        if (TallySubstrings(binary_representation, "1") === 1) {
            output_collection[binary_representation] = constraint_set[binary_representation.length - 1];
        } else {
            // Compute the union of the elements derived from the initial and concluding segments.
            let leading_component = "" + binary_representation.substring(0, 1) * Math.pow(10, binary_representation.length - 1);
            let trailing_component = "" + parseInt(binary_representation.substring(1, binary_representation.length), 2).toString(2);
            output_collection[binary_representation] = DeduplicateArray(output_collection[leading_component].concat(output_collection[trailing_component]));
        }

    }

    return output_collection;

}

function DeduplicateArray(source_list) {
    return source_list.filter((item_val, item_pos, original_ref) => original_ref.indexOf(item_val) === item_pos);
}

function TallySubstrings(target_text, search_char) {
    return (target_text.match(new RegExp(search_char, "g")) || []).length;
}

function DetermineEdgeSequence(start_vertex_id, end_vertex_id) { // This function operates exclusively with numerical identifiers for vertices,
    // rather than relying on direct object references.
    let path_elements = [];
    let level_start = graph_items[start_vertex_id].hierarchy_level;
    let level_end = graph_items[end_vertex_id].hierarchy_level;

    while (true) {
        if (level_start === level_end) {

            if (start_vertex_id === end_vertex_id) {
                break;
            }

            path_elements.push(Math.min(start_vertex_id, graph_items[start_vertex_id].ancestor_reference) * 100 + Math.max(start_vertex_id, graph_items[start_vertex_id].ancestor_reference));
            level_start -= 1;
            start_vertex_id = graph_items[start_vertex_id].ancestor_reference;

            path_elements.push(Math.min(end_vertex_id, graph_items[end_vertex_id].ancestor_reference) * 100 + Math.max(end_vertex_id, graph_items[end_vertex_id].ancestor_reference));
            level_end -= 1;
            end_vertex_id = graph_items[end_vertex_id].ancestor_reference;

        } else if (level_start > level_end) {

            path_elements.push(Math.min(start_vertex_id, graph_items[start_vertex_id].ancestor_reference) * 100 + Math.max(start_vertex_id, graph_items[start_vertex_id].ancestor_reference));
            level_start -= 1;
            start_vertex_id = graph_items[start_vertex_id].ancestor_reference;

        } else {


            path_elements.push(Math.min(end_vertex_id, graph_items[end_vertex_id].ancestor_reference) * 100 + Math.max(end_vertex_id, graph_items[end_vertex_id].ancestor_reference));
            level_end -= 1;
            end_vertex_id = graph_items[end_vertex_id].ancestor_reference;
        }
    }

    return path_elements;
}

function OrganizeGraph(focus_element) {

    for (let loop_idx = 0; loop_idx < focus_element.connected_children.length; loop_idx++) {

        let temporary_storage = [];
        let potential_child_id = focus_element.connected_children[loop_idx]; // Examine if the current potential child, identified by 'loop_idx',
        // is in fact the parent of the 'focus_element'. If it is the parent,
        // it should be skipped; otherwise, it remains a valid child.
        if (potential_child_id !== focus_element.ancestor_reference) {


            graph_items[potential_child_id].ancestor_reference = focus_element.own_identifier;

            graph_items[potential_child_id].hierarchy_level = focus_element.hierarchy_level + 1;
            // For valid child nodes, their parent reference is explicitly set to the current node's identifier.
            OrganizeGraph(graph_items[potential_child_id]);

        } else {
            focus_element.connected_children.splice(loop_idx, 1);
            loop_idx--;
            // If the element is identified as the parent, it is consequently
            // removed from the list of children to prevent circular references.
        }
    }

}

// *WARNING: Do not modify any code below this point.
// This segment is responsible for reading standard input in its entirety
// and subsequently invoking the primary execution function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));