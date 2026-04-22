var world_grid = null;
const DRINKABLE_CLASSIFICATION = 1;

const view_renderer = {
    update_display_area: (selector_identifier, content_markup) => {
        const target_element = document.querySelector(selector_identifier);
        if (target_element) {
            target_element.innerHTML = content_markup;
        }
    },
    is_element_visible: (selector_identifier) => {
        const target_element = document.querySelector(selector_identifier);
        return target_element && window.getComputedStyle(target_element).display !== 'none' && window.getComputedStyle(target_element).visibility !== 'hidden';
    }
};

const dom_event_manager = {
    attach_event_listener: (target_element, event_identifier, handler_function) => {
        target_element.addEventListener(event_identifier, handler_function);
    }
};

const browser_environment = {
    is_mozilla: typeof InstallTrigger !== 'undefined'
};

const game_interaction_state = {
    available_commands: null,
    selectable_items: null,
    is_combination_mode: false,
    primary_target_item: null,
    awaiting_direction_for_item_use: false
};

const utility_functions = {
    convert_keycode_to_lowercase_char: (numeric_keycode) => String.fromCharCode(numeric_keycode).toLowerCase(),
    is_within_bounds: (value_to_check, lower_limit, upper_limit) => value_to_check >= lower_limit && value_to_check < upper_limit,
    record_message: (text_content) => console.log(text_content)
};

function display_game_status_view() {
    if (world_grid === null) return;

    const protagonist_entity = world_grid.protagonist_entity;
    const experience_tier = protagonist_entity.experience_tier;

    let content_segments = [];

    content_segments.push(
        `<dl><dt id='f'>${protagonist_entity.name_alias} the Fontanero<small>Rank: ${protagonist_entity.experience_tier} (${protagonist_entity.experience_levels[experience_tier - 1]})</small></dt><dd>`
    );
    content_segments.push(
        `<b>Energy:</b> ${protagonist_entity.current_health_points} (${protagonist_entity.calculate_max_health()})` +
        (protagonist_entity.is_afflicted_poison ? " <b id='ps'>[TOXIC]</b> " : "") +
        (protagonist_entity.is_afflicted_blindness ? " <b id='bl'>[OBSCURED]</b>" : "") +
        (protagonist_entity.is_afflicted_confusion ? " <b id='cf'>[DISORIENTED]</b>" : "") +
        `<br><b>Funds:</b> $${protagonist_entity.current_currency} / ${protagonist_entity.determine_currency_cap()}<br>` +
        `<b>Conduits located:</b> ${world_grid.found_conduits}<br><b>Conduits repaired:</b> ${world_grid.fixed_conduits}`
    );

    if (game_interaction_state.awaiting_direction_for_item_use) {
        content_segments.push(
            `<dt>Select trajectory:</dt><dd>Input up, down, left or right to hurl ${game_interaction_state.primary_target_item.display_name}</dd>`
        );
        view_renderer.update_display_area('#panel', content_segments.join(''));
        return;
    } else if (game_interaction_state.selectable_items) {
        content_segments.push('<dt>Select component:</dt><dd><ol>');
        game_interaction_state.selectable_items.forEach(current_item_pair => {
            content_segments.push(`<li>${current_item_pair[0].display_name}</li>`);
        });
        content_segments.push('</ol></dd>');
        view_renderer.update_display_area('#panel', content_segments.join(''));
        return;
    } else {
        content_segments.push(`<dt>You are carrying:</dt><dd>${protagonist_entity.inventory_summary}</dd>`);
    }

    game_interaction_state.available_commands = protagonist_entity.retrieve_available_actions();
    const surrounding_elements = protagonist_entity.current_location.contained_objects;
    let object_type_mask = 0;

    content_segments.push('<dt>You observe:</dt><dd>');
    if (surrounding_elements.length) {
        const observed_names = surrounding_elements.map(element_instance => {
            object_type_mask |= element_instance.classification_id;
            return element_instance.display_name;
        });
        content_segments.push(observed_names.join(', '));
    } else {
        content_segments.push('nothing');
    }
    content_segments.push("</dd>");

    content_segments.push('<dt>Instructions:</dt><dd id="a"><ul>');
    game_interaction_state.available_commands.forEach(current_command => {
        content_segments.push(`<li>${current_command.label_text}</li>`);
    });
    content_segments.push('</ul></dd>');

    view_renderer.update_display_area('#panel', content_segments.join(''));
}

const reset_interaction_state = () => {
    game_interaction_state.is_combination_mode = false;
    game_interaction_state.awaiting_direction_for_item_use = false;
    game_interaction_state.primary_target_item = null;
    game_interaction_state.selectable_items = null;
    game_interaction_state.available_commands = null;
};

