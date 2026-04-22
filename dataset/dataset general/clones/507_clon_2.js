/* Global scope references: window, document, jQuery */

// The current status of each grid element is stored as a numeric value.
// The lower 24 bits of this number represent different aspects of a
// multi-layered simulation. These status values are held in the
// current_pattern_data array. The get_element_position function converts
// (row_idx, column_idx) into an index for this data vector.
//
// To prevent performance hitches from garbage collection during active
// animation, we avoid dynamic memory allocations.
//
// advance_generation() computes the subsequent state into next_pattern_data
// and then switches the current and next states.
// refresh_view() updates a canvas element with the contents of current_pattern_data.


var GRID_WIDTH = 100; // Number of columns in our simulation grid.
var GRID_HEIGHT = 100; // Number of rows in our simulation grid.
// An extra boundary row/column simplifies neighbor logic later.
var total_grid_elements = GRID_WIDTH * GRID_HEIGHT; // Total number of cells in the grid.
var current_pattern_data = new Array(total_grid_elements); // Stores the states for the current simulation step.
var next_pattern_data = new Array(total_grid_elements); // Stores the states for the next simulation step.
var display_surface;   // The HTML <canvas> element used for visual output.
var render_context;      // The 2D rendering context of the canvas.
var pixel_buffer; // An internal 32-bit per pixel buffer for efficient drawing.
var timer_handle;  // Identifier for the setInterval timer, used to control simulation speed.
var simulation_active;  // Boolean flag indicating if the simulation is currently running.

function assign_element_shade(status_array, element_id, red_val, green_val, blue_val) {
  // A white cell means 'dead', a black cell means 'alive'. So we invert the color components.
  status_array[element_id] = ~((red_val << 16) + (green_val << 8) + blue_val) & 0xffffff;
}

function get_element_position(column_idx, row_idx) {
  return row_idx * GRID_WIDTH + column_idx;
}

function calculate_tile_dimension() {
  const viewport_width = window.innerWidth;
  const viewport_height = window.innerHeight;
  return Math.max(Math.ceil(viewport_width / GRID_WIDTH), Math.ceil(viewport_height / GRID_HEIGHT));
}

function refresh_view() {
  let row_idx, column_idx, tile_row, tile_column;
  let cell_color_value;
  let pixel_offset;
  const viewport_width = window.innerWidth;
  const viewport_height = window.innerHeight;
  const tile_size = calculate_tile_dimension();
  if (!pixel_buffer || display_surface.width !== viewport_width || display_surface.height !== viewport_height) {
    display_surface.setAttribute('width', viewport_width);
    display_surface.setAttribute('height', viewport_height);
    pixel_buffer = render_context.createImageData(tile_size * GRID_WIDTH, tile_size * GRID_HEIGHT);
  }
  // Using createImageData and putImageData is significantly faster (e.g., 4x in Chrome)
  // than using fillStyle and fillRect for drawing many small rectangles.
  const row_byte_length = tile_size * GRID_WIDTH; // Stride in terms of tiles, not pixels, for the outer loop.
  for (row_idx = 0; row_idx < GRID_HEIGHT; row_idx++) {
    if (row_idx * tile_size > viewport_height) { /* Stop rendering if cells are off-screen vertically. */ break; }
    for (column_idx = 0; column_idx < GRID_WIDTH; column_idx++) {
      if (column_idx * tile_size > viewport_width) { /* Stop rendering if cells are off-screen horizontally. */ break; }
      cell_color_value = ~current_pattern_data[get_element_position(column_idx, row_idx)] & 0xffffff;
      for (tile_row = 0; tile_row < tile_size; tile_row++) {
        for (tile_column = 0; tile_column < tile_size; tile_column++) {
          pixel_offset =
            ((row_idx * tile_size + tile_row) * row_byte_length + (column_idx * tile_size + tile_column)) * 4;
          pixel_buffer.data[pixel_offset] = (cell_color_value >> 16) & 0xff;     // Red component
          pixel_buffer.data[pixel_offset + 1] = (cell_color_value >> 8) & 0xff; // Green component
          pixel_buffer.data[pixel_offset + 2] = (cell_color_value >> 0) & 0xff; // Blue component
          pixel_buffer.data[pixel_offset + 3] = 0xff;                            // Alpha component (fully opaque)
        }
      }
    }
  }
  render_context.putImageData(pixel_buffer, 0, 0);
}

