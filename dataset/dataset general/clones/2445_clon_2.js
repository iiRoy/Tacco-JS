var available_opts_list = null; // Stores possible player actions for the current turn
var held_items_selection = null; // Stores items available for player interaction or selection
var merging_active_flag = false; // Boolean flag indicating if item combination mode is currently active
var primary_item_chosen = null; // Holds the first item selected by the player, often for combination or throwing
var projectile_motion_enabled = false; // Boolean flag indicating if the player is in the process of throwing an object

// A representation of the game world or environment. Initialized to null.
var game_environment = null;

// Function to update and display the game's information panel on the user interface.
function display_game_status_view() {
    /* If the game environment object is not yet initialized,
     * there's nothing to display, so the function exits. */
    if (game_environment === null) {
        return;
    }

    // Retrieve the main player character's object and their current progress level.
    var main_protagonist = game_environment.player_character;
    var current_progress_level = main_protagonist.current_rank;

    // Start building the HTML string that will populate the information panel.
    var rendered_output_html = "<dl><dt id='char_id'>" + main_protagonist.character_name + " the Plumber<small>Tier: " + main_protagonist.current_rank + " (" + main_protagonist.rank_milestones[current_progress_level - 1] + ")</small></dt><dd>";
    rendered_output_html += "<b>Health:</b> " + main_protagonist.health_points + " (" + main_protagonist.calculate_max_health() + ")" +
        (main_protagonist.is_under_poison_effect ? " <b id='poison_status'>[POISONED]</b> " : "") +
        (main_protagonist.is_sight_impaired ? " <b id='blind_status'>[BLINDED]</b>" : "") +
        (main_protagonist.is_mentally_disoriented ? " <b id='confuse_status'>[CONFUSED]</b>" : "") +
        "<br><b>Coins:</b> $" + main_protagonist.gold_count + " / " + main_protagonist.get_level_cap_value() + "<br>" +
        "<b>Conduits discovered:</b> " + game_environment.discovered_pipes + "<br><b>Conduits mended:</b> " + game_environment.repaired_pipes;

    // Conditional display logic based on current game state (throwing, item selection, or general info).
    if (projectile_motion_enabled) {
        // Instructions for choosing a direction to throw an item.
        rendered_output_html += '<dt>Select a direction:</dt><dd>Use directional keys (up, down, left, right) to launch ' + primary_item_chosen.item_label + '</dd>';
        $('#game_info_panel')['html'](rendered_output_html); // Update the panel with throwing instructions.
        return; // Exit as this state takes precedence.
    } else if (held_items_selection) {
        // Display a list of items for the player to choose from.
        rendered_output_html += '<dt>Choose an artifact:</dt><dd><ol>';
        for (var item_index = 0; item_index < held_items_selection.length; ++item_index) {
            var current_artifact = held_items_selection[item_index];
            rendered_output_html += "<li>" + current_artifact[0].item_label + "</li>";
        }
        rendered_output_html += '</ol></dd>';
        $('#game_info_panel')['html'](rendered_output_html); // Update the panel with item choices.
        return; // Exit as this state takes precedence.
    } else {
        // Default display: show the player's current inventory summary.
        rendered_output_html += '<dt>You are carrying:</dt><dd>' + main_protagonist.inventory_contents_summary + '</dd>';
    }

    // Fetch the set of actions currently available to the player character.
    available_opts_list = main_protagonist.fetch_possible_actions(); // This call might also trigger game logic like auto-pickup.
    var visible_cell_contents = main_protagonist.current_grid_cell.contained_elements; // Get objects in the player's current cell.
    var object_category_mask = 0; // Initialize a bitmask to categorize observed objects.
    rendered_output_html += '<dt>You observe:</dt><dd>';
    if (visible_cell_contents.length) {
        // List all objects visible in the current cell.
        for (var element_idx = 0; element_idx < visible_cell_contents.length; ++element_idx) {
            var current_element = visible_cell_contents[element_idx];
            object_category_mask |= current_element.element_type_id; // Update the mask with the object's type.
            rendered_output_html += (element_idx ? ', ' : '') + current_element.item_label; // Append object name.
        }
    } else {
        // If no objects are in the cell.
        rendered_output_html += 'nothing noteworthy';
    }
    rendered_output_html += "</dd>";

    rendered_output_html += '<dt>Commands:</dt><dd id="commands_list"><ul>';
    for (var command_idx = 0; command_idx < available_opts_list.length; ++command_idx) {
        rendered_output_html += '<li>' + available_opts_list[command_idx].action_description + "</li>";
    }
    rendered_output_html += '</ul></dd>';
    $('#game_info_panel')['html'](rendered_output_html); // Finally, update the entire panel with the generated HTML.
}

