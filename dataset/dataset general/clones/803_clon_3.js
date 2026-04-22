/*
 * Core configuration parameters for the interactive display system.
 * These values define the initial state and sizing rules for graphical elements.
 */
const CARD_ELEVATION_PX = 100; // Default height for a single display card in pixels.
const CARD_SPAN_PX = 60;       // Default width for a single display card in pixels.
const TOTAL_CARD_UNITS = 40;   // The total number of unique cards available in the collection.

let VIEWPORT_X = 800;          // Current horizontal extent of the display area.
let VIEWPORT_Y = 600;          // Current vertical extent of the display area.
// The original 'BOTTOM' constant has been deemed non-essential and removed.

const ANGULAR_SHIFT = Math.PI / 8; // Base angle for inclined card orientations.
const COMPLEMENTARY_ANGLE = Math.PI / 2 - ANGULAR_SHIFT; // Derived angle for trigonometric calculations.

let INCLINED_CARD_HEIGHT = Math.sin(COMPLEMENTARY_ANGLE) * CARD_ELEVATION_PX + 2; // Calculated height when card is tilted.
let INCLINED_CARD_WIDTH = Math.cos(COMPLEMENTARY_ANGLE) * CARD_ELEVATION_PX;     // Calculated width when card is tilted.
const ELEMENT_GAP = 2;                                                          // Small spacing between adjacent cards.
let STRUCTURE_SPAN = INCLINED_CARD_WIDTH * 2 + ELEMENT_GAP * 2;                 // Width of a base pyramid segment.

// A standard animation duration for sequential card placement.
const ANIMATION_INTERVAL_MS = 50;

/**
 * Dynamically adjusts the dimensions of display elements based on the container's current size.
 * This function ensures responsiveness by recalculating card and structure dimensions.
 */
function recalculate_dimensions_and_apply() {
  // Obtain the main visual container element.
  const viewport_element = document.getElementById('container');

  // Guard clause: If the container is not found, log an error and exit.
  if (!viewport_element) {
    console.error("Critical: Display container 'container' not found. Cannot recalculate dimensions.");
    return;
  }

  // Update global viewport dimensions.
  VIEWPORT_X = viewport_element.clientWidth;
  VIEWPORT_Y = viewport_element.clientHeight;

  // Recalculate card dimensions as a percentage of the viewport.
  // Original values were hardcoded, now made more dynamic.
  CARD_SPAN_PX = Math.floor(VIEWPORT_X * 0.05); // 5% of viewport width
  CARD_ELEVATION_PX = Math.floor(VIEWPORT_Y * 0.15); // 15% of viewport height

  // Re-derive tilted card dimensions and structure span using updated base card sizes.
  INCLINED_CARD_HEIGHT = Math.sin(COMPLEMENTARY_ANGLE) * CARD_ELEVATION_PX + 2;
  INCLINED_CARD_WIDTH = Math.cos(COMPLEMENTARY_ANGLE) * CARD_ELEVATION_PX;
  STRUCTURE_SPAN = INCLINED_CARD_WIDTH * 2 + ELEMENT_GAP * 2;

  // Iterate through all managed cards and apply new styles.
  for (let card_idx = 0; card_idx < CardCollectionManager.item_registry.length; ++card_idx) {
    const current_item = CardCollectionManager.access_item_by_index(card_idx);
    if (current_item && current_item.style) { // Ensure the element exists before attempting to style.
      current_item.style.height = `${CARD_ELEVATION_PX}px`;
      current_item.style.width = `${CARD_SPAN_PX}px`;
    }
  }
}

// Generate a set of random colors for the cards using an external utility.
const DISPLAY_COLORS_ARRAY = randomColor({
  count: TOTAL_CARD_UNITS,
  luminosity: 'dark',
});


/*
 * Enumeration and mapping for different card arrangement styles.
 */
const STACK_MODE = 1;      // Represents a simple, vertical stack formation.
const STRUCTURE_MODE = 2;  // Represents a house-like or pyramid structure.
const GRID_MODE = 3;       // Represents a flat, wall-like grid formation.
const CYLINDRICAL_MODE = 4; // Represents cards arranged in a circular, cylindrical pattern.

let active_display_mode; // Tracks the currently selected display mode.

