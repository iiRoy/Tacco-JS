'use strict'

const LARGE_VALUE = Infinity;

function extractNumericSequence(textLine) {
    return textLine.match(/-?\d+/g).map(Number);
}

function findBoundary(orderedCollection, initial_idx, final_idx, target_val) {
    if (initial_idx >= final_idx) {
        return initial_idx;
    }
    const mid_point = Math.floor((initial_idx + final_idx) / 2);
    if (orderedCollection[mid_point] < target_val) {
        return findBoundary(orderedCollection, mid_point + 1, final_idx, target_val);
    } else {
        return findBoundary(orderedCollection, initial_idx, mid_point, target_val);
    }
}

class SegmentNode {
    constructor(begin, end) { // Represents the range [begin, end)
        this.begin_index = begin;
        this.end_index = end;
        this.set_val = LARGE_VALUE; // Value assigned to this node's range, if fully covered
        this.left_child_node = null;
        this.right_child_node = null;
    }
}

class IntervalAssignmentTracker {
    constructor(item_count) {
        this.top_node = new SegmentNode(0, item_count);
    }

    // Set a value for a given index range [range_start_idx, range_end_idx)
    setRangeValue(range_start_idx, range_end_idx, specific_value) {
        this._recursiveSet(this.top_node, range_start_idx, range_end_idx, specific_value);
    }

    _recursiveSet(current_node, query_start, query_end, value_to_set) {
        // No overlap between current node's range and query range
        if (current_node.begin_index >= query_end || current_node.end_index <= query_start) {
            return;
        }

        // Current node's range is fully contained within the update range
        if (current_node.begin_index >= query_start && current_node.end_index <= query_end) {
            current_node.set_val = value_to_set; // Assign the value to this node
            return;
        }

        // Partial overlap, create children if needed and recurse
        if (current_node.left_child_node === null) {
            const mid = Math.floor((current_node.begin_index + current_node.end_index) / 2);
            current_node.left_child_node = new SegmentNode(current_node.begin_index, mid);
            current_node.right_child_node = new SegmentNode(mid, current_node.end_index);
        }

        this._recursiveSet(current_node.left_child_node, query_start, query_end, value_to_set);
        this._recursiveSet(current_node.right_child_node, query_start, query_end, value_to_set);
    }

    // Get the minimum value associated with a specific index
    queryPointValue(point_idx) {
        let minimum_found = LARGE_VALUE;
        let current_tree_node = this.top_node;

        while (current_tree_node !== null) {
            // The value set at any ancestor node is a candidate for the minimum
            minimum_found = Math.min(minimum_found, current_tree_node.set_val);

            // If it's a leaf node or the point is outside this node's range, we've gone as deep as possible
            if (current_tree_node.begin_index + 1 === current_tree_node.end_index || point_idx < current_tree_node.begin_index || point_idx >= current_tree_node.end_index) {
                break;
            }

            // Decide which child node to traverse
            const mid = Math.floor((current_tree_node.begin_index + current_tree_node.end_index) / 2);
            if (point_idx < mid) {
                current_tree_node = current_tree_node.left_child_node;
            } else {
                current_tree_node = current_tree_node.right_child_node;
            }
        }
        return minimum_found === LARGE_VALUE ? -1 : minimum_found;
    }
}

function ProcessInput(rawContent) {
    const contentLines = rawContent.trim().split('\n');
    let lineCursor = 0;

    const initialParams = extractNumericSequence(contentLines[lineCursor++]);
    const num_items = initialParams[0];
    const num_queries = initialParams[1];

    const item_data_list = [];
    for (let current_item_idx = 0; current_item_idx < num_items; current_item_idx++) {
        item_data_list.push(extractNumericSequence(contentLines[lineCursor++]));
    }

    const query_point_list = [];
    for (let current_query_idx = 0; current_query_idx < num_queries; current_query_idx++) {
        query_point_list.push(Number(contentLines[lineCursor++]));
    }

    // Sort item_data_list by its third element (value) in descending order
    item_data_list.sort((itemA, itemB) => itemB[2] - itemA[2]);

    const result_tracker = new IntervalAssignmentTracker(num_queries);

    for (const current_item of item_data_list) {
        const [start_val, end_val, item_value] = current_item;

        // Optimization: skip if the 'effective end' point (end - value - 1) is less than the first query point.
        if (end_val - item_value - 1 < query_point_list[0]) {
            continue;
        }

        const effective_start_threshold = start_val - item_value;
        const effective_end_threshold = end_val - item_value;

        // Find the range of indices in query_point_list that satisfy the condition
        const range_begin_index = findBoundary(query_point_list, 0, num_queries, effective_start_threshold);
        const range_end_index = findBoundary(query_point_list, range_begin_index, num_queries, effective_end_threshold);

        if (range_begin_index < range_end_index) {
            result_tracker.setRangeValue(range_begin_index, range_end_index, item_value);
        }
    }

    const final_results = new Array(num_queries);
    for (let idx = 0; idx < num_queries; idx++) {
        final_results[idx] = result_tracker.queryPointValue(idx);
    }

    console.log(final_results.join("\n"));
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));