// Handler function for processing keyboard input events from the user.
function process_keyboard_input(event_object) {
    // Get a reference to the active player character.
    var active_player = game_environment.player_character;
    /* Prevent input processing if the game environment is not ready,
     * a meta key (like Cmd/Ctrl) is pressed, a modal dialog is open,
     * or the player character's health is at zero or below. */
    if (game_environment === null || event_object.metaKey || $("#game_modal_display")['is'](":visible") || active_player.health_points <= 0) {
        return;
    }

    // Determine the numerical key code and its character representation.
    var input_key_code = event_object.which || event_object.keyCode;
    var char_pressed = String.fromCharCode(input_key_code).toLowerCase();
    input_key_code = char_pressed.charCodeAt(0); // Convert the character back to its ASCII/Unicode value.

    var input_event_handled = false; // Flag to track if this event was processed by game logic.
    var should_advance_game_turn = true; // Flag to determine if the game turn should advance after this input.
    // console.log("Key pressed: " + input_key_code + " (" + char_pressed + ")"); // Debugging output.

    // Use a switch statement to handle different key inputs.
    switch (input_key_code) {
        case 27: // Escape key (ASCII 27)
            input_event_handled = true;
            merging_active_flag = false; // Disable combination mode.
            projectile_motion_enabled = false; // Disable throwing mode.
            primary_item_chosen = null; // Clear any primary item selection.
            break;
        case 37: // Left arrow key
        case 38: // Up arrow key
        case 39: // Right arrow key
        case 40: // Down arrow key
            // Calculate directional change (delta_x, delta_y) based on the arrow key pressed.
            var move_delta_x = [-1, 0, 1, 0][input_key_code - 37];
            var move_delta_y = [0, -1, 0, 1][input_key_code - 37];
            // If the player is currently confused, reverse their intended movement direction.
            if (active_player.is_mentally_disoriented_duration > 0) {
                move_delta_x = -move_delta_x;
                move_delta_y = -move_delta_y;
            }
            // If in throwing mode, initiate the item throw; otherwise, attempt character movement.
            if (projectile_motion_enabled) {
                active_player.initiate_item_throw(primary_item_chosen, move_delta_x, move_delta_y);
                should_advance_game_turn = false; // Throwing an item typically does not consume a full turn.
            } else {
                active_player.attempt_movement(move_delta_x, move_delta_y);
            }
            input_event_handled = true; // Mark the event as handled.
            projectile_motion_enabled = false; // Exit throwing mode.
            primary_item_chosen = null; // Clear primary item.
            held_items_selection = null; // Clear item selection list.
            break;
        default:
            // Handle cases where the player is choosing an item or performing a general action.
            if (held_items_selection !== null) {
                // If there's an active item selection list, process letter keys ('a', 'b', etc.).
                var item_selection_index = input_key_code - 0x61; // 'a' (ASCII 97) maps to index 0.
                // Validate if the calculated index is within the bounds of the current item list.
                if (check_range_validity(item_selection_index, 0, held_items_selection.length)) {
                    var current_chosen_item = held_items_selection[item_selection_index];
                    var associated_game_action = current_chosen_item[1]; // The action linked to this item.
                    var chosen_game_object = current_chosen_item[0]; // The actual item object.
                    // Special handling for combination mode: if a primary item hasn't been chosen yet.
                    if (merging_active_flag && primary_item_chosen === null) {
                        primary_item_chosen = chosen_game_object; // Set this as the first item.
                        // Get a new list of items compatible for combination with the primary item.
                        held_items_selection = active_player.get_potential_combination_targets(associated_game_action, LIQUID_ITEM_TYPE);
                        should_advance_game_turn = false; // Combination selection doesn't advance turn.
                        input_event_handled = true;
                        break; // Exit switch.
                    }
                    // If the action requires a direction (e.g., throwing a potion).
                    if (associated_game_action.requires_target_direction) {
                        primary_item_chosen = chosen_game_object; // Set the item to be thrown.
                        projectile_motion_enabled = true; // Activate throwing mode.
                        should_advance_game_turn = false; // Throwing setup doesn't advance turn.
                        input_event_handled = true;
                        break; // Exit switch.
                    }
                    // If none of the above, simply apply the action to the chosen item(s).
                    associated_game_action.execute_on_target(chosen_game_object, primary_item_chosen);
                }
                input_event_handled = true; // Mark the event as handled.
                held_items_selection = null; // Clear the item selection list.
            }
            // If no item selection is active, check for general actions.
            else if (available_opts_list !== null) {
                for (var action_loop_idx = 0; action_loop_idx < available_opts_list.length; ++action_loop_idx) {
                    var current_game_action = available_opts_list[action_loop_idx];
                    // If the pressed character matches an action's activation key.
                    if (current_game_action.activation_key === char_pressed) {
                        // Get potential targets for this action.
                        held_items_selection = active_player.get_potential_targets_for_action(current_game_action);
                        merging_active_flag = current_game_action.allows_combination; // Set combination flag.
                        primary_item_chosen = null; // Clear any previous primary item.
                        // Different scenarios based on the number of targets.
                        switch (held_items_selection.length) {
                            case 0:
                                current_game_action.execute_on_target(); // Perform action without a specific item (e.g., 'sleep').
                                held_items_selection = null; // Clear selection.
                                break;
                            case 1:
                                var single_target_obj = held_items_selection[0][0];
                                if (merging_active_flag) { // If combining, even with one item, prompt for a second.
                                    should_advance_game_turn = false; // Don't advance turn yet.
                                    break; // Stay in item selection.
                                }
                                if (current_game_action.requires_target_direction) {
                                    primary_item_chosen = single_target_obj;
                                    projectile_motion_enabled = true;
                                    should_advance_game_turn = false;
                                    break;
                                }
                                current_game_action.execute_on_target(single_target_obj); // Apply action to the single item.
                                held_items_selection = null; // Clear selection.
                                break;
                            default: // Multiple items: prompt the user to choose one.
                                should_advance_game_turn = false; // Don't advance turn, wait for item selection.
                        }
                        available_opts_list = null; // Clear the action list.
                        input_event_handled = true; // Mark event as handled.
                        break; // Exit action loop.
                    }
                }
            }
    }
    // If the keyboard input was handled by game logic, prevent default browser behavior.
    if (input_event_handled) {
        event_object.preventDefault();
        // Advance the game turn if indicated.
        if (should_advance_game_turn) {
            game_environment.advance_time_step();
        }
        display_game_status_view(); // Refresh the game's UI display.
    }
}

