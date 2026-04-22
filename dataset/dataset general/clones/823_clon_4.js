(function() {
    // A central communication facility (replaces Subject/Observer pattern)
    const global_message_bus = (function() {
        const subscribers = {};

        function register(topic_identifier, callback_function) {
            if (!subscribers[topic_identifier]) {
                subscribers[topic_identifier] = [];
            }
            subscribers[topic_identifier].push(callback_function);
        }

        function transmit(topic_identifier, payload_data) {
            if (subscribers[topic_identifier]) {
                subscribers[topic_identifier].forEach(func => func(payload_data));
            }
        }
        return { register, transmit };
    })();

    // System-wide notification constants (replaces class static event names)
    const system_notifications = {
        VAULT_DATA_ACQUIRED: 'VAULT_DATA_ACQUIRED',
        VAULT_IMAGE_STORED: 'VAULT_IMAGE_STORED',
        CONTROL_UI_MENU_TOGGLED: 'CONTROL_UI_MENU_TOGGLED',
        CONTROL_UI_STATUS_TOGGLED: 'CONTROL_UI_STATUS_TOGGLED',
        CONTROL_VIEW_PERSPECTIVE_SET: 'CONTROL_VIEW_PERSPECTIVE_SET',
        CONTROL_VIEW_ORTHOGRAPHIC_SET: 'CONTROL_VIEW_ORTHOGRAPHIC_SET',
        CONTROL_VIEW_DUAL_SET: 'CONTROL_VIEW_DUAL_SET',
        CONTROL_CAMERA_RESET_REQUESTED: 'CONTROL_CAMERA_RESET_REQUESTED',
        CONTROL_STATUS_CLEARED: 'CONTROL_STATUS_CLEARED',
        CONTROL_BOUNDING_BOX_TOGGLED: 'CONTROL_BOUNDING_BOX_TOGGLED',
        CONTROL_VIEWPORT_TOGGLED: 'CONTROL_VIEWPORT_TOGGLED',
        CONTROL_SELECTION_TOOL_TOGGLED: 'CONTROL_SELECTION_TOOL_TOGGLED',
        CONTROL_VIEW_DIRECTION_TOP: 'CONTROL_VIEW_DIRECTION_TOP',
        CONTROL_VIEW_DIRECTION_FRONT: 'CONTROL_VIEW_DIRECTION_FRONT',
        CONTROL_VIEW_DIRECTION_SIDE: 'CONTROL_VIEW_DIRECTION_SIDE',
        CONTROL_SPIN_LEFT_SET: 'CONTROL_SPIN_LEFT_SET',
        CONTROL_SPIN_STOP_SET: 'CONTROL_SPIN_STOP_SET',
        CONTROL_SPIN_RIGHT_SET: 'CONTROL_SPIN_RIGHT_SET',
        CONTROL_ANIMATION_TOGGLED: 'CONTROL_ANIMATION_TOGGLED',
        CONTROL_SCREEN_PRINT_REQUESTED: 'CONTROL_SCREEN_PRINT_REQUESTED',
        OPTION_ALL_CLUSTERS_VISIBLE: 'OPTION_ALL_CLUSTERS_VISIBLE',
        OPTION_ALL_CLUSTERS_HIDDEN: 'OPTION_ALL_CLUSTERS_HIDDEN',
        OPTION_CLUSTER_VISIBILITY_CHANGED: 'OPTION_CLUSTER_VISIBILITY_CHANGED',
        OPTION_CLUSTER_SELECTION_CHANGED: 'OPTION_CLUSTER_SELECTION_CHANGED',
        RENDERER_DATA_LOADED: 'RENDERER_DATA_LOADED',
        RENDERER_POINTS_HIGHLIGHTED: 'RENDERER_POINTS_HIGHLIGHTED',
        RENDERER_CLUSTER_HIGHLIGHTED: 'RENDERER_CLUSTER_HIGHLIGHTED',
        UI_PANEL_MADE_VISIBLE: 'UI_PANEL_MADE_VISIBLE',
        UI_PANEL_MADE_HIDDEN: 'UI_PANEL_MADE_HIDDEN'
    };

    // Text symbols for toggle buttons (replaces Menu.TOGGLE_...)
    const toggle_symbols = {
        SHOW_INDICATOR: '[+]',
        HIDE_INDICATOR: '[-]',
        MIXED_INDICATOR: '[/]'
    };

    // Standard color definitions (replaces Palette.BACKGROUND, Palette.HIGHLIGHT, etc.)
    const visual_color_scheme = {
        BACKGROUND_SOLID: new THREE.Color(0x202020),
        ACCENT_BRIGHT: new THREE.Color(0xFFFFFF),
        SELECTION_MARK: new THREE.Color(0xCC0000),
        BUTTON_DEFAULT: new THREE.Color(0xCCCCCC),
        BUTTON_ACTIVE: new THREE.Color(0xFF9C00)
    };

    // Renderer view modes (replaces Projector.VIEW)
    const display_view_modes = {
        PERSP_VIEW: 'PERSP_VIEW',
        ORTHO_VIEW: 'ORTHO_VIEW',
        DUAL_VIEW: 'DUAL_VIEW'
    };

    // Renderer spin states (replaces Projector.SPIN)
    const camera_spin_states = {
        SPIN_LEFT: 'SPIN_LEFT',
        NO_SPIN: 'NO_SPIN',
        SPIN_RIGHT: 'SPIN_RIGHT'
    };

    // Utility directions (replaces Utility.DIRECTION)
    const navigational_directions = {
        TOP_AXIS: 'TOP_AXIS',
        FRONT_AXIS: 'FRONT_AXIS',
        SIDE_AXIS: 'SIDE_AXIS'
    };

    // Factory for generic UI section behavior (replaces Panel)
    const make_interface_panel = function(dom_element_id, event_emitter_ref) {
        let current_display_state = true; // Assume visible initially

        function show_panel() {
            $(dom_element_id).show();
            current_display_state = true;
            event_emitter_ref.transmit(system_notifications.UI_PANEL_MADE_VISIBLE, { id: dom_element_id });
        }

        function hide_panel() {
            $(dom_element_id).hide();
            current_display_state = false;
            event_emitter_ref.transmit(system_notifications.UI_PANEL_MADE_HIDDEN, { id: dom_element_id });
        }

        function toggle_panel_visibility() {
            if (current_display_state) {
                hide_panel();
            } else {
                show_panel();
            }
            return current_display_state;
        }

        return {
            show_panel,
            hide_panel,
            toggle_panel_visibility,
            get_current_visibility: () => current_display_state
        };
    };

    // Factory for informational display (replaces Info)
    const make_status_monitor = function(dom_element_id, event_emitter_ref) {
        const base_panel_funcs = make_interface_panel(dom_element_id, event_emitter_ref);

        function post_message(content_text) {
            $('#message').append(content_text + "<br/>");
        }

        function clear_all_messages() {
            $('#message').text("");
        }

        return {
            ...base_panel_funcs,
            post_message,
            clear_all_messages
        };
    };

    // Factory for cluster options list (replaces Menu)
    const make_cluster_options_list = function(dom_element_id, event_emitter_ref) {
        const base_panel_funcs = make_interface_panel(dom_element_id, event_emitter_ref);
        let total_cluster_count = 0;
        let currently_selected_id = -1;
        let cluster_styling_colors = null;

        const on_global_toggle_click = function() {
            const current_global_state = $("#toggleAll").text();
            if (current_global_state === toggle_symbols.HIDE_INDICATOR || current_global_state === toggle_symbols.MIXED_INDICATOR) {
                $("#toggleAll").text(toggle_symbols.SHOW_INDICATOR);
                for (let i = 0; i < total_cluster_count; i++) {
                    $(`#t${i}`).text(toggle_symbols.SHOW_INDICATOR);
                }
                event_emitter_ref.transmit(system_notifications.OPTION_ALL_CLUSTERS_VISIBLE);
            } else { // current_global_state === toggle_symbols.SHOW_INDICATOR
                $("#toggleAll").text(toggle_symbols.HIDE_INDICATOR);
                for (let i = 0; i < total_cluster_count; i++) {
                    $(`#t${i}`).text(toggle_symbols.HIDE_INDICATOR);
                }
                event_emitter_ref.transmit(system_notifications.OPTION_ALL_CLUSTERS_HIDDEN);
            }
        };

        const on_individual_toggle_click = function(event_obj) {
            const element_id_str = event_obj.target.id;
            const item_index_val = parseInt(element_id_str.replace("t", ""));
            change_item_toggle_state(item_index_val);
            event_emitter_ref.transmit(system_notifications.OPTION_CLUSTER_VISIBILITY_CHANGED, { id: item_index_val });
        };

        const on_cluster_button_click = function(event_obj) {
            const item_index_val = parseInt(event_obj.target.id.replace("b", ""));
            currently_selected_id = (currently_selected_id === item_index_val) ? -1 : item_index_val;
            update_cluster_color_swatches();
            update_cluster_button_styles();
            event_emitter_ref.transmit(system_notifications.OPTION_CLUSTER_SELECTION_CHANGED, { id: item_index_val });
        };

        function change_item_toggle_state(index_to_toggle) {
            const target_element_selector = `#t${index_to_toggle}`;
            const current_element_state = $(target_element_selector).text();
            if (current_element_state === toggle_symbols.SHOW_INDICATOR) {
                $(target_element_selector).text(toggle_symbols.HIDE_INDICATOR);
            } else {
                $(target_element_selector).text(toggle_symbols.SHOW_INDICATOR);
            }
            recalculate_global_toggle_state();
        }

        function generate_list_items(num_clusters, assigned_colors) {
            total_cluster_count = num_clusters;
            cluster_styling_colors = assigned_colors;
            let html_fragments = [];
            for (let i = 0; i < total_cluster_count; i++) {
                html_fragments.push(`<span class='toggle' id='t${i}'>${toggle_symbols.SHOW_INDICATOR}</span><span class='button' id='b${i}'> Group</span><span class='color' id='c${i}'> ${i} </span><br/>`);
            }
            $(dom_element_id).append(html_fragments.join(''));

            $("#toggleAll").click(on_global_toggle_click);
            for (let i = 0; i < total_cluster_count; i++) {
                $(`#t${i}`).click(on_individual_toggle_click);
                $(`#b${i}`).click(on_cluster_button_click);
            }
            update_cluster_color_swatches();
        }

        function count_visible_items() {
            let visible_items = 0;
            for (let i = 0; i < total_cluster_count; i++) {
                if ($(`#t${i}`).text() === toggle_symbols.SHOW_INDICATOR) {
                    visible_items++;
                }
            }
            return visible_items;
        }

        function recalculate_global_toggle_state() {
            const visible_items_count = count_visible_items();
            if (visible_items_count === 0) {
                $("#toggleAll").text(toggle_symbols.HIDE_INDICATOR);
            } else if (visible_items_count === total_cluster_count) {
                $("#toggleAll").text(toggle_symbols.SHOW_INDICATOR);
            } else {
                $("#toggleAll").text(toggle_symbols.MIXED_INDICATOR);
            }
        }

        function update_cluster_color_swatches() {
            for (let i = 0; i < total_cluster_count; i++) {
                const applied_color = (i === currently_selected_id) ? visual_color_scheme.ACCENT_BRIGHT.getStyle() : cluster_styling_colors[i].getStyle();
                $(`#c${i}`).css('color', applied_color);
            }
        }

        function update_cluster_button_styles() {
            for (let i = 0; i < total_cluster_count; i++) {
                const applied_color = (i === currently_selected_id) ? visual_color_scheme.ACCENT_BRIGHT.getStyle() : visual_color_scheme.BUTTON_DEFAULT.getStyle();
                $(`#b${i}`).css('color', applied_color);
            }
        }

        return {
            ...base_panel_funcs,
            generate_list_items
        };
    };

    // Factory for generating color sets (replaces Palette)
    const make_color_generator = function(desired_size) {
        const generated_color_array = [];

        (function produce_colors_internally(count) {
            let hue_value = 0;
            const saturation_value = 0.7;
            const lightness_value = 0.45;
            const step_increment = 1 / count;
            for (let i = 0; i < count; i++) {
                hue_value = (i + 1) * step_increment;
                const new_three_color = new THREE.Color();
                new_three_color.setHSL(hue_value, saturation_value, lightness_value);
                generated_color_array.push(new_three_color);
            }
        })(desired_size); // Immediately invoked to populate colors

        function get_all_produced_colors() {
            return generated_color_array;
        }

        return {
            get_all_produced_colors
        };
    };

    // Factory for data management (replaces Storage)
    const make_data_repository = function(event_emitter_ref) {
        let stored_point_count = 0;
        let stored_cluster_count = 0;
        let saved_image_receipts = 0;

        function retrieve_initial_data() {
            // Simulate asynchronous data retrieval
            setTimeout(() => {
                // Mock data values
                stored_point_count = 25000;
                stored_cluster_count = 15;
                event_emitter_ref.transmit(system_notifications.VAULT_DATA_ACQUIRED, { points: stored_point_count, clusters: stored_cluster_count });
            }, 150);
        }

        function store_captured_image(image_base64_data) {
            // Simulate image saving process
            console.log("Repository: Storing image (mock operation):", image_base64_data.substring(0, 50) + "...");
            saved_image_receipts++;
            event_emitter_ref.transmit(system_notifications.VAULT_IMAGE_STORED, { count: saved_image_receipts });
        }

        function get_current_point_total() {
            return stored_point_count;
        }

        function get_current_cluster_total() {
            return stored_cluster_count;
        }

        function get_saved_image_total() {
            return saved_image_receipts;
        }

        return {
            retrieve_initial_data,
            store_captured_image,
            get_current_point_total,
            get_current_cluster_total,
            get_saved_image_total
        };
    };

    // Factory for the control interface (replaces Toolbar)
    const make_control_interface = function(dom_element_id, event_emitter_ref) {
        const base_panel_funcs = make_interface_panel(dom_element_id, event_emitter_ref);

        // Generic function to update button visual state
        function set_button_highlight(button_css_id, is_active) {
            const color_to_apply = is_active ? visual_color_scheme.BUTTON_ACTIVE.getStyle() : visual_color_scheme.BUTTON_DEFAULT.getStyle();
            $(`#${button_css_id}`).css('color', color_to_apply);
        }

        function set_camera_mode_highlights(perspective_active, orthographic_active, dual_active) {
            set_button_highlight('perspectiveButton', perspective_active);
            set_button_highlight('orthographicButton', orthographic_active);
            set_button_highlight('dualButton', dual_active);
        }

        function set_view_direction_highlights(top_active, front_active, side_active) {
            set_button_highlight('viewTopButton', top_active);
            set_button_highlight('viewFrontButton', front_active);
            set_button_highlight('viewSideButton', side_active);
        }

        function set_spin_state_highlights(left_active, stop_active, right_active) {
            set_button_highlight('spinLeftButton', left_active);
            set_button_highlight('spinStopButton', stop_active);
            set_button_highlight('spinRightButton', right_active);
        }

        function flash_button_feedback(button_css_id) {
            const original_color = $(`#${button_css_id}`).css('color');
            $(`#${button_css_id}`).css('color', visual_color_scheme.ACCENT_BRIGHT.getStyle());
            setTimeout(() => $(`#${button_css_id}`).css('color', original_color), 200);
        }

        // Attach event listeners to all control buttons
        $(dom_element_id).on('click', '#menuButton', () => event_emitter_ref.transmit(system_notifications.CONTROL_UI_MENU_TOGGLED));
        $(dom_element_id).on('click', '#infoButton', () => event_emitter_ref.transmit(system_notifications.CONTROL_UI_STATUS_TOGGLED));
        $(dom_element_id).on('click', '#perspectiveButton', () => event_emitter_ref.transmit(system_notifications.CONTROL_VIEW_PERSPECTIVE_SET));
        $(dom_element_id).on('click', '#orthographicButton', () => event_emitter_ref.transmit(system_notifications.CONTROL_VIEW_ORTHOGRAPHIC_SET));
        $(dom_element_id).on('click', '#dualButton', () => event_emitter_ref.transmit(system_notifications.CONTROL_VIEW_DUAL_SET));
        $(dom_element_id).on('click', '#resetButton', () => event_emitter_ref.transmit(system_notifications.CONTROL_CAMERA_RESET_REQUESTED));
        $(dom_element_id).on('click', '#clearButton', () => event_emitter_ref.transmit(system_notifications.CONTROL_STATUS_CLEARED));
        $(dom_element_id).on('click', '#boxButton', () => event_emitter_ref.transmit(system_notifications.CONTROL_BOUNDING_BOX_TOGGLED));
        $(dom_element_id).on('click', '#viewportButton', () => event_emitter_ref.transmit(system_notifications.CONTROL_VIEWPORT_TOGGLED));
        $(dom_element_id).on('click', '#selectButton', () => event_emitter_ref.transmit(system_notifications.CONTROL_SELECTION_TOOL_TOGGLED));
        $(dom_element_id).on('click', '#viewTopButton', () => event_emitter_ref.transmit(system_notifications.CONTROL_VIEW_DIRECTION_TOP));
        $(dom_element_id).on('click', '#viewFrontButton', () => event_emitter_ref.transmit(system_notifications.CONTROL_VIEW_DIRECTION_FRONT));
        $(dom_element_id).on('click', '#viewSideButton', () => event_emitter_ref.transmit(system_notifications.CONTROL_VIEW_DIRECTION_SIDE));
        $(dom_element_id).on('click', '#spinLeftButton', () => event_emitter_ref.transmit(system_notifications.CONTROL_SPIN_LEFT_SET));
        $(dom_element_id).on('click', '#spinStopButton', () => event_emitter_ref.transmit(system_notifications.CONTROL_SPIN_STOP_SET));
        $(dom_element_id).on('click', '#spinRightButton', () => event_emitter_ref.transmit(system_notifications.CONTROL_SPIN_RIGHT_SET));
        $(dom_element_id).on('click', '#animateButton', () => event_emitter_ref.transmit(system_notifications.CONTROL_ANIMATION_TOGGLED));
        $(dom_element_id).on('click', '#printButton', () => event_emitter_ref.transmit(system_notifications.CONTROL_SCREEN_PRINT_REQUESTED));

        return {
            ...base_panel_funcs,
            set_button_highlight,
            set_camera_mode_highlights,
            set_view_direction_highlights,
            set_spin_state_highlights,
            flash_button_feedback
        };
    };

    // A collection of utility functions (replaces Utility)
    const system_toolkit = {
        get_direction_constants: () => navigational_directions
    };

    // Factory for the main visual representation (replaces Projector)
    const make_visual_display = function(event_emitter_ref) {
        let current_display_mode = display_view_modes.PERSP_VIEW;
        let active_spin_state = camera_spin_states.NO_SPIN;
        let bounding_box_visible = false;
        let viewport_active = false;
        let selection_tool_active = false;
        let animation_running = false;
        let applied_cluster_colors = [];

        // Mock THREE.js interactions
        const mock_render_engine = {
            set_display_mode: (mode) => { console.log("Visuals: Set mode to", mode); current_display_mode = mode; },
            set_camera_rotation_state: (spin) => { console.log("Visuals: Set spin to", spin); active_spin_state = spin; },
            reset_camera_position: (animated) => { console.log("Visuals: Reset camera, animated:", animated); },
            flip_bounding_box_visibility: () => { bounding_box_visible = !bounding_box_visible; console.log("Visuals: Box toggled to", bounding_box_visible); return bounding_box_visible; },
            flip_viewport_visibility: () => { viewport_active = !viewport_active; console.log("Visuals: Viewport toggled to", viewport_active); return viewport_active; },
            flip_selection_tool_status: () => { selection_tool_active = !selection_tool_active; console.log("Visuals: Selector toggled to", selection_tool_active); return selection_tool_active; },
            change_camera_orientation: (direction) => { console.log("Visuals: Change view to", direction); },
            flip_animation_status: () => { animation_running = !animation_running; console.log("Visuals: Animation toggled to", animation_running); return animation_running; },
            capture_current_frame_image: () => { console.log("Visuals: Capturing image (mock)"); return "data:image/png;base64,...mock_image_data..."; },
            apply_cluster_color_scheme: (colors) => { applied_cluster_colors = colors; console.log("Visuals: Colors applied", colors.length); },
            load_data_from_source: (data_source) => {
                console.log("Visuals: Loading data from repository (mock)");
                // Simulate async data processing
                setTimeout(() => {
                    event_emitter_ref.transmit(system_notifications.RENDERER_DATA_LOADED);
                    // Simulate selection events after some time
                    setTimeout(() => event_emitter_ref.transmit(system_notifications.RENDERER_POINTS_HIGHLIGHTED, { points: 75 }), 1000);
                    setTimeout(() => event_emitter_ref.transmit(system_notifications.RENDERER_CLUSTER_HIGHLIGHTED, { id: 3 }), 2000);
                }, 250);
            },
            set_single_cluster_display: (cluster_id, visible_state) => { console.log(`Visuals: Cluster ${cluster_id} display set to ${visible_state}`); },
            set_all_clusters_display: (visible_state) => { console.log(`Visuals: All clusters display set to ${visible_state}`); },
            toggle_cluster_display_state: (cluster_id) => { console.log(`Visuals: Toggling cluster ${cluster_id} display`); },
            toggle_cluster_highlight_state: (cluster_id) => { console.log(`Visuals: Toggling cluster ${cluster_id} highlight`); }
        };

        return {
            set_display_mode: mock_render_engine.set_display_mode,
            set_camera_rotation_state: mock_render_engine.set_camera_rotation_state,
            reset_camera_position: mock_render_engine.reset_camera_position,
            flip_bounding_box_visibility: mock_render_engine.flip_bounding_box_visibility,
            flip_viewport_visibility: mock_render_engine.flip_viewport_visibility,
            flip_selection_tool_status: mock_render_engine.flip_selection_tool_status,
            change_camera_orientation: mock_render_engine.change_camera_orientation,
            flip_animation_status: mock_render_engine.flip_animation_status,
            capture_current_frame_image: mock_render_engine.capture_current_frame_image,
            apply_cluster_color_scheme: mock_render_engine.apply_cluster_color_scheme,
            load_data_from_source: mock_render_engine.load_data_from_source,
            set_single_cluster_display: mock_render_engine.set_single_cluster_display,
            set_all_clusters_display: mock_render_engine.set_all_clusters_display,
            toggle_cluster_display_state: mock_render_engine.toggle_cluster_display_state,
            toggle_cluster_highlight_state: mock_render_engine.toggle_cluster_highlight_state,
            get_available_modes: () => display_view_modes,
            get_available_spins: () => camera_spin_states
        };
    };

    // Main application setup function (replaces DataProjector and its instantiation)
    const initialize_system_components = function() {
        const data_store = make_data_repository(global_message_bus);
        const ui_controls = make_control_interface('#toolbar', global_message_bus);
        const cluster_list_options = make_cluster_options_list('#menu', global_message_bus);
        const system_messages_display = make_status_monitor('#info', global_message_bus);
        const graphics_renderer = make_visual_display(global_message_bus);

        let current_color_generator = null;
        let graphics_colors = null;

        // Dispatch table for handling incoming events (replaces DataProjector.update and its switch statements)
        const event_dispatcher_map = {
            // Handlers for Data Repository notifications
            [system_notifications.VAULT_DATA_ACQUIRED]: () => {
                system_messages_display.post_message(`Processed ${data_store.get_current_point_total()} points.`);
                system_messages_display.post_message(`Found ${data_store.get_current_cluster_total()} clusters.`);
                perform_initial_configuration();
            },
            [system_notifications.VAULT_IMAGE_STORED]: () => {
                system_messages_display.post_message(`Screenshot ${data_store.get_saved_image_total()} saved.`);
            },

            // Handlers for UI Controls notifications
            [system_notifications.CONTROL_UI_MENU_TOGGLED]: () => {
                const current_menu_state = cluster_list_options.toggle_panel_visibility();
                ui_controls.set_button_highlight('menuButton', current_menu_state);
            },
            [system_notifications.CONTROL_UI_STATUS_TOGGLED]: () => {
                const current_info_state = system_messages_display.toggle_panel_visibility();
                ui_controls.set_button_highlight('infoButton', current_info_state);
            },
            [system_notifications.CONTROL_VIEW_PERSPECTIVE_SET]: () => {
                graphics_renderer.set_display_mode(graphics_renderer.get_available_modes().PERSP_VIEW);
                ui_controls.set_camera_mode_highlights(true, false, false);
            },
            [system_notifications.CONTROL_VIEW_ORTHOGRAPHIC_SET]: () => {
                graphics_renderer.set_display_mode(graphics_renderer.get_available_modes().ORTHO_VIEW);
                ui_controls.set_camera_mode_highlights(false, true, false);
            },
            [system_notifications.CONTROL_VIEW_DUAL_SET]: () => {
                graphics_renderer.set_display_mode(graphics_renderer.get_available_modes().DUAL_VIEW);
                ui_controls.set_camera_mode_highlights(false, false, true);
            },
            [system_notifications.CONTROL_CAMERA_RESET_REQUESTED]: () => {
                graphics_renderer.reset_camera_position(true);
                ui_controls.flash_button_feedback('resetButton');
            },
            [system_notifications.CONTROL_STATUS_CLEARED]: () => {
                system_messages_display.clear_all_messages();
                ui_controls.flash_button_feedback('clearButton');
            },
            [system_notifications.CONTROL_BOUNDING_BOX_TOGGLED]: () => {
                const current_box_state = graphics_renderer.flip_bounding_box_visibility();
                ui_controls.set_button_highlight('boxButton', current_box_state);
            },
            [system_notifications.CONTROL_VIEWPORT_TOGGLED]: () => {
                const current_viewport_state = graphics_renderer.flip_viewport_visibility();
                ui_controls.set_button_highlight('viewportButton', current_viewport_state);
            },
            [system_notifications.CONTROL_SELECTION_TOOL_TOGGLED]: () => {
                const current_selector_state = graphics_renderer.flip_selection_tool_status();
                ui_controls.set_button_highlight('selectButton', current_selector_state);
            },
            [system_notifications.CONTROL_VIEW_DIRECTION_TOP]: () => {
                graphics_renderer.change_camera_orientation(system_toolkit.get_direction_constants().TOP_AXIS);
                ui_controls.set_view_direction_highlights(true, false, false);
            },
            [system_notifications.CONTROL_VIEW_DIRECTION_FRONT]: () => {
                graphics_renderer.change_camera_orientation(system_toolkit.get_direction_constants().FRONT_AXIS);
                ui_controls.set_view_direction_highlights(false, true, false);
            },
            [system_notifications.CONTROL_VIEW_DIRECTION_SIDE]: () => {
                graphics_renderer.change_camera_orientation(system_toolkit.get_direction_constants().SIDE_AXIS);
                ui_controls.set_view_direction_highlights(false, false, true);
            },
            [system_notifications.CONTROL_SPIN_LEFT_SET]: () => {
                graphics_renderer.set_camera_rotation_state(graphics_renderer.get_available_spins().SPIN_LEFT);
                ui_controls.set_spin_state_highlights(true, false, false);
            },
            [system_notifications.CONTROL_SPIN_STOP_SET]: () => {
                graphics_renderer.set_camera_rotation_state(graphics_renderer.get_available_spins().NO_SPIN);
                ui_controls.set_spin_state_highlights(false, true, false);
            },
            [system_notifications.CONTROL_SPIN_RIGHT_SET]: () => {
                graphics_renderer.set_camera_rotation_state(graphics_renderer.get_available_spins().SPIN_RIGHT);
                ui_controls.set_spin_state_highlights(false, false, true);
            },
            [system_notifications.CONTROL_ANIMATION_TOGGLED]: () => {
                const current_animation_state = graphics_renderer.flip_animation_status();
                ui_controls.set_button_highlight('animateButton', current_animation_state);
            },
            [system_notifications.CONTROL_SCREEN_PRINT_REQUESTED]: () => {
                data_store.store_captured_image(graphics_renderer.capture_current_frame_image());
                ui_controls.flash_button_feedback('printButton');
            },

            // Handlers for Cluster Options List notifications
            [system_notifications.OPTION_ALL_CLUSTERS_VISIBLE]: () => {
                graphics_renderer.set_all_clusters_display(true);
            },
            [system_notifications.OPTION_ALL_CLUSTERS_HIDDEN]: () => {
                graphics_renderer.set_all_clusters_display(false);
            },
            [system_notifications.OPTION_CLUSTER_VISIBILITY_CHANGED]: (payload) => {
                graphics_renderer.toggle_cluster_display_state(payload.id);
            },
            [system_notifications.OPTION_CLUSTER_SELECTION_CHANGED]: (payload) => {
                graphics_renderer.toggle_cluster_highlight_state(payload.id);
            },

            // Handlers for Visual Renderer notifications
            [system_notifications.RENDERER_DATA_LOADED]: () => {
                console.log("Application: Visual data successfully loaded.");
            },
            [system_notifications.RENDERER_POINTS_HIGHLIGHTED]: (payload) => {
                system_messages_display.post_message(`Highlighted ${payload.points} points.`);
            },
            [system_notifications.RENDERER_CLUSTER_HIGHLIGHTED]: (payload) => {
                if (payload.id > -1) {
                    system_messages_display.post_message(`Cluster ${payload.id} highlighted`);
                } else {
                    system_messages_display.post_message("No cluster highlighted");
                }
            }
        };

        // Register all system event types with the central dispatcher
        Object.values(system_notifications).forEach(notification_type => {
            global_message_bus.register(notification_type, (payload) => {
                const handler_function = event_dispatcher_map[notification_type];
                if (handler_function) {
                    handler_function(payload);
                } else {
                    console.warn(`No specific handler for notification type: ${notification_type}`);
                }
            });
        });

        // The "initialize" method equivalent from the original DataProjector
        const perform_initial_configuration = function() {
            current_color_generator = make_color_generator(data_store.get_current_cluster_total());
            graphics_colors = current_color_generator.get_all_produced_colors();
            cluster_list_options.generate_list_items(data_store.get_current_cluster_total(), graphics_colors);
            graphics_renderer.apply_cluster_color_scheme(graphics_colors);
            graphics_renderer.load_data_from_source(data_store);
            // Simulate initial toolbar event for spinning right
            event_dispatcher_map[system_notifications.CONTROL_SPIN_RIGHT_SET]();
        };

        // Begin the data fetching process to kick off the application
        data_store.retrieve_initial_data();
    };

    // Ensure the application starts after the DOM is fully loaded
    $(document).ready(initialize_system_components);

})();