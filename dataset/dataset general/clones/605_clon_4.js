((global_scope_object) => {

    const DEFAULT_CONFIGURATION_SET = {
        data_source_handler: null,
        tile_length_pixels: null,
        border_buffer_units: 2,
        initial_horizontal_position: 0,
        initial_vertical_position: 0
    };

    const merge_object_properties = (base_set, custom_overrides) => {
        const compiled_settings = { ...base_set };
        for (const key_name in custom_overrides) {
            if (Object.prototype.hasOwnProperty.call(custom_overrides, key_name)) {
                compiled_settings[key_name] = custom_overrides[key_name];
            }
        }
        return compiled_settings;
    };

    const retrieve_element_translation = (target_dom_node) => {
        const computed_style_value = window.getComputedStyle(target_dom_node).transform;
        if (computed_style_value === 'none') {
            return { x_offset: 0, y_offset: 0 };
        }
        const matrix_pattern = /matrix\(([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^)]+)\)/;
        const matrix_match = computed_style_value.match(matrix_pattern);
        if (matrix_match && matrix_match.length === 7) {
            return {
                x_offset: parseFloat(matrix_match[5]),
                y_offset: parseFloat(matrix_match[6])
            };
        }
        const translate_pattern = /translate\(([^,]+)px,\s*([^)]+)px\)/;
        const translate_match = computed_style_value.match(translate_pattern);
        if (translate_match && translate_match.length === 3) {
            return {
                x_offset: parseFloat(translate_match[1]),
                y_offset: parseFloat(translate_match[2])
            };
        }
        return { x_offset: 0, y_offset: 0 };
    };

    const normalize_to_dom_node = (input_source) => {
        if (input_source instanceof HTMLElement) {
            return input_source;
        }
        if (typeof input_source === 'string') {
            return document.querySelector(input_source);
        }
        if (typeof input_source.get === 'function' && input_source.get(0) instanceof HTMLElement) {
            return input_source.get(0);
        }
        throw new Error('Input must be a DOM element, CSS selector string, or jQuery object.');
    };

    const create_layered_view_manager = (viewport_container_source, runtime_parameters) => {
        const viewport_node = normalize_to_dom_node(viewport_container_source);
        if (!viewport_node) {
            throw new Error('Viewport container element not found.');
        }

        const current_parameters = merge_object_properties(DEFAULT_CONFIGURATION_SET, runtime_parameters);

        let registered_elements_cache = new Map(); // Key: "x,y", Value: Array<HTMLElement>
        let current_display_origin_x = current_parameters.initial_horizontal_position;
        let current_display_origin_y = current_parameters.initial_vertical_position;
        let accumulated_surface_offset_x = 0;
        let accumulated_surface_offset_y = 0;

        let calculated_row_count = 0;
        let calculated_column_count = 0;
        let current_coordinate_bounds = {
            min_x_coord: 0, min_y_coord: 0, max_x_coord: 0, max_y_coord: 0
        };

        const tile_content_layer = document.createElement('div');
        Object.assign(tile_content_layer.style, {
            position: 'absolute',
            left: '0px',
            top: '0px',
            transform: 'translate(0px, 0px)'
        });
        viewport_node.appendChild(tile_content_layer);

        const compute_viewport_tile_dimensions = () => {
            const viewport_dimensions = viewport_node.getBoundingClientRect();
            const viewport_pixel_width = viewport_dimensions.width;
            const viewport_pixel_height = viewport_dimensions.height;
            const tile_pixel_dim = current_parameters.tile_length_pixels;
            const buffer_units = current_parameters.border_buffer_units;

            if (viewport_pixel_width > 0 && viewport_pixel_height > 0 && tile_pixel_dim > 0) {
                calculated_column_count = Math.ceil(viewport_pixel_width / tile_pixel_dim) + buffer_units * 2;
                calculated_row_count = Math.ceil(viewport_pixel_height / tile_pixel_dim) + buffer_units * 2;
            } else {
                calculated_column_count = 0;
                calculated_row_count = 0;
            }
        };

        const establish_active_coordinate_bounds = () => {
            const buffer_units = current_parameters.border_buffer_units;
            const start_x = current_display_origin_x - buffer_units;
            const start_y = current_display_origin_y - buffer_units;

            current_coordinate_bounds = {
                min_x_coord: start_x,
                min_y_coord: start_y,
                max_x_coord: start_x + calculated_column_count - 1,
                max_y_coord: start_y + calculated_row_count - 1
            };
        };

        const is_point_within_bounds = (x_val, y_val) => {
            return !(y_val < current_coordinate_bounds.min_y_coord || y_val > current_coordinate_bounds.max_y_coord ||
                     x_val < current_coordinate_bounds.min_x_coord || x_val > current_coordinate_bounds.max_x_coord);
        };

        const reset_content_layer_transform = () => {
            tile_content_layer.style.transform = 'translate(0px, 0px)';
        };

        const calculate_tile_shift_from_layer_transform = () => {
            const current_layer_transform = retrieve_element_translation(tile_content_layer);
            const tile_pixel_dim = current_parameters.tile_length_pixels;

            let shifted_x_pixels = current_layer_transform.x_offset;
            let shifted_y_pixels = current_layer_transform.y_offset;

            // Mimics original Tiler behavior for positive offsets
            if (shifted_x_pixels > 0) shifted_x_pixels += tile_pixel_dim;
            if (shifted_y_pixels > 0) shifted_y_pixels += tile_pixel_dim;

            return {
                delta_x_units: Math.floor(shifted_x_pixels / tile_pixel_dim) - accumulated_surface_offset_x,
                delta_y_units: Math.floor(shifted_y_pixels / tile_pixel_dim) - accumulated_surface_offset_y
            };
        };

        const generate_all_visible_coordinates = () => {
            const coordinate_list = [];
            for (let y = current_coordinate_bounds.min_y_coord; y <= current_coordinate_bounds.max_y_coord; y++) {
                for (let x = current_coordinate_bounds.min_x_coord; x <= current_coordinate_bounds.max_x_coord; x++) {
                    coordinate_list.push([x, y]);
                }
            }
            return coordinate_list;
        };

        const determine_tile_reconciliation = () => {
            const target_active_coords = new Set(generate_all_visible_coordinates().map(c => `${c[0]},${c[1]}`));
            const currently_cached_coords = new Set(registered_elements_cache.keys());

            const coords_for_acquisition = Array.from(target_active_coords).filter(coord_str => !currently_cached_coords.has(coord_str));
            const coords_for_removal = Array.from(currently_cached_coords).filter(coord_str => !target_active_coords.has(coord_str));

            const parse_coord_key = (key_str) => key_str.split(',').map(Number);
            return {
                to_add: coords_for_acquisition.map(parse_coord_key),
                to_discard: coords_for_removal.map(parse_coord_key)
            };
        };

        const position_specific_elements = (x_coord, y_coord) => {
            const elements_at_location = registered_elements_cache.get(`${x_coord},${y_coord}`);
            if (!elements_at_location || elements_at_location.length === 0) return;

            const tile_pixel_dim = current_parameters.tile_length_pixels;
            const pixel_pos_x = (x_coord - current_display_origin_x) * tile_pixel_dim;
            const pixel_pos_y = (y_coord - current_display_origin_y) * tile_pixel_dim;

            elements_at_location.forEach(dom_element => {
                Object.assign(dom_element.style, {
                    position: 'absolute',
                    transform: `translate(${pixel_pos_x}px, ${pixel_pos_y}px)`
                });
            });
        };

        const re_align_all_elements = () => {
            registered_elements_cache.forEach((_val, key) => {
                const [x, y] = key.split(',').map(Number);
                position_specific_elements(x, y);
            });
        };

        // Initial calculations
        compute_viewport_tile_dimensions();
        establish_active_coordinate_bounds();

        const manager_interface = {
            // Replaces Tiler.prototype.refresh
            update_display_area: () => {
                const shift_info = calculate_tile_shift_from_layer_transform();

                current_display_origin_x -= shift_info.delta_x_units;
                current_display_origin_y -= shift_info.delta_y_units;
                accumulated_surface_offset_x += shift_info.delta_x_units;
                accumulated_surface_offset_y += shift_info.delta_y_units;

                compute_viewport_tile_dimensions();
                establish_active_coordinate_bounds();

                const { to_add, to_discard } = determine_tile_reconciliation();

                if (to_discard.length > 0) {
                    manager_interface.remove_content_items(to_discard);
                }
                if (to_add.length > 0 || to_discard.length > 0) {
                    if (typeof current_parameters.data_source_handler === 'function') {
                        current_parameters.data_source_handler(to_add, to_discard);
                    }
                }
            },

            // Replaces Tiler.prototype.reload
            re_fetch_all_content: () => {
                compute_viewport_tile_dimensions();
                establish_active_coordinate_bounds();
                const all_coords_in_view = generate_all_visible_coordinates();
                manager_interface.remove_content_items(Array.from(registered_elements_cache.keys()).map(s => s.split(',').map(Number)));
                if (typeof current_parameters.data_source_handler === 'function') {
                    current_parameters.data_source_handler(all_coords_in_view, []);
                }
            },

            // Replaces Tiler.prototype.coords
            adjust_view_center_coordinates: (new_center_x, new_center_y) => {
                if (arguments.length === 0) {
                    return { x_coord: current_display_origin_x, y_coord: current_display_origin_y };
                }

                current_display_origin_x = new_center_x;
                current_display_origin_y = new_center_y;
                accumulated_surface_offset_x = 0;
                accumulated_surface_offset_y = 0;

                compute_viewport_tile_dimensions();
                establish_active_coordinate_bounds();
                reset_content_layer_transform();

                const { to_add, to_discard } = determine_tile_reconciliation();

                manager_interface.remove_content_items(to_discard);
                re_align_all_elements();

                if (typeof current_parameters.data_source_handler === 'function') {
                    current_parameters.data_source_handler(to_add, to_discard);
                }
            },

            // Replaces Tiler.prototype.show
            inject_display_elements: (coords_or_x_input, y_input, elements_payload) => {
                const item_definitions = Array.isArray(coords_or_x_input) ? coords_or_x_input : [[coords_or_x_input, y_input, elements_payload]];
                const element_fragment = document.createDocumentFragment();

                item_definitions.forEach(([x_val, y_val, item_elements]) => {
                    if (!is_point_within_bounds(x_val, y_val)) {
                        return;
                    }

                    const element_array = Array.isArray(item_elements) ? item_elements : [item_elements];
                    const processed_dom_elements = element_array.map(normalize_to_dom_node);

                    manager_interface.remove_content_items([[x_val, y_val]]);

                    registered_elements_cache.set(`${x_val},${y_val}`, processed_dom_elements);

                    processed_dom_elements.forEach(el => element_fragment.appendChild(el));
                    position_specific_elements(x_val, y_val);
                });

                if (element_fragment.children.length > 0) {
                    tile_content_layer.appendChild(element_fragment);
                }
            },

            // Replaces Tiler.prototype.remove
            remove_content_items: (coords_or_x_input, y_input) => {
                const coordinates_for_purge = Array.isArray(coords_or_x_input) ? coords_or_x_input : [[coords_or_x_input, y_input]];

                coordinates_for_purge.forEach(([x_val, y_val]) => {
                    const key_identifier = `${x_val},${y_val}`;
                    const elements_to_discard = registered_elements_cache.get(key_identifier);

                    if (elements_to_discard) {
                        elements_to_discard.forEach(el => el.remove());
                        registered_elements_cache.delete(key_identifier);
                    }
                });
            }
        };

        return manager_interface;
    };

    // Export mechanism to make the factory function available.
    if (typeof exports !== 'undefined' && typeof module !== 'undefined' && module.exports) {
        module.exports = create_layered_view_manager;
    } else if (typeof define === 'function' && define.amd) {
        define(() => create_layered_view_manager);
    } else {
        global_scope_object['InfiniteCanvasManager'] = create_layered_view_manager;
    }

})(this);