// A registry mapping mode identifiers to their respective coordinate generation functions.
const layout_generators_registry = {
  [STACK_MODE]: generate_stack_coords,
  [STRUCTURE_MODE]: generate_house_structure_coords,
  [GRID_MODE]: produce_grid_formation_coords,
  [CYLINDRICAL_MODE]: calculate_circular_arrangement_coords,
};

/**
 * Creates and initializes a single display card element.
 * @param {HTMLElement} parent_node - The DOM element to which the card will be appended.
 * @param {number} item_idx - The sequential index of the card, used for color assignment.
 * @returns {HTMLElement} The newly created card element.
 */
function fabricate_display_element(parent_node, item_idx) {
  // Basic validation: ensure a parent node is provided.
  if (!parent_node) {
    console.warn("Cannot fabricate display element: parent node is null or undefined.");
    return null;
  }

  const display_item = document.createElement('div');
  display_item.className = 'card';
  // Assign a color from the pre-generated array, cycling if more cards than colors.
  display_item.style.background = DISPLAY_COLORS_ARRAY[item_idx % DISPLAY_COLORS_ARRAY.length];

  parent_node.appendChild(display_item); // Add the card to the DOM.
  return display_item;
}

// Module for managing the collection of display cards.
const CardCollectionManager = (function() {
  // Internal array to hold all card DOM elements.
  let item_registry = [];
  // Pointer to the next card to be retrieved for display.
  let current_item_pointer = 0;

  // Initialize all cards when the module is first created.
  for (let idx = 0; idx < TOTAL_CARD_UNITS; ++idx) {
    const parent_surface = document.getElementById('surface');
    // Ensure the surface exists before trying to add cards.
    if (parent_surface) {
      item_registry.push(fabricate_display_element(parent_surface, idx));
    } else {
      console.error("Main surface element 'surface' not found. Cards cannot be created.");
      break; // Stop creating cards if the surface is missing.
    }
  }

  // Public interface for the CardCollectionManager.
  return {
    item_registry: item_registry, // Expose the card array (read-only for direct manipulation).

    /**
     * Retrieves the next available card from the collection.
     * Increments the internal pointer.
     * @returns {HTMLElement|undefined} The next card element, or undefined if no more cards.
     */
    retrieve_next_item: function() {
      // Guard against requesting cards beyond the collection's bounds.
      if (current_item_pointer >= item_registry.length) {
        // Optionally, could log a warning here if all cards are used.
        return undefined; // No more cards available.
      }
      return item_registry[current_item_pointer++];
    },

    /**
     * Accesses a card by its specific index.
     * @param {number} target_idx - The index of the card to retrieve.
     * @returns {HTMLElement|undefined} The card element at the given index, or undefined if out of bounds.
     */
    access_item_by_index: function(target_idx) {
      // Basic bounds checking.
      if (target_idx < 0 || target_idx >= item_registry.length) {
        console.warn(`Attempted to access card at invalid index: ${target_idx}. Total cards: ${item_registry.length}`);
        return undefined;
      }
      return item_registry[target_idx];
    },

    /**
     * Resets the internal card pointer to the beginning of the collection,
     * making all cards available for retrieval again.
     */
    reset_item_pointer: function() {
      current_item_pointer = 0;
    }
  };
})(); // End of CardCollectionManager IIFE

/**
 * Arranges and animates cards according to a provided set of positions and rotations.
 * @param {Array<Object>} coordinate_set - An array of objects, each containing 'position' and 'rotation' arrays.
 */
function construct_layout_arrangement(coordinate_set) {
  CardCollectionManager.reset_item_pointer(); // Ensure cards are ready from the start.

  // Iterate through the desired positions and animate each card.
  for (let idx = 0; idx < coordinate_set.length; ++idx) {
    const current_card_element = CardCollectionManager.retrieve_next_item();

    // Only attempt to animate if a card was successfully retrieved.
    if (current_card_element) {
      snabbt(current_card_element, {
        position: coordinate_set[idx].position,
        rotation: coordinate_set[idx].rotation,
        easing: 'ease',
        delay: idx * ANIMATION_INTERVAL_MS // Staggered animation for visual effect.
      });
    } else {
      console.warn(`Not enough cards in CardCollectionManager for all specified positions. Stopped at index ${idx}.`);
      break; // Stop if we run out of cards.
    }
  }
}

/**
 * Changes the current display arrangement mode.
 * Recalculates dimensions and then builds the new formation if the mode is different.
 * @param {number} new_mode_identifier - The identifier for the desired display mode (e.g., STACK_MODE).
 */
