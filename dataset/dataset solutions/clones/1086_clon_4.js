let vertical_position_memo = new Map();

function retrieve_element(id_val, structure_map) {
  return structure_map.get(id_val) || null;
}

function construct_hierarchy(input_data_lines) {
  const element_collection = new Map();

  input_data_lines.forEach(entry => {
    const [id_num, left_id_num, right_id_num] = entry;
    element_collection.set(id_num, {
      identifier: id_num,
      parent_ref: null,
      left_child_ref: left_id_num === -1 ? null : left_id_num,
      right_child_ref: right_id_num === -1 ? null : right_id_num,
    });
  });

  element_collection.forEach(current_element => {
    if (current_element.left_child_ref !== null) {
      const child = element_collection.get(current_element.left_child_ref);
      if (child) child.parent_ref = current_element.identifier;
    }
    if (current_element.right_child_ref !== null) {
      const child = element_collection.get(current_element.right_child_ref);
      if (child) child.parent_ref = current_element.identifier;
    }
  });

  return element_collection;
}

function calculate_vertical_position(element_id, structure_map_ref) {
  if (vertical_position_memo.has(element_id)) {
    return vertical_position_memo.get(element_id);
  }

  let current_id_path = element_id;
  let current_depth_count = 0;
  let visited_ids = [];

  while (current_id_path !== null) {
    if (vertical_position_memo.has(current_id_path)) {
      current_depth_count += vertical_position_memo.get(current_id_path);
      break;
    }
    visited_ids.push(current_id_path);
    const elem = retrieve_element(current_id_path, structure_map_ref);
    if (!elem || elem.parent_ref === null) {
      break;
    }
    current_id_path = elem.parent_ref;
    current_depth_count++;
  }

  for (let i = 0; i < visited_ids.length; i++) {
    vertical_position_memo.set(visited_ids[visited_ids.length - 1 - i], current_depth_count - i);
  }

  return vertical_position_memo.get(element_id);
}

function determine_subtree_height(element_id, structure_map_ref) {
  if (element_id === null) {
    return -1;
  }
  const elem = retrieve_element(element_id, structure_map_ref);
  if (!elem) {
    return -1;
  }

  const left_subtree_height = determine_subtree_height(elem.left_child_ref, structure_map_ref);
  const right_subtree_height = determine_subtree_height(elem.right_child_ref, structure_map_ref);

  return 1 + Math.max(left_subtree_height, right_subtree_height);
}

function classify_element(element_obj) {
  if (element_obj.parent_ref === null) {
    return 'root';
  }
  if (element_obj.left_child_ref === null && element_obj.right_child_ref === null) {
    return 'leaf';
  }
  return 'internal node';
}

function present_structure_details(structure_map_to_display) {
  const output_lines = [];

  const sorted_elements = Array.from(structure_map_to_display.values()).sort((a, b) => a.identifier - b.identifier);

  sorted_elements.forEach(current_element => {
    const parent_identifier_val = current_element.parent_ref === null ? -1 : current_element.parent_ref;

    let partner_identifier_val = -1;
    const parent_element_obj = retrieve_element(current_element.parent_ref, structure_map_to_display);
    if (parent_element_obj) {
      if (parent_element_obj.left_child_ref === current_element.identifier && parent_element_obj.right_child_ref !== null) {
        partner_identifier_val = parent_element_obj.right_child_ref;
      } else if (parent_element_obj.right_child_ref === current_element.identifier && parent_element_obj.left_child_ref !== null) {
        partner_identifier_val = parent_element_obj.left_child_ref;
      }
    }

    const connection_count = (current_element.left_child_ref !== null ? 1 : 0) + (current_element.right_child_ref !== null ? 1 : 0);

    const elem_depth_val = calculate_vertical_position(current_element.identifier, structure_map_to_display);
    const elem_height_val = determine_subtree_height(current_element.identifier, structure_map_to_display);
    const elem_kind_val = classify_element(current_element);

    output_lines.push(
      `node: ${current_element.identifier}: parent = ${parent_identifier_val}, sibling = ${partner_identifier_val}, degree = ${connection_count}, depth = ${elem_depth_val}, height = ${elem_height_val}, ${elem_kind_val}`
    );
  });
  return output_lines;
}

(function execute_program(){
  const input_contents_string = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const total_nodes_count_val = Number(input_contents_string.shift());

  const parsed_node_definitions = input_contents_string.map(line_text => line_text.split(' ').map(Number));

  const tree_structure_map = construct_hierarchy(parsed_node_definitions);

  const final_output_strings = present_structure_details(tree_structure_map);
  console.log(final_output_strings.join('\n'));
})();