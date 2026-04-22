'use strict';

// Color definitions (ANSI escape codes)
const c_styles = {
    'reset': '\x1b[0m',
    'dark': '\x1b[30m',
    'scarlet': '\x1b[31m',
    'emerald': '\x1b[32m',
    'goldenrod': '\x1b[33m',
    'ocean': '\x1b[34m',
    'violet': '\x1b[35m',
    'sky': '\x1b[36m',
    'silver': '\x1b[37m',
    'charcoal': '\x1b[90m'
};

// Applies styling to text if not disabled
function apply_style(text_value, style_key, disable_all_styles) {
    if (disable_all_styles || !style_key || !c_styles[style_key]) {
        return String(text_value);
    }
    return c_styles[style_key] + String(text_value) + c_styles.reset;
}

// Generates a string of spaces for indentation
function create_indent_string(count) {
    return ' '.repeat(Math.max(0, count));
}

// Finds the length of the longest key in an object
function find_max_key_length(obj_data) {
    let longest_len = 0;
    for (const prop_id in obj_data) {
        if (Object.prototype.hasOwnProperty.call(obj_data, prop_id)) {
            longest_len = Math.max(longest_len, prop_id.length);
        }
    }
    return longest_len;
}

// Indents each line of a multi-line string
function indent_multi_lines(text_content, extra_spaces) {
    const text_lines = String(text_content).split('\n');
    return text_lines.map(line_item => create_indent_string(extra_spaces) + line_item).join('\n');
}

// Determines if a value can be rendered on a single line
function is_single_line_renderable(value_check, check_only_primitives, current_config) {
    if (typeof value_check === 'boolean' || typeof value_check === 'number' || value_check === null || value_check instanceof Date) {
        return true;
    }
    if (typeof value_check === 'string' && value_check.indexOf('\n') === -1) {
        return true;
    }
    if (current_config.inline_arrays_enabled && !check_only_primitives) {
        if (Array.isArray(value_check) && value_check.length > 0 && is_single_line_renderable(value_check[0], true, current_config)) {
            return true;
        }
    }
    return false;
}

// Applies specific styling to different data types
function apply_value_styling(input_val, current_config) {
    if (current_config.disable_all_styles) {
        return String(input_val);
    }
    if (typeof input_val === 'string') {
        return apply_style(input_val, current_config.string_color_key, current_config.disable_all_styles || !current_config.string_color_key);
    }
    const string_representation = String(input_val);
    if (input_val === true) {
        return apply_style(string_representation, 'emerald', current_config.disable_all_styles);
    }
    if (input_val === false) {
        return apply_style(string_representation, 'scarlet', current_config.disable_all_styles);
    }
    if (input_val === null) {
        return apply_style(string_representation, 'charcoal', current_config.disable_all_styles);
    }
    if (typeof input_val === 'number') {
        return apply_style(string_representation, current_config.number_color_key, current_config.disable_all_styles);
    }
    if (Array.isArray(input_val)) {
        return input_val.join(', ');
    }
    return string_representation;
}

// Main function to format and display data
function format_and_present(target_data, present_config, current_base_offset) {
    const effective_config = Object.assign({
        empty_array_message: '(empty array)',
        key_color_name: 'emerald',
        dash_color_name: 'emerald',
        number_color_name: 'ocean',
        default_nest_offset: 2,
        disable_all_styles: false,
        string_color_key: null,
        inline_arrays_enabled: false
    }, present_config);

    current_base_offset = current_base_offset || 0;

    // Recursive helper to process different data types
    function process_entity(entity, entity_offset) {
        const entity_indent_str = create_indent_string(entity_offset);

        if (is_single_line_renderable(entity, false, effective_config)) {
            return [entity_indent_str + apply_value_styling(entity, effective_config)];
        } else if (typeof entity === 'string') {
            return [
                entity_indent_str + '"""',
                indent_multi_lines(entity, entity_offset + effective_config.default_nest_offset),
                entity_indent_str + '"""'
            ];
        } else if (Array.isArray(entity)) {
            if (entity.length === 0) {
                return [entity_indent_str + effective_config.empty_array_message];
            } else {
                return entity.flatMap(each_item => {
                    let item_prefix = '- ';
                    if (!effective_config.disable_all_styles) {
                        item_prefix = apply_style(item_prefix, effective_config.dash_color_name, effective_config.disable_all_styles);
                    }
                    item_prefix = entity_indent_str + item_prefix;

                    if (is_single_line_renderable(each_item, false, effective_config)) {
                        return [item_prefix + format_and_present(each_item, effective_config)];
                    } else {
                        return [
                            item_prefix,
                            ...process_entity(each_item, entity_offset + effective_config.default_nest_offset)
                        ];
                    }
                });
            }
        } else if (typeof entity === 'object' && entity !== null) {
            const max_label_len = find_max_key_length(entity);
            const is_error_obj = entity instanceof Error;

            return Object.getOwnPropertyNames(entity).flatMap(property_label => {
                if (entity[property_label] === undefined) {
                    return [];
                }

                let current_label_str = property_label + ': ';
                if (!effective_config.disable_all_styles) {
                    current_label_str = apply_style(current_label_str, effective_config.key_color_name, effective_config.disable_all_styles);
                }
                current_label_str = entity_indent_str + current_label_str;

                let actual_property_value = entity[property_label];
                if (is_error_obj && property_label === 'stack') {
                    actual_property_value = actual_property_value.split('\n');
                }

                if (is_single_line_renderable(actual_property_value, false, effective_config) && (!is_error_obj || property_label !== 'stack')) {
                    const value_padding = create_indent_string(max_label_len - property_label.length);
                    return [current_label_str + value_padding + format_and_present(actual_property_value, effective_config)];
                } else {
                    return [
                        current_label_str,
                        ...process_entity(actual_property_value, entity_offset + effective_config.default_nest_offset)
                    ];
                }
            });
        }
        return [];
    }

    return process_entity(target_data, current_base_offset).join('\n');
}

// Function to parse a string and then format/display it
function parse_and_display_string(input_text_str, disp_config, initial_offset) {
    let final_result_str = '';
    let parsed_data_obj;

    if (typeof input_text_str !== 'string' || input_text_str === '') {
        return '';
    }

    let json_content_start_index = -1;
    const brace_pos = input_text_str.indexOf('{');
    const bracket_pos = input_text_str.indexOf('[');

    if (brace_pos !== -1 && (bracket_pos === -1 || brace_pos < bracket_pos)) {
        json_content_start_index = brace_pos;
    } else if (bracket_pos !== -1) {
        json_content_start_index = bracket_pos;
    }

    if (json_content_start_index > 0) {
        final_result_str += input_text_str.substring(0, json_content_start_index) + '\n';
        input_text_str = input_text_str.substring(json_content_start_index);
    }

    try {
        parsed_data_obj = JSON.parse(input_text_str);
    } catch (e) {
        return apply_style('Error: Not valid JSON!', 'scarlet', false);
    }

    final_result_str += format_and_present(parsed_data_obj, disp_config, initial_offset);
    return final_result_str;
}

// Mimic the original exports structure
if (typeof exports === 'object' && typeof module === 'object') {
    exports.format_and_present = format_and_present;
    exports.parse_and_display_string = parse_and_display_string;
} else if (typeof window !== 'undefined') {
    // For browser environment, expose globally
    window.format_and_present = format_and_present;
    window.parse_and_display_string = parse_and_display_string;
}