function switch_arrangement_style(new_mode_identifier) {
  recalculate_dimensions_and_apply(); // Always update sizes before switching modes.

  // Guard clause: If the requested mode is already active, do nothing.
  if (Object.is(new_mode_identifier, active_display_mode)) {
    console.info(`Mode ${new_mode_identifier} is already active. No change needed.`);
    return;
  }

  // Retrieve the appropriate position generator function.
  const position_generator_function = layout_generators_registry[new_mode_identifier];

  // Validate that a generator exists for the requested mode.
  if (typeof position_generator_function === 'function') {
    const generated_coordinate_set = position_generator_function(); // Execute the generator.
    construct_layout_arrangement(generated_coordinate_set); // Apply the new formation.
    active_display_mode = new_mode_identifier; // Update the active mode.
    console.log(`Switched to display mode: ${new_mode_identifier}`);
  } else {
    console.error(`Error: No layout generator found for mode identifier: ${new_mode_identifier}`);
  }
}

/**
 * Applies a continuous rotation animation to the main display surface.
 * This creates a dynamic, revolving view of the card formations.
 */
function animate_main_stage_rotation() {
  const main_surface_element = document.getElementById('surface');

  // Critical check: Ensure the surface element exists before attempting animation.
  if (!main_surface_element) {
    console.error("Cannot animate: Main surface element 'surface' not found.");
    return;
  }

  snabbt(main_surface_element, {
    rotation: [0, 2 * Math.PI, 0], // Full 360-degree rotation around the Y-axis.
    duration: 10000,               // Animation duration in milliseconds.
    perspective: 2000,             // Sets a perspective for 3D effect.
    loop: Infinity                 // Loop the animation indefinitely.
  });
}

/**
 * Generates coordinates for a simple vertical card stack formation.
 * Cards are stacked slightly offset in Z-depth.
 * @returns {Array<Object>} An array of position and rotation objects for the stack.
 */
function generate_stack_coords() {
  // Deck reset moved to `construct_layout_arrangement` for consistency.
  let coordinate_set = [];
  let current_item_pointer_local = 0; // Use a local counter for this function's loop.

  const central_point_x = (VIEWPORT_X - CARD_SPAN_PX) / 2; // Horizontal center.
  const base_pos_y = VIEWPORT_Y - VIEWPORT_Y * 0.2;       // Vertical base line.
  const initial_z_offset = VIEWPORT_X * 0.1;              // Z-depth for the stack.

  // Loop through all cards, creating positions.
  while (current_item_pointer_local < TOTAL_CARD_UNITS) {
    coordinate_set.push({
      position: [central_point_x, base_pos_y - current_item_pointer_local * 0.5, initial_z_offset],
      rotation: [Math.PI / 2, 0, 0], // Cards are rotated to face upwards.
    });
    ++current_item_pointer_local;
  }
  return coordinate_set;
}

/**
 * Generates coordinates for a multi-floor "house" or pyramid-like structure.
 * This formation uses tilted cards to build layers.
 * @returns {Array<Object>} An array of position and rotation objects for the house structure.
 */
function generate_house_structure_coords() {
  // Deck reset moved to `construct_layout_arrangement`.

  const level_count = 5; // Number of floors/levels in the house.

  // Calculate starting Y position for the top-most floor.
  const start_y_position = (level_count - 1) * INCLINED_CARD_HEIGHT + INCLINED_CARD_HEIGHT / 2;
  const fixed_z_depth = -VIEWPORT_X * 0.2; // A fixed Z-depth for the structure.

  // Calculate starting X position to center the widest part of the base.
  const start_x_position = (VIEWPORT_X - STRUCTURE_SPAN * level_count) / 2 - INCLINED_CARD_WIDTH;

  let all_structure_coordinates = [];

  // Build each floor from top to bottom.
  for (let current_floor_idx = 0; current_floor_idx < level_count; ++current_floor_idx) {
    const floor_x_offset = start_x_position + current_floor_idx * INCLINED_CARD_WIDTH + current_floor_idx * ELEMENT_GAP;
    const floor_y_offset = start_y_position - current_floor_idx * INCLINED_CARD_HEIGHT - current_floor_idx * ELEMENT_GAP;

    // Concatenate positions for the current floor's tilted and bridge cards.
    const floor_coords = create_house_level_coords(
      level_count - current_floor_idx, // Number of segments in this floor.
      floor_x_offset,
      floor_y_offset,
      fixed_z_depth
    );
    all_structure_coordinates = all_structure_coordinates.concat(floor_coords);
  }

  return all_structure_coordinates;
}