function reset_grid() {
  let counter_var;
  for (counter_var = 0; counter_var < total_grid_elements; counter_var++) {
    current_pattern_data[counter_var] = 0; // Initialize all cells to a 'dead' state.
  }
  refresh_view(); // Update the visual representation to reflect the cleared grid.
}

function apply_random_tints() {
  let row_idx, column_idx, red_val, green_val, blue_val;
  for (row_idx = 0; row_idx < GRID_HEIGHT; row_idx++) {
    for (column_idx = 0; column_idx < GRID_WIDTH; column_idx++) {
      red_val = Math.round(Math.random() * 255);
      green_val = Math.round(Math.random() * 255);
      blue_val = Math.round(Math.random() * 255);
      assign_element_shade(current_pattern_data, get_element_position(column_idx, row_idx), red_val, green_val, blue_val);
    }
  }
  refresh_view(); // Display the grid with newly assigned random colors.
}

function advance_generation() {
  let row_idx, column_idx, element_id;
  let bit_accumulator_0, bit_accumulator_1, bit_accumulator_2; // Used as a 3-bit counter for neighbors.
  let neighbor_row, neighbor_col, wrapped_neighbor_col, wrapped_neighbor_row, neighbor_state;
  for (row_idx = 0; row_idx < GRID_HEIGHT; row_idx++) {
    for (column_idx = 0; column_idx < GRID_WIDTH; column_idx++) {
      element_id = get_element_position(column_idx, row_idx);
      // This section implements a 24-way parallel 3-bit counter for live neighbors
      // using bitwise operations. This is efficient for determining neighbor counts
      // across multiple 'game of life' layers simultaneously.
      // Note: If the count exceeds 7 (i.e., 8 or 9 live neighbors), the counter will
      // wrap around (e.g., to 0 or 1). However, for Conway's Game of Life rules,
      // cells with 8 or 9 neighbors always die, so the wrap-around does not affect
      // the final outcome for these cases.
      bit_accumulator_0 = 0; // Least significant bit of the neighbor count.
      bit_accumulator_1 = 0; // Middle bit of the neighbor count.
      bit_accumulator_2 = 0; // Most significant bit of the neighbor count.
      for (neighbor_row = row_idx - 1; neighbor_row <= row_idx + 1; neighbor_row++) {
        for (neighbor_col = column_idx - 1; neighbor_col <= column_idx + 1; neighbor_col++) {
          if (neighbor_row === row_idx && neighbor_col === column_idx) { continue; } // Skip the current cell itself.
          wrapped_neighbor_col = (neighbor_col + GRID_WIDTH) % GRID_WIDTH; // Wrap column index for toroidal grid.
          wrapped_neighbor_row = (neighbor_row + GRID_HEIGHT) % GRID_HEIGHT; // Wrap row index for toroidal grid.
          neighbor_state = current_pattern_data[get_element_position(wrapped_neighbor_col, wrapped_neighbor_row)];
          // Update the 3-bit counter using XOR and AND for bitwise addition with carry.
          bit_accumulator_2 ^= bit_accumulator_1 & bit_accumulator_0 & neighbor_state; // Carry to bit 2.
          bit_accumulator_1 ^= bit_accumulator_0 & neighbor_state; // Carry to bit 1.
          bit_accumulator_0 ^= neighbor_state; // Add to bit 0.
        }
      }
      // The rules for Conway's Game of Life are applied here.
      // A cell becomes alive if it has exactly 3 neighbors (s2=0, s1=1, s0=1).
      // A living cell remains alive if it has 2 or 3 neighbors (s2=0, s1=1, s0=x).
      // All other cases result in a dead cell.
      // This bitwise expression implements: (!s2 && s1 && (current_state || s0))
      // where (current_state || s0) handles the 2 or 3 neighbor cases for a live cell.
      next_pattern_data[element_id] = ~bit_accumulator_2 & bit_accumulator_1 & (current_pattern_data[element_id] | bit_accumulator_0) & 0xffffff;
    }
  }
  // Swap the current and next state buffers for the next iteration.
  const temp_array_ref = current_pattern_data;
  current_pattern_data = next_pattern_data;
  next_pattern_data = temp_array_ref;
  refresh_view(); // Update the visual display with the new generation.
}

