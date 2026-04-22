let hasOwn = Object.prototype.hasOwnProperty;

let requiring = function(path) { /* This function would typically load external modules. */ };
let providing = function(namespace) { /* This function would typically define namespaces for a library. */ };

let utility = {
    string: {
        toCamelCase: function(str) {
            return str.replace(/_([a-z])/g, function(g) { return g[1].toUpperCase(); });
        }
    }
};

requiring("utility.string");

let domix = {};
domix.logic = {};

providing("domix.logic");
providing("domix.logic.Coalesce");
providing("domix.logic.Discard");

let dbg_log_func;
let tag_regex_pattern;
let svg_elem_regex_pattern;
let space_chars_regex;
let ns_separator_regex_pattern;
let data_key_prefix_char;
let xml_namespaces_map;
let get_qualified_tag_info;
let is_exploded_array_check;
let is_coalesce_object_check;
let is_discard_object_check;
let is_list_type_check;
let is_object_map_check;
let is_dom_node_check;
let is_text_string_check;
let is_numeric_value_check;
let is_blank_node_check;

dbg_log_func = function(input_val) {
    console.log(input_val);
    return input_val;
};

tag_regex_pattern = /([^\s\.#]+)(?:#([^\s\.#]+))?(?:\.([^\s#]+))?/;
svg_elem_regex_pattern = /^(svg|g|rect|circle|clipPath|path|line|polygon|polyline|text|textPath)$/;
space_chars_regex = /^\s+$/;
ns_separator_regex_pattern = /:(.+)/;

data_key_prefix_char = "\0";

xml_namespaces_map = {
    xhtml: "http://www.w3.org/1999/xhtml",
    xlink: "http://www.w3.org/1999/xlink",
    svg: "http://www.w3.org/2000/svg",
    xml: "http://www.w3.org/XML/1999/namespace",
    xmlns: "http://www.w3.org/2000/xmlns"
};

get_qualified_tag_info = function(element_tag_string) {
    let namespace_part, actual_tag, temporary_reference;
    temporary_reference = element_tag_string.split(":");
    namespace_part = temporary_reference[0];
    actual_tag = temporary_reference[1];

    if (actual_tag != null) {
        return [xml_namespaces_map[namespace_part] || namespace_part, actual_tag];
    } else {
        if (element_tag_string.match(svg_elem_regex_pattern)) {
            return [xml_namespaces_map.svg, element_tag_string];
        } else {
            return [xml_namespaces_map.xhtml, element_tag_string];
        }
    }
};

is_exploded_array_check = function(val_to_check) {
    return val_to_check[0] === ":*:";
};

is_coalesce_object_check = function(item_to_check) {
    return (item_to_check != null) && (item_to_check instanceof domix.logic.Coalesce);
};

is_discard_object_check = function(item_to_check) {
    return (item_to_check != null) && (item_to_check instanceof domix.logic.Discard);
};

is_list_type_check = function(item_to_check) {
    return (item_to_check != null) && (item_to_check.forEach != null);
};

is_object_map_check = function(item_to_check) {
    return (item_to_check != null) && (!is_list_type_check(item_to_check)) && (!is_coalesce_object_check(item_to_check)) && (!is_discard_object_check(item_to_check)) && (item_to_check instanceof Object);
};

is_dom_node_check = function(item_to_check) {
    return (item_to_check != null) && (item_to_check.nodeType != null);
};

is_text_string_check = function(item_to_check) {
    return (item_to_check != null) && (item_to_check.substring != null);
};

is_numeric_value_check = function(item_to_check) {
    return (item_to_check != null) && (item_to_check.toFixed != null);
};

is_blank_node_check = function(node_elem) {
    return node_elem.nodeType === 8 || (node_elem.nodeType === 3 && node_elem.textContent.match(space_chars_regex));
};

domix.logic.apply_styles = function(target_element, style_map) {
    let style_key, style_value, collected_results;
    collected_results = [];
    for (style_key in style_map) {
        if (!hasOwn.call(style_map, style_key)) continue;
        style_value = style_map[style_key];
        collected_results.push(target_element.style[utility.string.toCamelCase(style_key)] = style_value);
    }
    return collected_results;
};

domix.logic.set_properties = function(target_element, properties_map) {
    let property_name, property_value, collected_results;
    collected_results = [];
    for (property_name in properties_map) {
        if (!hasOwn.call(properties_map, property_name)) continue;
        property_value = properties_map[property_name];
        collected_results.push(target_element[property_name] = property_value);
    }
    return collected_results;
};

domix.logic.manage_attributes = function(target_element, attribute_mappings) {
    let attribute_name_key, attribute_value, namespace_prefix, attribute_identifier, temp_ref_val;
    let collected_modifications = [];

    if (attribute_mappings["style"] != null) {
        domix.logic.apply_styles(target_element, attribute_mappings["style"]);
        delete attribute_mappings["style"];
    }
    if (attribute_mappings["properties"] != null) {
        domix.logic.set_properties(target_element, attribute_mappings["properties"]);
        delete attribute_mappings["properties"];
    }
    if (is_list_type_check(attribute_mappings["class"])) {
        target_element.setAttribute("class", attribute_mappings["class"].join(" "));
        delete attribute_mappings["class"];
    }

    for (attribute_name_key in attribute_mappings) {
        if (!hasOwn.call(attribute_mappings, attribute_name_key)) continue;
        attribute_value = attribute_mappings[attribute_name_key];

        if (attribute_value != null) {
            temp_ref_val = attribute_name_key.split(ns_separator_regex_pattern);
            namespace_prefix = temp_ref_val[0];
            attribute_identifier = temp_ref_val[1];

            if (attribute_identifier != null) {
                collected_modifications.push(target_element.setAttributeNS(xml_namespaces_map[namespace_prefix] || namespace_prefix, attribute_identifier, attribute_value));
            } else {
                collected_modifications.push(target_element.setAttribute(attribute_name_key, attribute_value));
            }
        } else {
            collected_modifications.push(target_element.removeAttribute(attribute_name_key));
        }
    }
    return collected_modifications;
};

domix.logic.retrieve_node_data = function(element_node, data_payload) {
    if (data_payload != null) {
        return element_node["__domix_data__"] = data_payload;
    } else {
        return element_node["__domix_data__"];
    }
};

domix.logic.normalize_structure = function(input_item) {
    if (is_numeric_value_check(input_item)) {
        return input_item.toString();
    } else if (is_list_type_check(input_item)) {
        return domix.logic.normalize_hiccup_array(input_item);
    } else {
        return input_item;
    }
};

domix.logic.normalize_hiccup_array = function(hiccup_array) {
    let discarded_match, element_tag_name, element_id_value, class_string_value;
    let namespace_identifier, final_tag_name;
    let attribute_obj, child_elements_list;
    let short_class_names;
    let normalized_output;
    let temporary_ref_one, temporary_ref_two, temporary_ref_three;

    element_tag_name = hiccup_array[0];

    temporary_ref_one = is_object_map_check(hiccup_array[1])
        ? [hiccup_array[1], hiccup_array.slice(2)]
        : [{}, hiccup_array.slice(1)];
    attribute_obj = temporary_ref_one[0];
    child_elements_list = temporary_ref_one[1];

    temporary_ref_two = element_tag_name.match(tag_regex_pattern);
    discarded_match = temporary_ref_two[0];
    element_tag_name = temporary_ref_two[1];
    element_id_value = temporary_ref_two[2];
    class_string_value = temporary_ref_two[3];

    if (element_id_value != null) {
        attribute_obj["id"] = element_id_value;
    }

    if (class_string_value != null) {
        short_class_names = class_string_value.split(".");
        if (is_list_type_check(attribute_obj["class"])) {
            attribute_obj["class"] = attribute_obj["class"].concat(short_class_names);
        } else if (is_text_string_check(attribute_obj["class"])) {
            attribute_obj["class"] = short_class_names.concat([attribute_obj["class"]]);
        } else if (attribute_obj["class"] == null) {
            attribute_obj["class"] = short_class_names;
        }
    }

    temporary_ref_three = get_qualified_tag_info(element_tag_name);
    namespace_identifier = temporary_ref_three[0];
    final_tag_name = temporary_ref_three[1];

    let processed_children = [];
    child_elements_list.forEach(function(current_child_item) {
        if (current_child_item != null) {
            if (is_exploded_array_check(current_child_item)) {
                return current_child_item.slice(1).forEach(function(sub_child_item) {
                    return processed_children.push(domix.logic.normalize_structure(sub_child_item));
                });
            } else {
                return processed_children.push(domix.logic.normalize_structure(current_child_item));
            }
        }
    });

    normalized_output = {
        namespace: namespace_identifier,
        tag_name: final_tag_name,
        attributes: attribute_obj,
        children_nodes: processed_children
    };
    return normalized_output;
};

domix.logic.generate_dom = function(model_item) {
    let created_element, current_child_node;

    if (is_coalesce_object_check(model_item)) {
        throw new Error("Coalesce object must be the sole and first child of its parent.");
    } else if (is_discard_object_check(model_item)) {
        return null;
    } else if (is_text_string_check(model_item)) {
        return document.createTextNode(model_item);
    } else if (is_dom_node_check(model_item)) {
        return model_item;
    } else {
        created_element = document.createElementNS(model_item.namespace, model_item.tag_name);
        domix.logic.manage_attributes(created_element, model_item.attributes);

        current_child_node = model_item.children_nodes[0];
        if (is_coalesce_object_check(current_child_node)) {
            if (current_child_node.enter_callback != null) {
                current_child_node.input_data.forEach(function(item_data) {
                    let new_child_elem;
                    new_child_elem = current_child_node.enter_callback(item_data);
                    domix.logic.retrieve_node_data(new_child_elem, item_data);
                    return created_element.appendChild(new_child_elem);
                });
            } else {
                current_child_node.input_data.forEach(function(item_data) {
                    let new_child_elem;
                    new_child_elem = domix.logic.generate_dom(domix.logic.normalize_structure(current_child_node.data_mapping(item_data)));
                    domix.logic.retrieve_node_data(new_child_elem, item_data);
                    return created_element.appendChild(new_child_elem);
                });
            }
        } else {
            model_item.children_nodes.forEach(function(child_model) {
                let rendered_child;
                rendered_child = domix.logic.generate_dom(child_model);
                if (rendered_child != null) {
                    return created_element.appendChild(rendered_child);
                }
            });
        }
        return created_element;
    }
};

domix.logic.Coalesce = function(input_data, data_mapping, key_generator, enter_cb, update_cb, exit_cb, force_update_flag) {
    let self = this;
    self.input_data = input_data;
    self.data_mapping = data_mapping;
    self.key_generator = key_generator;
    self.enter_callback = enter_cb;
    self.update_callback = update_cb;
    self.exit_callback = exit_cb;
    self.force_update_flag = force_update_flag;
    return self;
};

domix.logic.Discard = function() {
    let self = this;
    return self;
};

domix.logic.coalesce_dom_nodes = function(parent_element, coalesce_instance) {
    let entry_handler, update_handler, exit_handler, key_identifier_func;
    let child_dom_nodes, data_length;
    let input_data_map, map_data_to_key, map_node_to_key;
    let conditional_update, insert_at_position;
    let unique_key, index_counter;
    let retained_nodes_map;

    entry_handler = coalesce_instance.enter_callback || function(data_payload) {
        let new_generated_element;
        new_generated_element = domix.logic.generate_dom(domix.logic.normalize_structure(coalesce_instance.data_mapping(data_payload)));
        parent_element.appendChild(new_generated_element);
        return new_generated_element;
    };

    update_handler = coalesce_instance.update_callback || function(node_to_update, data_payload) {
        return domix.logic.combine_elements(node_to_update, domix.logic.normalize_structure(coalesce_instance.data_mapping(data_payload)));
    };

    exit_handler = coalesce_instance.exit_callback || function(node_to_remove) {
        return parent_element.removeChild(node_to_remove);
    };

    key_identifier_func = coalesce_instance.key_generator || function(data_payload, current_index) {
        return current_index;
    };

    child_dom_nodes = parent_element.childNodes;
    map_data_to_key = function(data_payload, current_index) {
        return data_key_prefix_char + key_identifier_func(data_payload, current_index);
    };
    map_node_to_key = function(node_elem, current_index) {
        return map_data_to_key(domix.logic.retrieve_node_data(node_elem), current_index);
    };

    conditional_update = function(node_elem, data_payload) {
        let generated_element, data_is_same, previous_data;
        if (coalesce_instance.force_update_flag) {
            generated_element = update_handler(node_elem, data_payload);
            return domix.logic.retrieve_node_data(generated_element, data_payload);
        } else {
            previous_data = domix.logic.retrieve_node_data(node_elem);
            data_is_same = previous_data != null && typeof previous_data.cljs$core$IEquiv$_equiv$arity$2 === 'function'
                ? previous_data.cljs$core$IEquiv$_equiv$arity$2(previous_data, data_payload)
                : previous_data === data_payload;

            if (!data_is_same) {
                generated_element = update_handler(node_elem, data_payload);
                return domix.logic.retrieve_node_data(generated_element, data_payload);
            }
        }
    };

    insert_at_position = function(node_elem, position_index) {
        if (position_index < child_dom_nodes.length) {
            return parent_element.insertBefore(node_elem, child_dom_nodes[position_index]);
        } else {
            return parent_element.appendChild(node_elem);
        }
    };

    input_data_map = {};
    coalesce_instance.input_data.forEach(function(data_payload, current_index) {
        let current_key;
        current_key = map_data_to_key(data_payload, current_index);
        return input_data_map[current_key] = data_payload;
    });

    retained_nodes_map = {};
    index_counter = 0;
    while (index_counter < child_dom_nodes.length) {
        unique_key = map_node_to_key(child_dom_nodes[index_counter], index_counter);
        if (input_data_map[unique_key]) {
            retained_nodes_map[unique_key] = child_dom_nodes[index_counter];
        }
        index_counter += 1;
    }

    coalesce_instance.input_data.forEach(function(data_payload, current_index) {
        let generated_element_ref, current_node_ref, node_key_value, data_key_value;
        current_node_ref = current_index < child_dom_nodes.length ? child_dom_nodes[current_index] : undefined;
        node_key_value = current_node_ref ? map_node_to_key(current_node_ref, current_index) : undefined;
        data_key_value = map_data_to_key(data_payload, current_index);

        if (current_node_ref == null) {
            generated_element_ref = entry_handler(data_payload);
            return domix.logic.retrieve_node_data(generated_element_ref, data_payload);
        } else if (node_key_value === data_key_value) {
            return conditional_update(child_dom_nodes[current_index], data_payload);
        } else {
            if (!retained_nodes_map[node_key_value]) {
                exit_handler(current_node_ref);
            }
            if (retained_nodes_map[data_key_value]) {
                generated_element_ref = retained_nodes_map[data_key_value];
                insert_at_position(generated_element_ref, current_index);
                return conditional_update(generated_element_ref, data_payload);
            } else {
                generated_element_ref = entry_handler(data_payload);
                insert_at_position(generated_element_ref, current_index);
                return domix.logic.retrieve_node_data(generated_element_ref, data_payload);
            }
        }
    });

    data_length = coalesce_instance.input_data.length;
    while (data_length < child_dom_nodes.length) {
        exit_handler(child_dom_nodes[data_length]);
    }
    return null;
};

domix.logic.combine_elements = function(target_element, model_data) {
    let child_node_ref, current_model_child, loop_index_one, loop_index_two;
    let temp_variable_one, temp_variable_two;

    if (is_coalesce_object_check(model_data)) {
        domix.logic.coalesce_dom_nodes(target_element, model_data);
    } else if (is_discard_object_check(model_data)) {
        // Do nothing for discard objects
    } else {
        if (target_element.nodeName.toLowerCase() !== model_data.tag_name.toLowerCase()) {
            dbg_log_func(target_element);
            dbg_log_func(model_data);
            throw new Error("Cannot merge element into a node of a different type.");
        }
        domix.logic.manage_attributes(target_element, model_data.attributes);

        if (target_element.hasChildNodes()) {
            temp_variable_one = target_element.childNodes.length - 1;
            for (loop_index_one = temp_variable_one; temp_variable_one <= 0 ? loop_index_one <= 0 : loop_index_one >= 0; temp_variable_one <= 0 ? ++loop_index_one : --loop_index_one) {
                child_node_ref = target_element.childNodes[loop_index_one];
                if (is_blank_node_check(child_node_ref)) {
                    target_element.removeChild(child_node_ref);
                }
            }
        }

        if (is_coalesce_object_check(model_data.children_nodes[0])) {
            domix.logic.combine_elements(target_element, model_data.children_nodes[0]);
        } else {
            if (target_element.childNodes.length > model_data.children_nodes.length) {
                temp_variable_two = target_element.childNodes.length - 1;
                for (loop_index_two = temp_variable_two; temp_variable_two <= 0 ? loop_index_two <= 0 : loop_index_two >= 0; temp_variable_two <= 0 ? ++loop_index_two : --loop_index_two) {
                    target_element.removeChild(target_element.childNodes[loop_index_two]);
                }
            }

            loop_index_one = 0;
            while (loop_index_one < model_data.children_nodes.length) {
                current_model_child = model_data.children_nodes[loop_index_one] || "";
                child_node_ref = target_element.childNodes[loop_index_one];

                if (is_text_string_check(current_model_child)) {
                    if (child_node_ref != null) {
                        child_node_ref.textContent = current_model_child;
                    } else {
                        target_element.appendChild(document.createTextNode(current_model_child));
                    }
                } else if (is_discard_object_check(current_model_child)) {
                    // Intentionally left blank
                } else if (is_object_map_check(current_model_child)) {
                    if (child_node_ref != null) {
                        domix.logic.combine_elements(child_node_ref, current_model_child);
                    } else {
                        target_element.appendChild(domix.logic.generate_dom(current_model_child));
                    }
                } else {
                    dbg_log_func(child_node_ref);
                    dbg_log_func(current_model_child);
                    throw new Error("Cannot merge children elements due to unexpected type.");
                }
                loop_index_one += 1;
            }
        }
    }
    return target_element;
};