/**
 * Helper function to generate positions for a single row (level) of the house structure.
 * Includes both the tilted support cards and the horizontal 'bridge' cards.
 * @param {number} segment_count - The number of pyramid segments in this row.
 * @param {number} base_x - The starting X coordinate for this row.
 * @param {number} base_y - The starting Y coordinate for this row.
 * @param {number} base_z - The Z coordinate for this row.
 * @returns {Array<Object>} An array of position and rotation objects for the row.
 */
function create_house_level_coords(segment_count, base_x, base_y, base_z) {
  let row_coordinates = [];
  let current_card_pos_data; // Temporary variable to hold pyramid segment data.

  // Generate positions for the tilted support cards (forming the 'pyramid' segments).
  for (let idx_segment = 0; idx_segment < segment_count; ++idx_segment) {
    current_card_pos_data = derive_pyramid_segment_coords(base_x + idx_segment * STRUCTURE_SPAN, base_y, base_z);
    row_coordinates.push({
      position: current_card_pos_data[0].position,
      rotation: current_card_pos_data[0].rotation,
    });
    row_coordinates.push({
      position: current_card_pos_data[1].position,
      rotation: current_card_pos_data[1].rotation,
    });
  }

  // Generate positions for the horizontal 'bridge' cards that span between segments.
  if (segment_count > 1) { // Only add bridges if there's more than one segment.
    for (let idx_bridge = 0; idx_bridge < segment_count - 1; ++idx_bridge) {
      const bridge_x = base_x + idx_bridge * STRUCTURE_SPAN + INCLINED_CARD_WIDTH;
      const bridge_y = base_y - INCLINED_CARD_HEIGHT / 2 - ELEMENT_GAP / 2;
      row_coordinates.push({
        position: [bridge_x, bridge_y, base_z],
        rotation: [Math.PI / 2, Math.PI / 2, 0], // Horizontal rotation for bridge cards.
      });
    }
  } else {
    // Debugging note: A single segment row won't have bridge cards.
    // console.log(`Floor with ${segment_count} segment(s) has no bridge cards.`);
  }

  return row_coordinates;
}

/**
 * Calculates the positions and rotations for two cards forming a single pyramid-like segment.
 * These are the tilted cards that support the structure.
 * @param {number} center_x - The central X coordinate for this segment.
 * @param {number} center_y - The central Y coordinate for this segment.
 * @param {number} center_z - The central Z coordinate for this segment.
 * @returns {Array<Object>} An array containing two position/rotation objects.
 */
function derive_pyramid_segment_coords(center_x, center_y, center_z) {
  // Add a small offset to prevent visual flickering due to overlapping elements,
  // especially in certain browsers like Firefox.
  const interstitial_gap = (INCLINED_CARD_WIDTH / 2) + ELEMENT_GAP / 2;

  // Return coordinates for the two tilted cards that form the segment.
  return [{
    position: [center_x - interstitial_gap, center_y, center_z],
    rotation: [-ANGULAR_SHIFT, Math.PI / 2, 0], // Tilted left.
  }, {
    position: [center_x + interstitial_gap, center_y, center_z],
    rotation: [ANGULAR_SHIFT, Math.PI / 2, 0], // Tilted right.
  }];
}

/**
 * Generates coordinates for a flat, grid-like "wall" formation of cards.
 * Cards are arranged in rows and columns.
 * @returns {Array<Object>} An array of position and rotation objects for the wall.
 */
function produce_grid_formation_coords() {
  let coordinate_set = [];
  const column_count = 10; // Number of cards per row.
  const row_count = Math.ceil(TOTAL_CARD_UNITS / column_count); // Number of rows.

  // Define dimensions for each grid cell.
  const cell_width_unit = CARD_SPAN_PX + 10;
  const cell_height_unit = CARD_ELEVATION_PX + 10;

  // Calculate starting offsets to center the grid on the viewport.
  const initial_x_offset = (VIEWPORT_X - column_count * cell_width_unit) / 2;
  const initial_y_offset = (VIEWPORT_Y - row_count * cell_height_unit) / 2;

  // Populate positions for each card in the grid.
  for (let idx = 0; idx < TOTAL_CARD_UNITS; ++idx) {
    const col_idx = idx % column_count;
    const row_idx = Math.floor(idx / column_count);

    const pos_x = col_idx * cell_width_unit + initial_x_offset;
    const pos_y = row_idx * cell_height_unit + initial_y_offset;

    coordinate_set.push({
      position: [pos_x, pos_y, 0], // Cards are flat on the Z-plane.
      rotation: [0, 0, 0]          // No rotation.
    });
  }
  return coordinate_set;
}

