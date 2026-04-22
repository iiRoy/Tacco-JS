var actions = null; /* Global variable to store available actions */

var objects = null; // Global variable to store available objects for interaction

var combine = false; // Flag indicating if an item combination is in progress

var first_object = null; // Stores the first object selected for combination or throwing

var throw_obj = false; // Flag indicating if an object is being thrown


/**
 * Updates the game panel with hero status, visible objects, and available actions.
 */
function panel() {
    // If the map is not yet initialized, exit early.
    if (map == null) {
        return;
    }

    // Retrieve hero and their current level from the map.
    var hero = map.hero,
        level = hero.level;

    /*
     * Build the HTML content for the panel.
     * First, display hero's name and level information.
     */
    var html = "<dl><dt id='f'>" + hero.name + " the Fontanero<small>Level: " + hero.level + " (" + hero.levels[level - 1] + ")</small></dt><dd>";

    // Add hero's HP, including status effects if present.
    html += "<b>HP:</b> " + hero.hp + " (" + hero.max_hp() + ")" +
        (hero.poisoned ? " <b id='ps'>[POISONED]</b> " : "") +
        (hero.blinded ? " <b id='bl'>[BLINDED]</b>" : "") +
        (hero.confused ? " <b id='cf'>[CONFUSED]</b>" : "") +
        "<br>";

    // Display hero's cash and pipe-related stats.
    html += "<b>Cash:</b> $" + hero.cash + " / " + hero.level_cap() + "<br>" +
        "<b>Pipes found:</b> " + map.pipes + "<br><b>Pipes fixed:</b> " + map.fixed;

    // Handle the 'throw object' state.
    if (throw_obj) {
        html += '<dt>Choose direction:</dt><dd>Press up, down, left or right to throw ' + first_object.name + '</dd>';
        // Update the panel and return, as further panel content is not needed in this state.
        $('#panel')['html'](html);
        return;
    }
    // Handle the 'choose item' state.
    else if (objects) {
        html += '<dt>Choose item:</dt><dd><ol>';
        // List all available objects for selection.
        for (var i = 0; i < objects.length; ++i) {
            var o = objects[i];
            html += "<li>" + o[0].name + "</li>";
        }
        html += '</ol></dd>';
        // Update the panel and return, as further panel content is not needed in this state.
        $('#panel')['html'](html);
        return;
    }
    // Default state: display hero's inventory.
    else {
        html += '<dt>You are carrying:</dt><dd>' + hero.inv + '</dd>';
    }

    // IMPORTANT: actions must be retrieved first, as it might trigger auto-pickup or other side effects.
    actions = hero.get_actions();

    // Get objects present in the hero's current cell.
    var objs = hero.cell.objects;
    var mask = 0; // Mask for object types (not used in display directly, but calculated).

    html += '<dt>You see:</dt><dd>';

    // If there are objects in the cell, list them.
    if (objs.length) {
        for (var i = 0; i < objs.length; ++i) {
            var o = objs[i];
            mask |= o.type; // Update the type mask.
            html += (i ? ', ' : '') + o.name; // Separate with commas if not the first object.
        }
    }
    // If no objects are seen.
    else {
        html += 'nothing';
    }
    html += "</dd>";

    // Display available actions.
    html += '<dt>Actions:</dt><dd id="a"><ul>';
    for (var i = 0; i < actions.length; ++i) {
        html += '<li>' + actions[i].name + "</li>";
    }
    html += '</ul></dd>';

    // Finally, update the HTML content of the panel element.
    $('#panel')['html'](html);
}


/**
 * Handles keyboard input for game actions.
 * @param {Event} e The keyboard event object.
 */