function load_configuration(config_index) {
  config_index = config_index || 0; // Default to the first configuration if none specified.
  function assign_fixed_color(red_val, green_val, blue_val) {
    return function(_ignored_item, coordinates) {
      assign_element_shade(current_pattern_data, get_element_position(coordinates[0], coordinates[1]), red_val, green_val, blue_val);
    };
  }
  switch(config_index) {
    case 0: // Configuration 0: Example pattern (e.g., a "pulsar" or similar symmetrical structure).
      jQuery([[41,23], [42,23], [43,23], [44,23], [45,23], [46,23], [47,23], [48,23],
        [41,26], [42,26], [43,26], [44,26], [45,26], [46,26], [47,26], [48,26]]
      ).map(assign_fixed_color(54, 99, 204)); // Blueish shade.
      jQuery([[41,22], [42,22], [43,22], [44,22], [45,22], [46,22], [47,22], [48,22],
        [41,27], [42,27], [43,27], [44,27], [45,27], [46,27], [47,27], [48,27]]
      ).map(assign_fixed_color(40, 187, 130)); // Greenish shade.
      jQuery([[41,21], [42,21], [43,21], [44,21], [45,21], [46,21], [47,21], [48,21],
        [41,28], [42,28], [43,28], [44,28], [45,28], [46,28], [47,28], [48,28]]
      ).map(assign_fixed_color(170, 37, 37)); // Reddish shade.
      break;

    case 1: // Configuration 1: Another example pattern, possibly a "spacefiller" or a long line.
      jQuery([[25,25], [26,25], [27,25], [28,25], [29,25], [30,25], [31,25], [32,25],
         [34,25], [35,25], [36,25], [37,25], [38,25], [42,25], [43,25], [44,25],
         [51,25], [52,25], [53,25], [54,25], [55,25], [56,25], [57,25], [59,25],
         [60,25], [61,25], [62,25], [63,25]
      ]).map(assign_fixed_color(25, 57, 150)); // Dark blue.
      jQuery([[25,26], [26,26], [27,26], [28,26], [29,26], [30,26], [31,26], [32,26],
         [34,26], [35,26], [36,26], [37,26], [38,26], [42,26], [43,26], [44,26],
         [51,26], [52,26], [53,26], [54,26], [55,26], [56,26], [57,26], [59,26],
         [60,26], [61,26], [62,26], [63,26]
      ]).map(assign_fixed_color(57, 150, 25)); // Green.
      jQuery([[25,27], [26,27], [27,27], [28,27], [29,27], [30,27], [31,27], [32,27],
         [34,27], [35,27], [36,27], [37,27], [38,27], [42,27], [43,27], [44,27],
         [51,27], [52,27], [53,27], [54,27], [55,27], [56,27], [57,27], [59,27],
         [60,27], [61,27], [62,27], [63,27]
      ]).map(assign_fixed_color(150, 57, 25)); // Orange-red.
      break;

    case 3: // Configuration 3: A simple Glider pattern.
      jQuery([[0, 1],[1,2],[2,0],[2,1],[2,2]]).map(assign_fixed_color(0,0,0)); // Black cells.
      break;
  }
  refresh_view(); // Show the newly loaded pattern on the canvas.
}

var drawing_active = false;   // Flag indicating if the drawing tool is currently enabled.
var drawing_hue = {r:0, g:0, b:0};  // Stores the currently selected color for drawing.
var mouse_button_pressed = false;  // Flag: is drawing tool enabled AND mouse button down?
var last_drawn_column = null;  // Stores the column index of the last cell drawn to prevent redundant updates.
var last_drawn_row = null; // Stores the row index of the last cell drawn.

function determine_drawing_coords(event_object) {
  const display_offset = jQuery('#display').offset(); // Get the position of the canvas on the page.
  const tile_size = calculate_tile_dimension();
  const column_idx = Math.floor((event_object.clientX - display_offset.left) / tile_size);
  const row_idx = Math.floor((event_object.clientY - display_offset.top) / tile_size);
  return {
    row: row_idx,
    col: column_idx
  };
}

