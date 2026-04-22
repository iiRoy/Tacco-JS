let current_available_actions = null;
let selectable_items_for_action = null;
let is_action_combinable = false;
let selected_item_for_interaction = null;
let preparing_to_hurl_object = false;

// A utility function to reset all temporary interaction states.
function clear_interaction_context() {
    is_action_combinable = false;
    preparing_to_hurl_object = false;
    selected_item_for_interaction = null;
    selectable_items_for_action = null;
    current_available_actions = null;
}

// Generates and updates the main game display panel with current game state.
function refresh_game_interface() {
    // If the game world isn't properly initialized, there's nothing to display.
    if (typeof game_world_instance === 'undefined' || game_world_instance === null) {
        return;
    }

    const protagonist_entity = game_world_instance.main_character;
    const current_level_index = protagonist_entity.level;

    // Use an array to build HTML fragments for better performance and readability
    const interface_elements_markup = [];

    // --- Protagonist Information Section ---
    interface_elements_markup.push(
        `<dl><dt id='player_header'>${protagonist_entity.name} the Plumber` +
        `<small>Level: ${protagonist_entity.level} (${protagonist_entity.level_names[current_level_index - 1]})</small></dt><dd>`
    );

    const status_effects = [];
    if (protagonist_entity.is_afflicted_poison) {
        status_effects.push('<b id="poison_status_display">[POISONED]</b>');
    }
    if (protagonist_entity.is_afflicted_blindness) {
        status_effects.push('<b id="blind_status_display">[BLINDED]</b>');
    }
    if (protagonist_entity.is_afflicted_confusion) {
        status_effects.push('<b id="confuse_status_display">[CONFUSED]</b>');
    }

    interface_elements_markup.push(
        `<b>Health:</b> ${protagonist_entity.current_hp} / ${protagonist_entity.calculate_max_hp()}` +
        (status_effects.length > 0 ? ` ${status_effects.join(' ')}` : '') +
        `<br><b>Funds:</b> $${protagonist_entity.current_cash} / ${protagonist_entity.get_cash_capacity()}<br>` +
        `<b>Conduits Located:</b> ${game_world_instance.pipes_discovered}<br>` +
        `<b>Conduits Repaired:</b> ${game_world_instance.pipes_fixed_count}`
    );

    // --- Conditional Interaction Prompts ---
    if (preparing_to_hurl_object) {
        interface_elements_markup.push(
            `<dt>Choose Direction:</dt><dd>Press an arrow key (up, down, left, or right) to hurl ${selected_item_for_interaction.display_name}</dd>`
        );
    } else if (selectable_items_for_action && selectable_items_for_action.length > 0) {
        interface_elements_markup.push('<dt>Select Inventory Item:</dt><dd><ol>');
        for (let i = 0; i < selectable_items_for_action.length; ++i) {
            const current_item_option = selectable_items_for_action[i];
            interface_elements_markup.push(`<li>${current_item_option[0].display_name}</li>`);
        }
        interface_elements_markup.push('</ol></dd>');
    } else {
        interface_elements_markup.push(`<dt>Your Possessions:</dt><dd>${protagonist_entity.inventory_summary}</dd>`);
    }

    // It's crucial to retrieve actions here, as it may trigger internal game logic like auto-pickup.
    current_available_actions = protagonist_entity.retrieve_available_actions();

    // --- Visible Objects in Current Location ---
    const cell_occupying_entities = protagonist_entity.current_location.occupying_objects;
    let object_category_flags = 0; // Bitmask for object categories, if needed for filtering
    interface_elements_markup.push('<dt>You perceive:</dt><dd>');
    if (cell_occupying_entities.length > 0) {
        const entity_display_names = [];
        for (let i = 0; i < cell_occupying_entities.length; ++i) {
            const entity = cell_occupying_entities[i];
            object_category_flags |= entity.object_category;
            entity_display_names.push(entity.display_name);
        }
        interface_elements_markup.push(entity_display_names.join(', '));
    } else {
        interface_elements_markup.push('nothing of particular interest');
    }
    interface_elements_markup.push("</dd>");

    // --- Available Operations ---
    interface_elements_markup.push('<dt>Possible Operations:</dt><dd id="operation_list_section"><ul>');
    if (current_available_actions && current_available_actions.length > 0) {
        for (let i = 0; i < current_available_actions.length; ++i) {
            interface_elements_markup.push(`<li>${current_available_actions[i].operation_label}</li>`);
        }
    } else {
        interface_elements_markup.push('<li><i>No operations currently available.</i></li>');
    }
    interface_elements_markup.push('</ul></dd>');

    // Update the DOM with the generated HTML.
    $('#display_panel').html(interface_elements_markup.join(''));
}