function on_key(e) {
    var h = map.hero; // Shorthand for the hero object.

    // Check for conditions that prevent key input from being processed:
    // - Map not loaded.
    // - Meta key (e.g., Command on Mac) is pressed.
    // - Mini-game is visible.
    // - Hero's HP is zero or less.
    if (map == null || e.metaKey || $("#mg")['is'](":visible") || h.hp <= 0) {
        return;
    }

    var key = e.which || e.keyCode; // Get the key code.
    var key_char = String.fromCharCode(key).toLowerCase(); // Convert key code to character.
    key = key_char.charCodeAt(0); // Convert character back to ASCII code (for comparison).

    var used = false; // Flag to indicate if the key press was handled by the game.
    var call_tick = true; // Flag to indicate if the game should tick after the action.

    // The commented line below was used for debugging.
    // log("key " + key + "(" + key_char + ")");

    // Process key input based on the key code.
    switch (key) {
        case 27: // Escape key
            used = true;
            combine = false; // Reset combination flag.
            throw_obj = false; // Reset throw object flag.
            first_object = null; // Clear the first selected object.
            break;

        case 37: // Left arrow
        case 38: // Up arrow
        case 39: // Right arrow
        case 40: // Down arrow
            // Calculate change in x (dx) and y (dy) based on arrow key.
            var dx = [-1, 0, 1, 0][key - 37],
                dy = [0, -1, 0, 1][key - 37];

            // If hero is confused, reverse movement direction.
            if (h.confused > 0) {
                dx = -dx;
                dy = -dy;
            }

            // If in throw object mode, throw the object.
            if (throw_obj) {
                h.throw_obj(first_object, dx, dy);
                call_tick = false; // Throwing an object doesn't necessarily advance time.
            }
            // Otherwise, move the hero.
            else {
                h.move(dx, dy);
            }

            used = true; // Key was used.
            throw_obj = false; // Reset throw object flag.
            first_object = null; // Clear the first selected object.
            objects = null; // Clear selected objects list.
            break;

        default:
            // Handle cases where the player is choosing an object.
            if (objects != null) {
                var i = key - 0x61; // Calculate index from 'a' (ASCII 97 or 0x61).
                // Check if the calculated index is within the range of available objects.
                if (in_range(i, 0, objects.length)) {
                    var o = objects[i]; // Get the selected object data.
                    var a = o[1],
                        obj = o[0]; // Extract action and object.

                    // If combining and no first object is selected yet.
                    if (combine && first_object == null) {
                        first_object = obj; // Set this as the first object.
                        objects = h.get_objects(a, DRINKABLE); // Get drinkable objects for combination.
                        call_tick = false; // No game tick yet.
                        used = true; // Key was used.
                        break;
                    }

                    // If the action requires a direction (e.g., throwing).
                    if (a.need_dir) {
                        first_object = obj; // Set this as the object to be thrown.
                        throw_obj = true; // Enter throw mode.
                        call_tick = false; // No game tick yet.
                        used = true; // Key was used.
                        break;
                    }

                    // Apply the action to the object (and potentially the first_object for combination).
                    a.apply(obj, first_object);
                }
                used = true; // Key was used.
                objects = null; // Clear selected objects list.
            }
            // Handle cases where the player is choosing an action.
            else if (actions != null) {
                // Iterate through available actions.
                for (var i = 0; i < actions.length; ++i) {
                    var a = actions[i];
                    // If the pressed key matches an action's key.
                    if (a.key == key_char) {
                        objects = h.get_objects(a); // Get objects relevant to this action.
                        combine = a.combine; // Set combine flag if action is for combination.
                        first_object = null; // Clear any previous first object selection.

                        // Handle different scenarios based on the number of relevant objects.
                        switch (objects.length) {
                            case 0: // No objects found for the action.
                                a.apply(); // Apply the action without an object (e.g., 'sleep').
                                objects = null; // Clear objects.
                                break;
                            case 1: // Exactly one object found.
                                var obj = objects[0][0];
                                if (combine) { // If combining, even one object needs selection.
                                    call_tick = false; // No game tick yet.
                                    break;
                                }
                                if (a.need_dir) { // If action needs direction.
                                    first_object = obj; // Set as object to be directed.
                                    throw_obj = true; // Enter throw mode.
                                    call_tick = false; // No game tick yet.
                                    break;
                                }
                                a.apply(obj); // Apply action to the single object.
                                objects = null; // Clear objects.
                                break;
                            default: // Multiple objects found, player needs to choose.
                                call_tick = false; // No game tick yet, waiting for selection.
                        }
                        actions = null; // Clear actions list.
                        used = true; // Key was used.
                        break; // Exit action loop.
                    }
                }
            }
    }

    // If the key press was handled.
    if (used) {
        e.preventDefault(); // Prevent default browser action (e.g., scrolling with arrow keys).
        if (call_tick) {
            map.tick(); // Advance game time if call_tick is true.
        }
        panel(); // Update the game panel after the action.
    }
}


/**
 * Displays an introductory message to the player.
 */
function intro() {
    log("You've entered the <s>dungeon</s> cellar to fix all broken pipes and vents.");
}


/*
// The following code block is commented out.
// It typically handles a confirmation prompt before the user leaves the page.
// window.onbeforeunload = function (evt) {
//     evt = evt || window.event; // Get the event object.
//     if (evt) {
//         evt.returnValue = "Are you sure you want to leave?"; // Set confirmation message.
//     }
//     return message; // Return message for older browsers.
// }
*/


// Bind the on_key function to keyboard events.
// Uses 'keypress' for Mozilla browsers and 'keydown' for others for consistent event handling.
$(document)['bind']($['browser']['mozilla'] ? 'keypress' : 'keydown', on_key);