const create_directional_action_handler = (x_movement, y_movement) => (protagonist_entity_instance, event_payload) => {
    let horizontal_delta = x_movement;
    let vertical_delta = y_movement;

    if (protagonist_entity_instance.is_afflicted_confusion > 0) {
        horizontal_delta = -horizontal_delta;
        vertical_delta = -vertical_delta;
    }

    if (game_interaction_state.awaiting_direction_for_item_use) {
        protagonist_entity_instance.perform_item_throw(game_interaction_state.primary_target_item, horizontal_delta, vertical_delta);
        reset_interaction_state();
        return { event_processed_flag: true, game_cycle_advancement_required: false };
    } else {
        protagonist_entity_instance.navigate_grid(horizontal_delta, vertical_delta);
        reset_interaction_state();
        return { event_processed_flag: true, game_cycle_advancement_required: true };
    }
};

const input_event_dispatch_map = {
    27: (protagonist_entity_instance, event_payload) => {
        reset_interaction_state();
        return { event_processed_flag: true, game_cycle_advancement_required: false };
    },
    37: create_directional_action_handler(-1, 0),
    38: create_directional_action_handler(0, -1),
    39: create_directional_action_handler(1, 0),
    40: create_directional_action_handler(0, 1),

    character_action_handler: (protagonist_entity_instance, character_representation, keycode_value) => {
        let event_processed_flag = false;
        let game_cycle_advancement_required = true;

        if (game_interaction_state.selectable_items !== null) {
            const selection_index = keycode_value - 0x61;
            if (utility_functions.is_within_bounds(selection_index, 0, game_interaction_state.selectable_items.length)) {
                const selected_item_pair = game_interaction_state.selectable_items[selection_index];
                const associated_command = selected_item_pair[1];
                const selected_item_instance = selected_item_pair[0];

                if (game_interaction_state.is_combination_mode && game_interaction_state.primary_target_item === null) {
                    game_interaction_state.primary_target_item = selected_item_instance;
                    game_interaction_state.selectable_items = protagonist_entity_instance.retrieve_filtered_items(associated_command, DRINKABLE_CLASSIFICATION);
                    game_cycle_advancement_required = false;
                    event_processed_flag = true;
                } else if (associated_command.requires_direction) {
                    game_interaction_state.primary_target_item = selected_item_instance;
                    game_interaction_state.awaiting_direction_for_item_use = true;
                    game_cycle_advancement_required = false;
                    event_processed_flag = true;
                } else {
                    associated_command.execute_action(selected_item_instance, game_interaction_state.primary_target_item);
                    event_processed_flag = true;
                }
            }
            game_interaction_state.selectable_items = null;
            event_processed_flag = true;

        } else if (game_interaction_state.available_commands !== null) {
            const matched_command = game_interaction_state.available_commands.find(cmd => cmd.trigger_key === character_representation);

            if (matched_command) {
                game_interaction_state.selectable_items = protagonist_entity_instance.retrieve_filtered_items(matched_command);
                game_interaction_state.is_combination_mode = matched_command.is_combinable;
                game_interaction_state.primary_target_item = null;

                switch (game_interaction_state.selectable_items.length) {
                    case 0:
                        matched_command.execute_action();
                        game_interaction_state.selectable_items = null;
                        break;
                    case 1:
                        const sole_item = game_interaction_state.selectable_items[0][0];
                        if (game_interaction_state.is_combination_mode) {
                            game_cycle_advancement_required = false;
                        } else if (matched_command.requires_direction) {
                            game_interaction_state.primary_target_item = sole_item;
                            game_interaction_state.awaiting_direction_for_item_use = true;
                            game_cycle_advancement_required = false;
                        } else {
                            matched_command.execute_action(sole_item);
                            game_interaction_state.selectable_items = null;
                        }
                        break;
                    default:
                        game_cycle_advancement_required = false;
                }
                game_interaction_state.available_commands = null;
                event_processed_flag = true;
            }
        }
        return { event_processed_flag: event_processed_flag, game_cycle_advancement_required: game_cycle_advancement_required };
    }
};

function handle_user_input_event(input_event) {
    const protagonist_entity = world_grid.protagonist_entity;

    if (world_grid === null || input_event.metaKey || view_renderer.is_element_visible("#mg_element") || protagonist_entity.current_health_points <= 0) {
        return;
    }

    const input_keycode_value = input_event.which || input_event.keyCode;
    const input_character_representation = utility_functions.convert_keycode_to_lowercase_char(input_keycode_value);

    let processing_result = { event_processed_flag: false, game_cycle_advancement_required: true };

    const specific_key_handler = input_event_dispatch_map[input_keycode_value];

    if (specific_key_handler) {
        processing_result = specific_key_handler(protagonist_entity, input_event);
    } else {
        processing_result = input_event_dispatch_map.character_action_handler(protagonist_entity, input_character_representation, input_keycode_value);
    }

    if (processing_result.event_processed_flag) {
        input_event.preventDefault();
        if (processing_result.game_cycle_advancement_required) {
            world_grid.advance_game_time();
        }
        display_game_status_view();
    }
}

function initiate_game_narrative() {
    utility_functions.record_message("You've entered the <s>subterranean complex</s> service tunnel to rectify all damaged conduits and ventilation systems.");
}

dom_event_manager.attach_event_listener(
    document,
    browser_environment.is_mozilla ? 'keypress' : 'keydown',
    handle_user_input_event
);