// Helper: Maps arrow key codes to corresponding movement deltas.
function get_movement_deltas_from_keycode(keycode) {
    switch (keycode) {
        case 37: return { dx: -1, dy: 0 }; // Left
        case 38: return { dx: 0, dy: -1 }; // Up
        case 39: return { dx: 1, dy: 0 };  // Right
        case 40: return { dx: 0, dy: 1 };  // Down
        default: return { dx: 0, dy: 0 };
    }
}

// Main handler for all keyboard input events.
function process_keyboard_input(keyboard_event) {
    const protagonist_ref = game_world_instance?.main_character;

    // Pre-check: Abort if game state is invalid, a meta key is pressed,
    // a modal overlay is active, or the protagonist is incapacitated.
    if (!game_world_instance || !protagonist_ref || keyboard_event.metaKey ||
        $('#modal_game_overlay').is(":visible") || protagonist_ref.current_hp <= 0) {
        return;
    }

    const raw_input_code = keyboard_event.which || keyboard_event.keyCode;
    const char_representation = String.fromCharCode(raw_input_code).toLowerCase();
    const normalized_char_code = char_representation.charCodeAt(0);

    let input_event_was_handled = false;
    let should_advance_game_turn = true; // Default to true, specific actions may override this.

    // Handle key presses based on their raw code for special keys, then by char code for actions.
    switch (raw_input_code) {
        case 27: // Escape key: Clears any pending interaction states.
            clear_interaction_context();
            input_event_was_handled = true;
            break;

        case 37: // Left Arrow
        case 38: // Up Arrow
        case 39: // Right Arrow
        case 40: // Down Arrow
            let { dx, dy } = get_movement_deltas_from_keycode(raw_input_code);

            // If protagonist is confused, reverse movement direction.
            if (protagonist_ref.is_afflicted_confusion > 0) {
                dx = -dx;
                dy = -dy;
            }

            if (preparing_to_hurl_object && selected_item_for_interaction) {
                protagonist_ref.perform_throw_action(selected_item_for_interaction, dx, dy);
                should_advance_game_turn = false; // Throwing might not always consume a full turn.
            } else {
                protagonist_ref.attempt_movement(dx, dy);
            }
            clear_interaction_context(); // Movement or throw completes a contextual interaction.
            input_event_was_handled = true;
            break;

        default: // Handle character-based inputs (actions, item selection).
            if (selectable_items_for_action) {
                // User is currently choosing an item from a list (e.g., 'a', 'b', 'c').
                const chosen_item_index = normalized_char_code - 'a'.charCodeAt(0);

                if (chosen_item_index >= 0 && chosen_item_index < selectable_items_for_action.length) {
                    const [target_item_obj, associated_action_ref] = selectable_items_for_action[chosen_item_index];

                    if (is_action_combinable && selected_item_for_interaction === null) {
                        // This is the first item chosen for a combination action.
                        selected_item_for_interaction = target_item_obj;
                        // Potentially update selectable_items_for_action to show only compatible second items.
                        selectable_items_for_action = protagonist_ref.get_compatible_items_for_action(associated_action_ref, ITEM_CATEGORY_CONSUMABLE);
                        should_advance_game_turn = false; // Awaiting second item or direction, no turn advanced yet.
                        input_event_was_handled = true;
                    } else if (associated_action_ref.requires_direction) {
                        // The selected action requires a directional input (e.g., aiming a throw).
                        selected_item_for_interaction = target_item_obj;
                        preparing_to_hurl_object = true;
                        should_advance_game_turn = false; // Awaiting direction, no turn advanced yet.
                        input_event_was_handled = true;
                    } else {
                        // Direct application of the action on the chosen item.
                        associated_action_ref.execute_action(target_item_obj, selected_item_for_interaction);
                        clear_interaction_context(); // Action completed, reset all interaction states.
                        input_event_was_handled = true;
                    }
                } else {
                    // Invalid item selection for the current list.
                    // log("Debug: Invalid item selection key."); // For development, can be removed.
                }
            } else if (current_available_actions) {
                // User is selecting a primary action from the general list.
                const matched_action = current_available_actions.find(action => action.activation_key === char_representation);

                if (matched_action) {
                    selectable_items_for_action = protagonist_ref.get_applicable_items_for_action(matched_action);
                    is_action_combinable = matched_action.is_combinable;
                    selected_item_for_interaction = null; // Clear previous item context for new action.

                    switch (selectable_items_for_action.length) {
                        case 0:
                            // Action requires no item selection (e.g., 'sleep' or 'wait').
                            matched_action.execute_action();
                            clear_interaction_context(); // Action completed, clear all states.
                            input_event_was_handled = true;
                            break;
                        case 1:
                            const sole_item_for_action = selectable_items_for_action[0][0];
                            if (is_action_combinable) {
                                // If combinable, even with one item, we might be waiting for a second.
                                selected_item_for_interaction = sole_item_for_action;
                                should_advance_game_turn = false; // Waiting for further input.
                                input_event_was_handled = true;
                            } else if (matched_action.requires_direction) {
                                // Action needs a direction, set item and await directional input.
                                selected_item_for_interaction = sole_item_for_action;
                                preparing_to_hurl_object = true;
                                should_advance_game_turn = false; // Waiting for direction.
                                input_event_was_handled = true;
                            } else {
                                // Direct action on the only available item.
                                matched_action.execute_action(sole_item_for_action);
                                clear_interaction_context();
                                input_event_was_handled = true;
                            }
                            break;
                        default:
                            // Multiple items available, user needs to make a selection.
                            should_advance_game_turn = false; // Waiting for item selection.
                            input_event_was_handled = true;
                    }
                    if (input_event_was_handled) {
                        current_available_actions = null; // Clear main actions list if an action was initiated.
                    }
                }
            }
    }

    // Post-processing: If an event was handled, prevent default browser action and update game state.
    if (input_event_was_handled) {
        keyboard_event.preventDefault(); // Stop browser from processing the key (e.g., scrolling).
        if (should_advance_game_turn) {
            game_world_instance.advance_game_turn(); // Advance the game turn.
        }
        refresh_game_interface(); // Update the display to reflect new game state.
    }
}

// Initial game introduction sequence.
function display_initial_welcome_message() {
    log("Welcome, brave adventurer! You've descended into the ancient cistern to mend its decaying pipeline network.");
    // An added fragment: a slight delay before the first interface refresh for narrative flow.
    setTimeout(() => {
        refresh_game_interface();
    }, 200);
}

// Bind the keyboard event handler using jQuery, adapting for different browser event types.
$(document).on($['browser']['mozilla'] ? 'keypress' : 'keydown', process_keyboard_input);

// Ensure initial setup runs once the DOM is fully loaded.
$(document).ready(function() {
    display_initial_welcome_message();
    // Initial refresh is also called in the welcome message's setTimeout, but this ensures it runs if no delay.
    // refresh_game_interface();
});

// Assuming ITEM_CATEGORY_CONSUMABLE and game_world_instance are defined elsewhere in the game's initialization.
const ITEM_CATEGORY_CONSUMABLE = 1; // Example constant, actual value depends on game design.