function handle_pen_press(event_object) {
  mouse_button_pressed = true; // Indicate that the mouse button is now down.
  const current_coords = determine_drawing_coords(event_object);
  assign_element_shade(current_pattern_data, get_element_position(current_coords.col, current_coords.row),
                 drawing_hue.r, drawing_hue.g, drawing_hue.b);
  if (!simulation_active) { refresh_view(); } // Only update display immediately if simulation is paused.
}

function handle_pen_release() {
  mouse_button_pressed = false; // Indicate that the mouse button has been released.
  last_drawn_column = null; // Reset last drawn position to allow drawing at the same spot next time.
  last_drawn_row = null;
}

function handle_pen_drag(event_object) {
  if (mouse_button_pressed) { // Only draw if the drawing tool is active and mouse button is held.
    const current_coords = determine_drawing_coords(event_object);
    // Check if the mouse has moved to a new cell to avoid re-drawing the same cell repeatedly.
    if (current_coords.row !== last_drawn_row || current_coords.col !== last_drawn_column) {
      assign_element_shade(current_pattern_data, get_element_position(current_coords.col, current_coords.row),
                     drawing_hue.r, drawing_hue.g, drawing_hue.b);
      if (!simulation_active) { refresh_view(); } // Update display if not actively simulating.
    }
    last_drawn_row = current_coords.row; // Store current position for next comparison.
    last_drawn_column = current_coords.col;
  }
}

function switch_drawing_tool() {
  drawing_active = !drawing_active; // Toggle the drawing tool's active state.
  if (drawing_active) {
    // Attach event listeners for drawing actions.
    jQuery('#display').on('mousedown.pencil_tool', handle_pen_press);
    jQuery('#display').on('mousemove.pencil_tool', handle_pen_drag);
    jQuery('#display').on('mouseup.pencil_tool', handle_pen_release);
    jQuery('#display').addClass('pencil_cursor'); // Change cursor style.
    jQuery('#pencil-btn').addClass('selected_tool'); // Highlight the pencil button.
  } else {
    // Remove event listeners when the drawing tool is deactivated.
    jQuery('#display').off('mousedown.pencil_tool');
    jQuery('#display').off('mousemove.pencil_tool');
    jQuery('#display').off('mouseup.pencil_tool');
    jQuery('#display').removeClass('pencil_cursor'); // Revert cursor style.
    jQuery('#pencil-btn').removeClass('selected_tool'); // Un-highlight the button.
  }
}

function start_process() {
  simulation_active = true; // Set the simulation flag to true.
  timer_handle = setInterval(advance_generation, 100); // Start the simulation loop, updating every 100ms.
  jQuery('#play').hide(); // Hide the 'Play' button.
  jQuery('#pause').show(); // Show the 'Pause' button.
}

function halt_process() {
  simulation_active = false; // Set the simulation flag to false.
  clearInterval(timer_handle); // Stop the simulation interval timer.
  jQuery('#play').show(); // Show the 'Play' button.
  jQuery('#pause').hide(); // Hide the 'Pause' button.
}

jQuery(function() {
  display_surface = document.getElementById('display'); // Get the canvas element by its ID.
  render_context = display_surface.getContext('2d'); // Obtain the 2D rendering context.
  
  jQuery('#pencil-btn').on('click', switch_drawing_tool); // Attach click handler to the pencil button.
  jQuery('#pencil-btn').ColorPicker({ // Initialize a color picker for the pencil tool.
    onShow: function() {
      return drawing_active; // Only show the color picker if the drawing tool is active.
    },
    onChange: function(hsv_value, hex_string, rgb_object) {
      drawing_hue = rgb_object; // Update the drawing color with the new RGB values.
      jQuery('#swatch').css('background-color', '#' + hex_string); // Update a color swatch display.
    }
  });
  jQuery(window).on('resize', function() {
    if (!simulation_active) { refresh_view(); } // Re-render the display on window resize if simulation is paused.
  });

  reset_grid(); // Clear the grid to an initial empty state.
  apply_random_tints(); // Fill the grid with random colors.
  start_process(); // Begin the simulation.
});