// Function to present the game's introductory narrative or welcome message.
function present_opening_narrative() {
    console.log("You have ventured into the old <s>basement</s> pipe system to repair all damaged conduits and vents.");
}

/*
// Optional browser event handler to warn the user before they navigate away from the page.
window.onbeforeunload = function (browser_event_obj) {
    browser_event_obj = browser_event_obj || window.event; // Standardize event object.
    if (browser_event_obj) {
        browser_event_obj.returnValue = "Are you certain you wish to depart?"; // Message for older browsers.
    }
    return "Are you certain you wish to depart?"; // Message for modern browsers.
};
*/

// Bind the keyboard input processing function to the document.
// It uses 'keypress' for browsers like Firefox and 'keydown' for others,
// leveraging a hypothetical browser detection utility.
$(document)['bind']($['browser_detection']['is_firefox'] ? 'keypress' : 'keydown', process_keyboard_input);

// --- Helper Functions and Constants ---

// A utility function to check if a given value falls within a specified range (inclusive min, exclusive max).
function check_range_validity(val_to_check, minimum_val, maximum_val) {
    return val_to_check >= minimum_val && val_to_check < maximum_val;
}

// A constant representing a specific type of item, e.g., for filtering drinkable items.
const LIQUID_ITEM_TYPE = 4; // Arbitrary numeric ID for 'drinkable' category.