/**
 * Generates coordinates for cards arranged in a cylindrical pattern.
 * Cards are positioned around a central axis with varying Y-heights.
 * @returns {Array<Object>} An array of position and rotation objects for the cylinder.
 */
function calculate_circular_arrangement_coords() {
  let coordinate_set = [];
  const cards_per_ring = 10; // Number of cards in each horizontal ring.

  // Define starting coordinates for the cylinder.
  const central_x_axis = VIEWPORT_X / 2;
  const starting_y_level = VIEWPORT_Y * 0.1;
  const circular_radius = VIEWPORT_X * 0.2; // Radius of the cylinder.

  for (let idx = 0; idx < TOTAL_CARD_UNITS; ++idx) {
    const ring_position = idx % cards_per_ring;
    const vertical_level = Math.floor(idx / cards_per_ring);

    // Calculate angle for current card in the ring.
    const radial_angle = (ring_position / cards_per_ring) * 2 * Math.PI;

    // Calculate X and Z coordinates based on angle and radius.
    const pos_x = Math.cos(radial_angle) * circular_radius + central_x_axis;
    const pos_z = Math.sin(radial_angle) * circular_radius;
    // Calculate Y coordinate, adjusting for card height and spacing.
    const pos_y = vertical_level * (CARD_ELEVATION_PX * 1.2) + starting_y_level;

    coordinate_set.push({
      position: [pos_x, pos_y, pos_z],
      rotation: [0, Math.PI / 2 + radial_angle, 0], // Rotate cards to face outwards from cylinder center.
    });
  }
  return coordinate_set;
}

// Wrapper functions for activating specific display modes.
function activate_grid_view() {
  switch_arrangement_style(GRID_MODE);
}

function activate_house_view() {
  switch_arrangement_style(STRUCTURE_MODE);
}

function activate_stack_view() {
  switch_arrangement_style(STACK_MODE);
}

/**
 * Initializes the application: sets up initial display, animations, and event listeners.
 */
function initialize_application_setup() {
  recalculate_dimensions_and_apply(); // Set initial sizes based on viewport.
  CardCollectionManager.reset_item_pointer(); // Ensure card pointer is at start.
  activate_stack_view(); // Display the initial stack formation.
  animate_main_stage_rotation(); // Start the continuous container rotation.

  // Initialize FastClick for improved mobile responsiveness on button clicks.
  FastClick.attach(document.body);

  // Map button IDs to their corresponding display mode constants.
  const mode_buttons_map = {
    "pile_button": STACK_MODE,
    "house_button": STRUCTURE_MODE,
    "wall_button": GRID_MODE,
    "cylinder_button": CYLINDRICAL_MODE
  };

  /**
   * Universal click handler for mode selection buttons.
   * Updates button styling and switches the display mode.
   * @param {string} button_id_str - The ID of the clicked button.
   */
  const button_activation_handler = function(button_id_str) {
    // Reset styling for all mode buttons.
    // This could be refactored into a helper function for cleaner code.
    document.getElementById('pile_button').className = '';
    document.getElementById('house_button').className = '';
    document.getElementById('wall_button').className = '';
    document.getElementById('cylinder_button').className = '';

    // Apply active style to the clicked button.
    const target_button = document.getElementById(button_id_str);
    if (target_button) {
      target_button.className = 'button-primary';
    } else {
      console.warn(`Button with ID '${button_id_str}' not found.`);
      return; // Exit if button not found to prevent errors.
    }

    // Switch the display mode using the mapped constant.
    switch_arrangement_style(mode_buttons_map[button_id_str]);
  };

  // Attach event listeners to all mode selection buttons.
  for (const button_id in mode_buttons_map) {
    if (Object.prototype.hasOwnProperty.call(mode_buttons_map, button_id)) {
      const btn_element = document.getElementById(button_id);
      if (btn_element) {
        btn_element.addEventListener('click', button_activation_handler.bind(undefined, button_id));
      } else {
        console.error(`Initialization error: Button '${button_id}' not found in the DOM.`);
      }
    }
  }
}